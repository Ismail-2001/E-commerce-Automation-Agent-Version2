import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Product, Order, Cart, CartItem, SalesData } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CARTS, SALES_DATA } from '../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface AgentActivity {
  id: string;
  agent_type: string;
  message: string;
  created_at: string;
}

interface DataState {
  // Data
  products: Product[];
  orders: Order[];
  carts: Cart[];
  salesData: SalesData[];
  agentActivity: AgentActivity[];
  loading: boolean;
  useLiveData: boolean;
  realtimeChannel: RealtimeChannel | null;

  // Actions
  fetchAll: (merchantId: string) => Promise<void>;
  subscribeRealtime: (merchantId: string) => void;
  unsubscribeRealtime: () => void;

  // Product CRUD
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addProduct: (merchantId: string, product: Omit<Product, 'id' | 'status'>) => Promise<void>;

  // Order CRUD
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;

  // Cart mutations
  updateCartStatus: (cartId: string, status: Cart['status']) => Promise<void>;

  // Activity log
  logActivity: (merchantId: string, agentType: string, message: string) => Promise<void>;

  // Fallback to mock data
  loadMockData: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  products: [],
  orders: [],
  carts: [],
  salesData: [],
  agentActivity: [],
  loading: false,
  useLiveData: false,
  realtimeChannel: null,

  loadMockData: () => {
    set({
      products: MOCK_PRODUCTS,
      orders: MOCK_ORDERS,
      carts: MOCK_CARTS,
      salesData: SALES_DATA,
      useLiveData: false,
    });
  },

  fetchAll: async (merchantId) => {
    set({ loading: true });
    try {
      const [productsRes, ordersRes, cartsRes, salesRes, activityRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: true }),
        supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false }),
        supabase
          .from('carts')
          .select('*, cart_items(*)')
          .eq('merchant_id', merchantId)
          .order('last_active', { ascending: false }),
        supabase
          .from('sales_data')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('date', { ascending: true }),
        supabase
          .from('agent_activity')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      // Map DB rows to app types
      const products: Product[] = (productsRes.data || []).map(p => ({
        id: p.sku,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: p.stock,
        status: p.status as Product['status'],
        image: p.image || '',
        lastSold: p.last_sold || undefined,
        _dbId: p.id, // Keep DB UUID for mutations
      }));

      const orders: Order[] = (ordersRes.data || []).map(o => ({
        id: o.order_number,
        customerName: o.customer_name,
        total: Number(o.total),
        status: o.status as Order['status'],
        date: new Date(o.created_at).toISOString().split('T')[0],
        items: o.items_count,
        _dbId: o.id,
      }));

      const carts: Cart[] = (cartsRes.data || []).map(c => ({
        id: c.id,
        customerName: c.customer_name,
        customerEmail: c.customer_email,
        items: (c.cart_items || []).map((ci: any) => ({
          id: ci.id,
          productId: ci.product_id || '',
          productName: ci.product_name,
          price: Number(ci.price),
          quantity: ci.quantity,
        })),
        totalValue: Number(c.total_value),
        lastActive: c.last_active,
        status: c.status as Cart['status'],
      }));

      const salesData: SalesData[] = (salesRes.data || []).map(s => ({
        name: s.day_name,
        sales: s.sales_count,
        revenue: Number(s.revenue),
      }));

      set({
        products,
        orders,
        carts,
        salesData,
        agentActivity: activityRes.data || [],
        loading: false,
        useLiveData: true,
      });
    } catch (err) {
      console.error('Failed to fetch live data, falling back to mock:', err);
      get().loadMockData();
      set({ loading: false });
    }
  },

  subscribeRealtime: (merchantId) => {
    get().unsubscribeRealtime();

    const channel = supabase
      .channel(`merchant-${merchantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `merchant_id=eq.${merchantId}` },
        () => { get().fetchAll(merchantId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${merchantId}` },
        () => { get().fetchAll(merchantId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'carts', filter: `merchant_id=eq.${merchantId}` },
        () => { get().fetchAll(merchantId); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_activity', filter: `merchant_id=eq.${merchantId}` },
        (payload) => {
          set(state => ({
            agentActivity: [payload.new as AgentActivity, ...state.agentActivity].slice(0, 20),
          }));
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeRealtime: () => {
    const { realtimeChannel: channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  },

  updateProduct: async (sku, updates) => {
    const state = get();
    if (!state.useLiveData) {
      set({
        products: state.products.map(p =>
          p.id === sku ? { ...p, ...updates } : p
        ),
      });
      return;
    }

    const product = state.products.find(p => p.id === sku);
    if (!product) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image = updates.image;

    await supabase
      .from('products')
      // @ts-expect-error — Supabase type inference mismatch
      .update(dbUpdates)
      .eq('id', (product as any)._dbId);
  },

  addProduct: async (merchantId, product) => {
    const state = get();
    if (!state.useLiveData) {
      const newProduct: Product = {
        ...product,
        id: `P-${Date.now()}`,
        status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock',
      };
      set({ products: [...state.products, newProduct] });
      return;
    }

    // @ts-expect-error — Supabase type inference mismatch
    await supabase.from('products').insert({
      merchant_id: merchantId,
      sku: (product as any).id || `P-${Date.now()}`,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
  },

  updateOrder: async (orderNumber, updates) => {
    const state = get();
    if (!state.useLiveData) {
      set({
        orders: state.orders.map(o =>
          o.id === orderNumber ? { ...o, ...updates } : o
        ),
      });
      return;
    }

    const order = state.orders.find(o => o.id === orderNumber);
    if (!order) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;

    await supabase
      .from('orders')
      // @ts-expect-error — Supabase type inference mismatch
      .update(dbUpdates)
      .eq('id', (order as any)._dbId);
  },

  updateCartStatus: async (cartId, status) => {
    const state = get();
    if (!state.useLiveData) {
      set({
        carts: state.carts.map(c =>
          c.id === cartId ? { ...c, status } : c
        ),
      });
      return;
    }

    await supabase
      .from('carts')
      // @ts-expect-error — Supabase type inference mismatch
      .update({ status })
      .eq('id', cartId);
  },

  logActivity: async (merchantId, agentType, message) => {
    const state = get();
    if (!state.useLiveData) {
      const entry: AgentActivity = {
        id: Date.now().toString(),
        agent_type: agentType,
        message,
        created_at: new Date().toISOString(),
      };
      set({ agentActivity: [entry, ...state.agentActivity].slice(0, 20) });
      return;
    }

    // @ts-expect-error — Supabase type inference mismatch
    await supabase.from('agent_activity').insert({
      merchant_id: merchantId,
      agent_type: agentType,
      message,
    });
  },
}));
