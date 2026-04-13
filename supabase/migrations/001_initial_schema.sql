-- ============================================
-- E-Commerce Automation Agent — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ==================
-- MERCHANTS (tenants)
-- ==================
create table public.merchants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Every authenticated user sees only their merchant's data
alter table public.merchants enable row level security;

create policy "Users can read own merchants"
  on public.merchants for select
  using (owner_id = auth.uid());

create policy "Users can insert own merchants"
  on public.merchants for insert
  with check (owner_id = auth.uid());

create policy "Users can update own merchants"
  on public.merchants for update
  using (owner_id = auth.uid());

-- ==================
-- PRODUCTS
-- ==================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  sku text not null,
  name text not null,
  category text not null default 'General',
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  status text not null default 'In Stock'
    check (status in ('In Stock', 'Low Stock', 'Out of Stock')),
  image text default '',
  last_sold timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(merchant_id, sku)
);

alter table public.products enable row level security;

create policy "Merchant members can read products"
  on public.products for select
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can insert products"
  on public.products for insert
  with check (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can update products"
  on public.products for update
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can delete products"
  on public.products for delete
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Auto-derive status from stock level
create or replace function public.sync_product_status()
returns trigger as $$
begin
  if new.stock = 0 then
    new.status = 'Out of Stock';
  elsif new.stock < 10 then
    new.status = 'Low Stock';
  else
    new.status = 'In Stock';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger products_sync_status
  before insert or update of stock on public.products
  for each row execute function public.sync_product_status();

-- ==================
-- ORDERS
-- ==================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  order_number text not null,
  customer_name text not null,
  customer_email text default '',
  total numeric(10,2) not null default 0,
  status text not null default 'Pending'
    check (status in ('Pending', 'Shipped', 'Delivered', 'Returned')),
  items_count integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(merchant_id, order_number)
);

alter table public.orders enable row level security;

