import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  LogOut,
  Package,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  Eye,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Order, WishlistItem } from '../types/database';
import { ordersService } from '../services/ordersService';
import { wishlistService } from '../services/wishlistService';
import { ProductCard } from '../components/ProductCard';

interface AccountPageProps {
  initialTab?: 'orders' | 'wishlist' | 'profile';
  navigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', navigate }) => {
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const { refreshWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      setLoadingOrders(true);
      ordersService
        .getMyOrders(user.id)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    } else if (user && activeTab === 'wishlist') {
      setLoadingWishlist(true);
      wishlistService
        .getWishlist(user.id)
        .then(setWishlistItems)
        .catch(console.error)
        .finally(() => setLoadingWishlist(false));
    }
  }, [user, activeTab]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

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
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Client Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E4DA] mb-8 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-1">
            Authenticated Vault Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#111111]">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Esteemed Client'}
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-[#C5A059] text-[#111111] text-xs uppercase tracking-wider font-semibold hover:bg-[#D8B74E] transition-colors"
            >
              Open Admin Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#D6CEBE] text-xs uppercase tracking-[0.15em] text-[#111111] hover:bg-[#FAF9F5] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DA] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.16em] font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.16em] font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Personal Wishlist ({wishlistItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.16em] font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#111111] text-[#111111]'
              : 'border-transparent text-[#777777] hover:text-[#111111]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF9F5] border border-[#E8E4DA] p-8">
              <ShoppingBag className="w-8 h-8 text-[#888888] mx-auto mb-3" />
              <h3 className="font-serif text-lg text-[#111111] mb-1">No Orders Placed Yet</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mb-6">
                When you acquire fine jewelry with us, your tracking details and invoice certificates will appear here.
              </p>
              <button
                onClick={() => navigate('/jewelry')}
                className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] hover:bg-[#8C6D17] transition-colors"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-[#E8E4DA] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#D6CEBE] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-[#111111]">
                        {ord.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${
                          ord.payment_status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 bg-[#FAF9F5] text-[#444444] border border-[#E8E4DA]">
                        {ord.order_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#777777]">
                      <span>Placed on {formatDate(ord.created_at)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {ord.order_items?.length || 1} {ord.order_items?.length === 1 ? 'item' : 'items'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Deliver to {ord.shipping_city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-base font-semibold text-[#111111]">
                        {formatPrice(ord.total_amount)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-4 py-2 border border-[#D6CEBE] text-xs uppercase tracking-wider text-[#111111] hover:bg-[#FAF9F5] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {loadingWishlist ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF9F5] border border-[#E8E4DA] p-8">
              <Heart className="w-8 h-8 text-[#888888] mx-auto mb-3" />
              <h3 className="font-serif text-lg text-[#111111] mb-1">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mb-6">
                Save pieces you admire while browsing to keep them curated in your private vault.
              </p>
              <button
                onClick={() => navigate('/jewelry')}
                className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] hover:bg-[#8C6D17] transition-colors"
              >
                Explore Jewelry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                if (!item.product) return null;
                return (
                  <ProductCard
                    key={item.id}
                    product={item.product}
                    onNavigate={(slug) => navigate(`/product/${slug}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white border border-[#E8E4DA] p-6 space-y-6">
          <h3 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#E8E4DA]">
            Client Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#888888] block text-[11px] uppercase tracking-wider mb-0.5">
                Full Name
              </span>
              <span className="font-medium text-[#111111]">
                {user.user_metadata?.full_name || 'Not provided'}
              </span>
            </div>

            <div>
              <span className="text-[#888888] block text-[11px] uppercase tracking-wider mb-0.5">
                Email Address
              </span>
              <span className="font-medium text-[#111111]">{user.email}</span>
            </div>

            <div>
              <span className="text-[#888888] block text-[11px] uppercase tracking-wider mb-0.5">
                Account ID (UID)
              </span>
              <span className="font-mono text-[11px] text-[#666666]">{user.id}</span>
            </div>

            <div>
              <span className="text-[#888888] block text-[11px] uppercase tracking-wider mb-0.5">
                Security & Authorization
              </span>
              <span className="font-medium text-[#111111]">
                {isAdmin ? 'System Administrator' : 'Verified Client (Customer RLS Policy)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
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
                  Order Details
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
                  <span className="text-[#888888] block text-[11px]">Order Status</span>
                  <span className="font-semibold text-[#111111]">{selectedOrder.order_status}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Payment Status</span>
                  <span className="font-semibold text-[#111111]">{selectedOrder.payment_status}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px]">Date</span>
                  <span className="text-[#111111]">{formatDate(selectedOrder.created_at)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-base text-[#111111] mb-3">Itemized Historical Snapshot</h4>
                <div className="divide-y divide-[#F0ECE2] border-y border-[#F0ECE2]">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-[#111111]">{item.product_name}</div>
                        <div className="text-[11px] text-[#777777]">
                          SKU: {item.product_sku} · Qty: {item.quantity}
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
                    Shipping Address
                  </h4>
                  <div className="text-[#555555] space-y-1">
                    <div>{selectedOrder.shipping_name}</div>
                    <div>{selectedOrder.shipping_address}</div>
                    <div>
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                    </div>
                    <div>Phone: {selectedOrder.shipping_phone}</div>
                  </div>
                </div>

                <div className="p-4 border border-[#E8E4DA] space-y-2">
                  <h4 className="font-medium text-[#111111] mb-2 uppercase tracking-wider text-[11px]">
                    Payment Summary
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Subtotal</span>
                    <span className="font-mono tabular-nums">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-[#8C6D17]">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Shipping</span>
                    <span className="font-mono tabular-nums">
                      {selectedOrder.shipping_amount === 0 ? 'Complimentary' : formatPrice(selectedOrder.shipping_amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E4DA] flex justify-between font-semibold text-[#111111]">
                    <span>Total Paid</span>
                    <span className="font-mono text-sm">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
