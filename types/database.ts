export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
      };
      products: {
        Row: {
          id: string;
          merchant_id: string;
          sku: string;
          name: string;
          category: string;
          price: number;
          stock: number;
          status: 'In Stock' | 'Low Stock' | 'Out of Stock';
          image: string;
          last_sold: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          sku: string;
          name: string;
          category?: string;
          price: number;
          stock?: number;
          status?: string;
          image?: string;
          last_sold?: string;
        };
        Update: {
          name?: string;
          category?: string;
          price?: number;
          stock?: number;
          image?: string;
          last_sold?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          merchant_id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          total: number;
          status: 'Pending' | 'Shipped' | 'Delivered' | 'Returned';
          items_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          order_number: string;
          customer_name: string;
          customer_email?: string;
          total: number;
          status?: string;
          items_count?: number;
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          total?: number;
          status?: string;
          items_count?: number;
        };
      };
      carts: {
        Row: {
          id: string;
          merchant_id: string;
          customer_name: string;
          customer_email: string;
          total_value: number;
          status: 'active' | 'abandoned' | 'recovered';
          last_active: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          customer_name: string;
          customer_email: string;
          total_value: number;
          status?: string;
          last_active?: string;
        };
        Update: {
          customer_name?: string;
          customer_email?: string;
          total_value?: number;
          status?: string;
          last_active?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string | null;
          product_name: string;
          price: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id?: string;
          product_name: string;
          price: number;
          quantity?: number;
        };
        Update: {
          product_name?: string;
          price?: number;
          quantity?: number;
        };
      };
      sales_data: {
        Row: {
          id: string;
          merchant_id: string;
          date: string;
          day_name: string;
          sales_count: number;
          revenue: number;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          date: string;
          day_name: string;
          sales_count: number;
          revenue: number;
        };
        Update: {
          sales_count?: number;
          revenue?: number;
        };
      };
      agent_activity: {
        Row: {
          id: string;
          merchant_id: string;
          agent_type: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          agent_type: string;
          message: string;
        };
        Update: {
          message?: string;
        };
      };
    };
  };
}
