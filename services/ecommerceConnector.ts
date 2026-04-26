import { Product, Order } from '../types';

export type Platform = 'shopify' | 'woocommerce';

export interface ConnectorConfig {
  platform: Platform;
  storeUrl: string;
  apiKey: string;
  apiSecret?: string; // WooCommerce consumer secret
}

export interface SyncResult {
  success: boolean;
  productsImported: number;
  ordersImported: number;
  errors: string[];
}

// ─── External API response shapes ───────────────────────────────────

interface ShopifyVariant {
  price: string;
  inventory_quantity: number;
}

interface ShopifyImage {
  src: string;
}

interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  variants: ShopifyVariant[];
  image: ShopifyImage | null;
  images: ShopifyImage[];
  updated_at: string;
}

interface ShopifyCustomer {
  first_name: string;
  last_name: string;
}

interface ShopifyLineItem {
  id: number;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  customer: ShopifyCustomer | null;
  total_price: string;
  fulfillment_status: string | null;
  financial_status: string;
  created_at: string;
  line_items: ShopifyLineItem[];
}

interface WooProduct {
  id: number;
  name: string;
  categories: { name: string }[];
  price: string;
  stock_quantity: number | null;
  images: { src: string }[];
  date_modified: string;
}

interface WooBilling {
  first_name: string;
  last_name: string;
}

interface WooLineItem {
  id: number;
}

interface WooOrder {
  id: number;
  billing: WooBilling;
  total: string;
  status: string;
  date_created: string;
  line_items: WooLineItem[];
}

// ─── API clients ────────────────────────────────────────────────────

/**
 * Shopify Storefront API connector.
 * Uses the Admin REST API (requires private app credentials).
 */
async function fetchShopify<T = unknown>(config: ConnectorConfig, endpoint: string): Promise<T> {
  const url = `${config.storeUrl}/admin/api/2024-01/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': config.apiKey,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

/**
 * WooCommerce REST API connector.
 * Uses Basic Auth with consumer key/secret.
 */
async function fetchWooCommerce<T = unknown>(config: ConnectorConfig, endpoint: string): Promise<T> {
  const url = `${config.storeUrl}/wp-json/wc/v3/${endpoint}`;
  const auth = btoa(`${config.apiKey}:${config.apiSecret || ''}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

// ─── Import functions ───────────────────────────────────────────────

/**
 * Imports products from a connected storefront.
 * Paginates through all results (50 per page) to handle large stores.
 */
export async function importProducts(config: ConnectorConfig): Promise<Product[]> {
  const allProducts: Product[] = [];
  let page = 1;
  const perPage = 50;

  while (true) {
    let batch: Product[] = [];

    if (config.platform === 'shopify') {
      const data = await fetchShopify<{ products: ShopifyProduct[] }>(config, `products.json?limit=${perPage}&page=${page}`);
      const products = data.products || [];
      if (products.length === 0) break;
      batch = products.map((p) => ({
        id: `SHOP-${p.id}`,
        name: p.title,
        category: p.product_type || 'General',
        price: parseFloat(p.variants?.[0]?.price || '0'),
        stock: p.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) || 0,
        status: getStockStatus(p.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) || 0),
        image: p.image?.src || p.images?.[0]?.src || '',
        lastSold: p.updated_at?.split('T')[0],
      }));
    } else if (config.platform === 'woocommerce') {
      const data = await fetchWooCommerce<WooProduct[]>(config, `products?per_page=${perPage}&page=${page}`);
      if (!data || data.length === 0) break;
      batch = data.map((p) => ({
        id: `WOO-${p.id}`,
        name: p.name,
        category: p.categories?.[0]?.name || 'General',
        price: parseFloat(p.price || '0'),
        stock: p.stock_quantity || 0,
        status: getStockStatus(p.stock_quantity || 0),
        image: p.images?.[0]?.src || '',
        lastSold: p.date_modified?.split('T')[0],
      }));
    } else {
      break;
    }

    allProducts.push(...batch);
    if (batch.length < perPage) break; // Last page
    page++;
  }

  return allProducts;
}

/**
 * Imports orders from a connected storefront.
 * Paginates through all results (50 per page) to handle large stores.
 */
export async function importOrders(config: ConnectorConfig): Promise<Order[]> {
  const allOrders: Order[] = [];
  let page = 1;
  const perPage = 50;

  while (true) {
    let batch: Order[] = [];

    if (config.platform === 'shopify') {
      const data = await fetchShopify<{ orders: ShopifyOrder[] }>(config, `orders.json?limit=${perPage}&page=${page}&status=any`);
      const orders = data.orders || [];
      if (orders.length === 0) break;
      batch = orders.map((o) => ({
        id: `SHOP-${o.order_number || o.id}`,
        customerName: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim() || 'Guest',
        total: parseFloat(o.total_price || '0'),
        status: mapShopifyStatus(o.fulfillment_status, o.financial_status),
        date: o.created_at?.split('T')[0] || '',
        items: o.line_items?.length || 0,
      }));
    } else if (config.platform === 'woocommerce') {
      const data = await fetchWooCommerce<WooOrder[]>(config, `orders?per_page=${perPage}&page=${page}`);
      if (!data || data.length === 0) break;
      batch = data.map((o) => ({
        id: `WOO-${o.id}`,
        customerName: `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() || 'Guest',
        total: parseFloat(o.total || '0'),
        status: mapWooStatus(o.status),
        date: o.date_created?.split('T')[0] || '',
        items: o.line_items?.length || 0,
      }));
    } else {
      break;
    }

    allOrders.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return allOrders;
}

/**
 * Full sync — import both products and orders.
 */
export async function syncStorefront(config: ConnectorConfig): Promise<SyncResult> {
  const errors: string[] = [];
  let products: Product[] = [];
  let orders: Order[] = [];

  try {
    products = await importProducts(config);
  } catch (e) {
    errors.push(`Products: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    orders = await importOrders(config);
  } catch (e) {
    errors.push(`Orders: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    success: errors.length === 0,
    productsImported: products.length,
    ordersImported: orders.length,
    errors,
  };
}

/**
 * Tests connection to storefront.
 */
export async function testConnection(config: ConnectorConfig): Promise<{ success: boolean; storeName?: string; error?: string }> {
  try {
    if (config.platform === 'shopify') {
      const data = await fetchShopify<{ shop: { name: string } }>(config, 'shop.json');
      return { success: true, storeName: data.shop?.name };
    }
    if (config.platform === 'woocommerce') {
      const data = await fetchWooCommerce<{ environment: { site_url: string } }>(config, 'system_status');
      return { success: true, storeName: data.environment?.site_url || config.storeUrl };
    }
    return { success: false, error: 'Unknown platform' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// --- Helpers ---

function getStockStatus(stock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (stock === 0) return 'Out of Stock';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
}

function mapShopifyStatus(fulfillment: string | null, financial: string): Order['status'] {
  if (fulfillment === 'fulfilled') return 'Delivered';
  if (fulfillment === 'partial' || financial === 'paid') return 'Shipped';
  if (financial === 'refunded') return 'Returned';
  return 'Pending';
}

function mapWooStatus(status: string): Order['status'] {
  switch (status) {
    case 'completed': return 'Delivered';
    case 'processing':
    case 'on-hold': return 'Shipped';
    case 'refunded':
    case 'cancelled': return 'Returned';
    default: return 'Pending';
  }
}
