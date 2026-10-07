import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Layers,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { Order } from '../types/database';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashStats, ords] = await Promise.all([
          ordersService.getAdminDashboardStats(),
          ordersService.getOrdersAdmin(),
        ]);

        if (mounted) {
          setStats(dashStats);
          setRecentOrders(ords.slice(0, 5));
        }
      } catch (err) {
        console.error('Error loading admin dashboard', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
        <span className="text-xs uppercase tracking-wider text-[#777777]">
          Gathering vault analytics from database...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
          Dashboard Overview
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Live statistics queried authoritatively from Supabase PostgreSQL database.
        </p>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Total Vault Revenue</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E8E4DA] flex items-center justify-center text-[#8C6D17]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#111111] tabular-nums">
            {formatPrice(stats.totalRevenue)}
          </div>
          <span className="text-[11px] text-[#777777] mt-2">Verified Razorpay Captured Funds</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E8E4DA] flex items-center justify-center text-[#111111]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#111111] tabular-nums">
            {stats.totalOrders}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#777777] mt-2">
            <span>{stats.paidOrders} Settled</span>
            <span>·</span>
            <span>{stats.pendingOrders} Pending</span>
          </div>
        </div>

        {/* Paid Orders */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Paid & Captured</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-emerald-900 tabular-nums">
            {stats.paidOrders}
          </div>
          <span className="text-[11px] text-[#777777] mt-2">Confirmed orders ready for shipment</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-amber-900 tabular-nums">
            {stats.pendingOrders}
          </div>
          <span className="text-[11px] text-[#777777] mt-2">Awaiting payment verification</span>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Active Catalog Products</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E8E4DA] flex items-center justify-center text-[#111111]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#111111] tabular-nums">
            {stats.totalProducts}
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-[11px] text-[#8C6D17] hover:underline text-left mt-2 flex items-center gap-1"
          >
            Manage catalog <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#E8E4DA] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[11px] uppercase tracking-wider">Low Stock Vault Items</span>
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#8A2525] tabular-nums">
            {stats.lowStockCount}
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-[11px] text-[#8A2525] hover:underline text-left mt-2 flex items-center gap-1"
          >
            Review inventory & replenish <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white border border-[#E8E4DA] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-4">
          <h2 className="font-serif text-xl text-[#111111]">Recent Orders</h2>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs uppercase tracking-wider text-[#8C6D17] hover:underline font-medium"
          >
            View All Orders →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#777777]">
            No orders placed yet. Orders will appear here in realtime once customers complete checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E8E4DA] text-[10px] uppercase tracking-wider text-[#777777]">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE2]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F5]">
                    <td className="py-3 px-3 font-mono font-medium text-[#111111]">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-3 text-[#333333]">
                      <div>{ord.shipping_name}</div>
                      <div className="text-[10px] text-[#777777]">{ord.shipping_phone}</div>
                    </td>
                    <td className="py-3 px-3 text-[#777777]">{formatDate(ord.created_at)}</td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-[#111111]">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#555555]">
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
