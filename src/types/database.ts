// Database Types for Kanchi Jewelry Production Application
// Maps 1:1 to Supabase PostgreSQL Schema

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string | null;
  public_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null; // Database column: Foreign key UUID referencing categories(id)
  material: string | null;
  weight: string | null;
  gross_weight?: string | null;
  dimensions: string | null;
  colour: string | null;
  collection: string | null;
  collection_name?: string | null;
  occasion: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category; // Joined relational object from categories table (never a string)
  images?: ProductImage[]; // Joined relational object from product_images table
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  sku: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  category_id: string; // Foreign key UUID referencing categories(id). Never send 'category'
  material?: string | null;
  weight?: string | null;
  gross_weight?: string | null;
  dimensions?: string | null;
  colour?: string | null;
  collection?: string | null;
  collection_name?: string | null;
  occasion?: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  razorpay_order_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  brand_info: {
    brand_name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    google_maps: string;
    business_hours: string;
    support_note: string;
  };
  shipping_settings: {
    free_shipping_threshold: number;
    standard_shipping_fee: number;
    insured_courier: boolean;
    estimated_days: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerShippingInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