create policy "Merchant members can read orders"
  on public.orders for select
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can insert orders"
  on public.orders for insert
  with check (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can update orders"
  on public.orders for update
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ==================
-- CARTS (abandoned cart tracking)
-- ==================
create table public.carts (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  total_value numeric(10,2) not null default 0,
  status text not null default 'active'
    check (status in ('active', 'abandoned', 'recovered')),
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.carts enable row level security;

create policy "Merchant members can read carts"
  on public.carts for select
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can manage carts"
  on public.carts for all
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- ==================
-- CART ITEMS
-- ==================
create table public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1
);

alter table public.cart_items enable row level security;

create policy "Cart items follow cart access"
  on public.cart_items for select
  using (
    cart_id in (
      select c.id from public.carts c
      join public.merchants m on c.merchant_id = m.id
      where m.owner_id = auth.uid()
    )
  );

create policy "Cart items insert follows cart access"
  on public.cart_items for insert
  with check (
    cart_id in (
      select c.id from public.carts c
      join public.merchants m on c.merchant_id = m.id
      where m.owner_id = auth.uid()
    )
  );

-- ==================
-- SALES DATA (daily aggregates)
-- ==================
create table public.sales_data (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  date date not null,
  day_name text not null,
  sales_count integer not null default 0,
  revenue numeric(10,2) not null default 0,
  unique(merchant_id, date)
);

alter table public.sales_data enable row level security;

create policy "Merchant members can read sales data"
  on public.sales_data for select
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can manage sales data"
  on public.sales_data for all
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- ==================
-- AGENT ACTIVITY LOG
-- ==================
create table public.agent_activity (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  agent_type text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.agent_activity enable row level security;

create policy "Merchant members can read activity"
  on public.agent_activity for select
  using (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

create policy "Merchant members can insert activity"
  on public.agent_activity for insert
  with check (
    merchant_id in (select id from public.merchants where owner_id = auth.uid())
  );

-- ==================
-- ENABLE REALTIME
-- ==================
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.carts;
alter publication supabase_realtime add table public.agent_activity;

-- ==================
-- SEED DATA FUNCTION (call after first sign-up)
-- ==================
create or replace function public.seed_demo_data(p_merchant_id uuid)
returns void as $$
declare
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  c1 uuid; c2 uuid; c3 uuid;
begin
  -- Products
  insert into public.products (id, merchant_id, sku, name, category, price, stock, image, last_sold)
  values
    (uuid_generate_v4(), p_merchant_id, 'P-101', 'NeoComfort Ergonomic Chair', 'Furniture', 349.99, 45, 'https://picsum.photos/200/200?random=1', '2023-10-25')
  returning id into p1;

  insert into public.products (id, merchant_id, sku, name, category, price, stock, image, last_sold)
  values
    (uuid_generate_v4(), p_merchant_id, 'P-102', 'Lumina Smart Lamp', 'Electronics', 89.99, 5, 'https://picsum.photos/200/200?random=2', '2023-10-26')
  returning id into p2;

  insert into public.products (id, merchant_id, sku, name, category, price, stock, image, last_sold)
  values
    (uuid_generate_v4(), p_merchant_id, 'P-103', 'Zenith Noise-Canceling Headphones', 'Electronics', 299.00, 120, 'https://picsum.photos/200/200?random=3', '2023-10-26')
  returning id into p3;

  insert into public.products (id, merchant_id, sku, name, category, price, stock, image, last_sold)
  values
    (uuid_generate_v4(), p_merchant_id, 'P-104', 'Artisan Ceramic Vase', 'Home Decor', 45.00, 0, 'https://picsum.photos/200/200?random=4', '2023-10-20')
  returning id into p4;

  insert into public.products (id, merchant_id, sku, name, category, price, stock, image, last_sold)
  values
    (uuid_generate_v4(), p_merchant_id, 'P-105', 'Organic Cotton Tee', 'Apparel', 25.50, 8, 'https://picsum.photos/200/200?random=5', '2023-10-26')
  returning id into p5;

  -- Orders
  insert into public.orders (merchant_id, order_number, customer_name, total, status, items_count) values
    (p_merchant_id, 'ORD-7782', 'Alice Johnson', 349.99, 'Shipped', 1),
    (p_merchant_id, 'ORD-7783', 'Bob Smith', 1299.00, 'Pending', 3),
    (p_merchant_id, 'ORD-7784', 'Charlie Brown', 25.50, 'Delivered', 1),
    (p_merchant_id, 'ORD-7785', 'Diana Prince', 89.99, 'Pending', 1),
    (p_merchant_id, 'ORD-7786', 'Evan Wright', 540.00, 'Returned', 2);

  -- Carts
  insert into public.carts (id, merchant_id, customer_name, customer_email, total_value, status, last_active)
  values (uuid_generate_v4(), p_merchant_id, 'Sarah Jenkins', 'sarah.j@example.com', 349.99, 'abandoned', '2023-10-26T14:30:00Z')
  returning id into c1;

  insert into public.carts (id, merchant_id, customer_name, customer_email, total_value, status, last_active)
  values (uuid_generate_v4(), p_merchant_id, 'Michael Chen', 'm.chen@example.com', 687.99, 'abandoned', '2023-10-26T15:45:00Z')
  returning id into c2;

  insert into public.carts (id, merchant_id, customer_name, customer_email, total_value, status, last_active)
  values (uuid_generate_v4(), p_merchant_id, 'Jessica Williams', 'jess.w@example.com', 76.50, 'active', '2023-10-26T16:20:00Z')
  returning id into c3;

  -- Cart items
  insert into public.cart_items (cart_id, product_id, product_name, price, quantity) values
    (c1, p1, 'NeoComfort Ergonomic Chair', 349.99, 1),
    (c2, p3, 'Zenith Noise-Canceling Headphones', 299.00, 2),
    (c2, p2, 'Lumina Smart Lamp', 89.99, 1),
    (c3, p5, 'Organic Cotton Tee', 25.50, 3);

  -- Sales data
  insert into public.sales_data (merchant_id, date, day_name, sales_count, revenue) values
    (p_merchant_id, current_date - 6, 'Mon', 24, 2400),
    (p_merchant_id, current_date - 5, 'Tue', 18, 1398),
    (p_merchant_id, current_date - 4, 'Wed', 32, 3800),
    (p_merchant_id, current_date - 3, 'Thu', 45, 4200),
    (p_merchant_id, current_date - 2, 'Fri', 60, 6100),
    (p_merchant_id, current_date - 1, 'Sat', 48, 5400),
    (p_merchant_id, current_date, 'Sun', 38, 4300);
end;
$$ language plpgsql security definer;
