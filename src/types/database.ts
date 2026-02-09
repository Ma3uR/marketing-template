export type OrderStatus = 'Approved' | 'Declined' | 'Refunded' | 'Expired' | 'InProcessing';

export interface Order {
  id: string;
  order_reference: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  product_name: string | null;
  card_pan: string | null;
  card_type: string | null;
  payment_system: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface OrderInsert {
  order_reference: string;
  amount: number;
  currency?: string;
  status: OrderStatus;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  product_name?: string | null;
  card_pan?: string | null;
  card_type?: string | null;
  payment_system?: string | null;
  processed_at?: string | null;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  is_active: boolean;
  updated_at: string;
}

export interface EmailTemplateInsert {
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  variables?: string[];
  is_active?: boolean;
}

export interface EmailTemplateUpdate {
  name?: string;
  subject?: string;
  body_html?: string;
  variables?: string[];
  is_active?: boolean;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
      };
      email_templates: {
        Row: EmailTemplate;
        Insert: EmailTemplateInsert;
        Update: EmailTemplateUpdate;
      };
      admin_users: {
        Row: AdminUser;
        Insert: { email: string };
        Update: { email?: string };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
