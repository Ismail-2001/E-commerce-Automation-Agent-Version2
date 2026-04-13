import { Product, Order, SalesData, Cart } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'P-101',
    name: 'NeoComfort Ergonomic Chair',
    category: 'Furniture',
    price: 349.99,
    stock: 45,
    status: 'In Stock',
    image: 'https://picsum.photos/200/200?random=1',
    lastSold: '2023-10-25'
  },
  {
    id: 'P-102',
    name: 'Lumina Smart Lamp',
    category: 'Electronics',
    price: 89.99,
    stock: 5,
    status: 'Low Stock',
    image: 'https://picsum.photos/200/200?random=2',
    lastSold: '2023-10-26'
  },
  {
    id: 'P-103',
    name: 'Zenith Noise-Canceling Headphones',
    category: 'Electronics',
    price: 299.00,
    stock: 120,
    status: 'In Stock',
    image: 'https://picsum.photos/200/200?random=3',
    lastSold: '2023-10-26'
  },
  {
    id: 'P-104',
    name: 'Artisan Ceramic Vase',
    category: 'Home Decor',
    price: 45.00,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://picsum.photos/200/200?random=4',
    lastSold: '2023-10-20'
  },
  {
    id: 'P-105',
    name: 'Organic Cotton Tee',
    category: 'Apparel',
    price: 25.50,
    stock: 8,
    status: 'Low Stock',
    image: 'https://picsum.photos/200/200?random=5',
    lastSold: '2023-10-26'
  }
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-7782', customerName: 'Alice Johnson', total: 349.99, status: 'Shipped', date: '2023-10-26', items: 1 },
  { id: 'ORD-7783', customerName: 'Bob Smith', total: 1299.00, status: 'Pending', date: '2023-10-26', items: 3 },
  { id: 'ORD-7784', customerName: 'Charlie Brown', total: 25.50, status: 'Delivered', date: '2023-10-25', items: 1 },
  { id: 'ORD-7785', customerName: 'Diana Prince', total: 89.99, status: 'Pending', date: '2023-10-26', items: 1 },
  { id: 'ORD-7786', customerName: 'Evan Wright', total: 540.00, status: 'Returned', date: '2023-10-24', items: 2 },
];

export const SALES_DATA: SalesData[] = [
  { name: 'Mon', sales: 24, revenue: 2400 },
  { name: 'Tue', sales: 18, revenue: 1398 },
  { name: 'Wed', sales: 32, revenue: 3800 },
  { name: 'Thu', sales: 45, revenue: 4200 },
  { name: 'Fri', sales: 60, revenue: 6100 },
  { name: 'Sat', sales: 48, revenue: 5400 },
  { name: 'Sun', sales: 38, revenue: 4300 },
];

export const MOCK_CARTS: Cart[] = [
  {
    id: 'CART-001',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    items: [
      { id: 'CI-001', productId: 'P-101', productName: 'NeoComfort Ergonomic Chair', price: 349.99, quantity: 1 }
    ],
    totalValue: 349.99,
    lastActive: '2023-10-26T14:30:00Z',
    status: 'abandoned'
  },
  {
    id: 'CART-002',
    customerName: 'Michael Chen',
    customerEmail: 'm.chen@example.com',
    items: [
      { id: 'CI-002', productId: 'P-103', productName: 'Zenith Noise-Canceling Headphones', price: 299.00, quantity: 2 },
      { id: 'CI-003', productId: 'P-102', productName: 'Lumina Smart Lamp', price: 89.99, quantity: 1 }
    ],
    totalValue: 687.99,
    lastActive: '2023-10-26T15:45:00Z',
    status: 'abandoned'
  },
  {
    id: 'CART-003',
    customerName: 'Jessica Williams',
    customerEmail: 'jess.w@example.com',
    items: [
      { id: 'CI-004', productId: 'P-105', productName: 'Organic Cotton Tee', price: 25.50, quantity: 3 }
    ],
    totalValue: 76.50,
    lastActive: '2023-10-26T16:20:00Z',
    status: 'active'
  }
];