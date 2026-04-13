export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastSold?: string;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Returned';
  date: string;
  items: number;
}

export interface ProductWidgetData {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export interface OrderWidgetData {
  id: string;
  customerName: string;
  total: number;
  status: string;
}

export type WidgetData = ProductWidgetData | OrderWidgetData | null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isError?: boolean;
  widget?: 'product_card' | 'order_card' | 'none';
  widgetData?: WidgetData;
}

export type ViewState = 'dashboard' | 'inventory' | 'orders' | 'agent' | 'agent-recovery' | 'image-analysis' | 'forecasting' | 'connector' | 'agents' | 'settings';

export interface SalesData {
  name: string;
  sales: number;
  revenue: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalValue: number;
  lastActive: string;
  status: 'active' | 'abandoned' | 'recovered';
}