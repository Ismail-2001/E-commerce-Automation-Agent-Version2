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

/**
 * Shopify Storefront API connector.
 * Uses the Admin REST API (requires private app credentials).
 */
async function fetchShopify(config: ConnectorConfig, endpoint: string): Promise<any> {
  const url = `${config.storeUrl}/admin/api/2024-01/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': config.apiKey,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  return response.json();
}

/**
 * WooCommerce REST API connector.
 * Uses Basic Auth with consumer key/secret.
 */
async function fetchWooCommerce(config: ConnectorConfig, endpoint: string): Promise<any> {
  const url = `${config.storeUrl}/wp-json/wc/v3/${endpoint}`;
  const auth = btoa(`${config.apiKey}:${config.apiSecret || ''}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
  return response.json();
}

/**
 * Imports products from a connected storefront.
 */
export async function importProducts(config: ConnectorConfig): Promise<Product[]> {
  if (config.platform === 'shopify') {
    const data = await fetchShopify(config, 'products.json?limit=50');
    return (data.products || []).map((p: any) => ({
      id: `SHOP-${p.id}`,
      name: p.title,
      category: p.product_type || 'General',
      price: parseFloat(p.variants?.[0]?.price || '0'),
      stock: p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
      status: getStockStatus(p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0),
      image: p.image?.src || p.images?.[0]?.src || '',
      lastSold: p.updated_at?.split('T')[0],
    }));
  }

  if (config.platform === 'woocommerce') {
    const data = await fetchWooCommerce(config, 'products?per_page=50');
    return (data || []).map((p: any) => ({
      id: `WOO-${p.id}`,
      name: p.name,
      category: p.categories?.[0]?.name || 'General',
      price: parseFloat(p.price || '0'),
      stock: p.stock_quantity || 0,
      status: getStockStatus(p.stock_quantity || 0),
      image: p.images?.[0]?.src || '',
      lastSold: p.date_modified?.split('T')[0],
    }));
  }

  return [];
}

/**
 * Imports orders from a connected storefront.
 */
export async function importOrders(config: ConnectorConfig): Promise<Order[]> {
  if (config.platform === 'shopify') {
    const data = await fetchShopify(config, 'orders.json?limit=50&status=any');
    return (data.orders || []).map((o: any) => ({
      id: `SHOP-${o.order_number || o.id}`,
      customerName: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim() || 'Guest',
      total: parseFloat(o.total_price || '0'),
      status: mapShopifyStatus(o.fulfillment_status, o.financial_status),
      date: o.created_at?.split('T')[0] || '',
      items: o.line_items?.length || 0,
    }));
  }

  if (config.platform === 'woocommerce') {
    const data = await fetchWooCommerce(config, 'orders?per_page=50');
    return (data || []).map((o: any) => ({
      id: `WOO-${o.id}`,
      customerName: `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() || 'Guest',
      total: parseFloat(o.total || '0'),
      status: mapWooStatus(o.status),
      date: o.date_created?.split('T')[0] || '',
      items: o.line_items?.length || 0,
    }));
  }

  return [];
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
  } catch (e: any) {
    errors.push(`Products: ${e.message}`);
  }

  try {
    orders = await importOrders(config);
  } catch (e: any) {
    errors.push(`Orders: ${e.message}`);
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
      const data = await fetchShopify(config, 'shop.json');
      return { success: true, storeName: data.shop?.name };
    }
    if (config.platform === 'woocommerce') {
      const data = await fetchWooCommerce(config, 'system_status');
      return { success: true, storeName: data.environment?.site_url || config.storeUrl };
    }
    return { success: false, error: 'Unknown platform' };
  } catch (e: any) {
    return { success: false, error: e.message };
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
