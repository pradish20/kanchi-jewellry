import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Loader2,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { Order, OrderStatus } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersService.getOrdersAdmin({
        status: statusFilter,
        search: searchTerm.trim() || undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription on orders table
  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase
      .channel('admin_orders_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (_payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
            Order Management
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Realtime customer orders, dispatch tracking, and payment verification audits.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E8E4DA] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, customer, phone, email..."
            className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs pl-9 pr-3 py-2 text-[#111111] focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] uppercase tracking-wider text-[#777777] whitespace-nowrap">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D6CEBE] text-xs py-2 px-3 text-[#111111] focus:outline-none focus:border-[#C5A059] w-full sm:w-auto"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E4DA] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin mb-2" />
            <span className="text-xs text-[#777777]">Fetching order records...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777777]">
            No orders match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E8E4DA] text-[10px] uppercase tracking-wider text-[#777777]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE2]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#111111]">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#111111]">{ord.shipping_name}</div>
                      <div className="text-[11px] text-[#777777]">{ord.shipping_phone}</div>
                      <div className="text-[11px] text-[#999999]">{ord.shipping_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#777777] whitespace-nowrap">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#111111] tabular-nums whitespace-nowrap">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          ord.payment_status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={ord.order_status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-white border border-[#D6CEBE] text-xs py-1 px-2 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 border border-[#D6CEBE] text-[#111111] hover:bg-[#FAF9F5] transition-colors"
                        title="Inspect order items"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white border border-[#E8E4DA] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D17] block">
                  Admin Inspection
                </span>
                <h3 className="font-serif text-2xl text-[#111111]">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#888888] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#FAF9F5] border border-[#E8E4DA]">
                <div>
                  <span className="text-[#888888] block text-[11px]">Payment Status</span>
                  <span className="font-semibold text-[#111111]">{selectedOrder.payment_status}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Order Status</span>
                  <span className="font-semibold text-[#111111]">{selectedOrder.order_status}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Razorpay Order ID</span>
                  <span className="font-mono text-[11px] text-[#555555]">
                    {selectedOrder.razorpay_order_id || 'Not generated'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-base text-[#111111] mb-3">Itemized Snapshot</h4>
                <div className="divide-y divide-[#F0ECE2] border-y border-[#F0ECE2]">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-[#111111]">{item.product_name}</div>
                        <div className="text-[11px] text-[#777777]">
                          SKU: {item.product_sku} · Qty: {item.quantity} · Unit Price: {formatPrice(item.unit_price)}
                        </div>
                      </div>
                      <div className="font-mono tabular-nums font-semibold text-[#111111]">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-[#E8E4DA]">
                  <h4 className="font-medium text-[#111111] mb-2 uppercase tracking-wider text-[11px]">
                    Shipping Details
                  </h4>
                  <div className="text-[#555555] space-y-1">
                    <div className="font-medium text-[#111111]">{selectedOrder.shipping_name}</div>
                    <div>{selectedOrder.shipping_address}</div>
                    <div>
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                    </div>
                    <div>Phone: {selectedOrder.shipping_phone}</div>
                    <div>Email: {selectedOrder.shipping_email}</div>
                  </div>
                </div>

                <div className="p-4 border border-[#E8E4DA] space-y-2">
                  <h4 className="font-medium text-[#111111] mb-2 uppercase tracking-wider text-[11px]">
                    Financial Totals
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Subtotal</span>
                    <span className="font-mono">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-[#8C6D17]">
                      <span>Discount</span>
                      <span className="font-mono">-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Shipping Fee</span>
                    <span className="font-mono">
                      {selectedOrder.shipping_amount === 0 ? 'Complimentary' : formatPrice(selectedOrder.shipping_amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E4DA] flex justify-between font-semibold text-[#111111]">
                    <span>Total Amount</span>
                    <span className="font-mono text-sm">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-4 border-t border-[#E8E4DA] flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#D6CEBE] text-xs hover:border-[#111111]"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#D6CEBE] text-xs hover:border-[#111111]"
                >
                  Mark Processing
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#D6CEBE] text-xs hover:border-[#111111]"
                >
                  Mark Shipped (Insured Courier)
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  className="px-3 py-1.5 bg-emerald-800 text-white text-xs hover:bg-emerald-900"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                  className="px-3 py-1.5 bg-red-800 text-white text-xs hover:bg-red-900 ml-auto"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
