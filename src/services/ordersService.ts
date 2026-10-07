import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus, CustomerShippingInput } from '../types/database';

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  customer: CustomerShippingInput;
  userId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export const ordersService = {
  // Authoritative server-side order and Razorpay order creation via Supabase Edge Function
  async createCheckoutOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    if (!isSupabaseConfigured()) {
      // If user hasn't connected live Supabase credentials yet, simulate the exact response contract
      const timestamp = Date.now().toString().slice(-6);
      const fakeOrderNumber = `KJ-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        orderId: `order-demo-${timestamp}`,
        orderNumber: fakeOrderNumber,
        razorpayOrderId: `order_demo_${timestamp}`,
        amount: 8450000,
        currency: 'INR',
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      };
    }

    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: payload,
    });

    if (error) {
      throw new Error(error.message || 'Server failed to initiate checkout order');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data as CreateOrderResponse;
  },

  // Customer: Fetch own order history with items
  async getMyOrders(userId: string): Promise<Order[]> {
    if (!isSupabaseConfigured() || !userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Order[]) || [];
  },

  // Customer or Admin: Fetch single order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) return null;
    return data as Order;
  },

  // Admin: Fetch all orders with optional search and status filters
  async getOrdersAdmin(filter?: { status?: string; search?: string }): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (filter?.status && filter.status !== 'ALL') {
      query = query.eq('order_status', filter.status);
    }

    if (filter?.search) {
      query = query.or(
        `order_number.ilike.%${filter.search}%,shipping_name.ilike.%${filter.search}%,shipping_phone.ilike.%${filter.search}%,shipping_email.ilike.%${filter.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Order[]) || [];
  },

  // Admin: Update order progression status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  // Admin: Aggregate real database statistics
  async getAdminDashboardStats() {
    if (!isSupabaseConfigured()) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
        totalRevenue: 0,
        totalProducts: 8,
        lowStockCount: 2,
      };
    }

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('id, payment_status, total_amount'),
      supabase.from('products').select('id, stock_quantity'),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.payment_status === 'PENDING').length;
    const paidOrders = orders.filter((o) => o.payment_status === 'PAID').length;
    const totalRevenue = orders
      .filter((o) => o.payment_status === 'PAID')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.stock_quantity < 5).length;

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue,
      totalProducts,
      lowStockCount,
    };
  },
};
