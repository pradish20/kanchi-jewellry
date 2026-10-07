import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CustomerShippingInput } from '../types/database';
import { ordersService, CreateOrderResponse } from '../services/ordersService';
import { initializeRazorpayCheckout, callVerifyPaymentFunction } from '../lib/razorpay';
import { isSupabaseConfigured } from '../lib/supabase';

interface CheckoutPageProps {
  navigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, clearCart, subtotal, discountTotal, shippingFee, grandTotal } = useCart();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<CustomerShippingInput>({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [apartment, setApartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    paymentId?: string;
  } | null>(null);

  const isConfigured = isSupabaseConfigured();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleInputChange = (field: keyof CustomerShippingInput, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const validateForm = (): boolean => {
    if (!customer.name.trim()) {
      setErrorMsg('Please enter your full name for recipient verification.');
      return false;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setErrorMsg('Please enter a valid email address for order notifications.');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit phone number for insured courier delivery.');
      return false;
    }
    if (!customer.address.trim()) {
      setErrorMsg('Please enter your complete physical shipping address.');
      return false;
    }
    if (!customer.city.trim()) {
      setErrorMsg('Please specify the destination city.');
      return false;
    }
    if (!customer.pincode.trim() || customer.pincode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return false;
    }
    return true;
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const fullShippingAddress = apartment
        ? `${customer.address}, ${apartment}`
        : customer.address;

      const orderPayload = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customer: {
          ...customer,
          address: fullShippingAddress,
        },
        userId: user?.id,
      };

      // 1. Authoritative server checkout initiation via Edge Function
      const res: CreateOrderResponse = await ordersService.createCheckoutOrder(orderPayload);

      // Check if Razorpay Key is provided
      const razorpayKey = res.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey || razorpayKey.includes('placeholder')) {
        // If razorpay credentials not yet configured in development, inform user with instructions
        if (!isConfigured) {
          // Provide test simulation demonstration for user reviewing the UI
          setConfirmedOrder({
            orderNumber: res.orderNumber,
            totalAmount: grandTotal,
            paymentId: 'pay_demo_preview_mode',
          });
          clearCart();
          setLoading(false);
          return;
        } else {
          throw new Error('Razorpay Key ID is not configured. Please add VITE_RAZORPAY_KEY_ID in your environment.');
        }
      }

      // 2. Open standard Razorpay Checkout modal
      await initializeRazorpayCheckout({
        key: razorpayKey,
        amount: res.amount,
        currency: res.currency,
        name: 'KANCHI JEWELRY',
        description: `Order ${res.orderNumber} - Fine Indian Jewellery`,
        order_id: res.razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        handler: async (paymentResponse) => {
          // 3. Cryptographic server-side payment verification
          setLoading(true);
          const verification = await callVerifyPaymentFunction({
            orderId: res.orderId,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });

          if (verification.success) {
            clearCart();
            setConfirmedOrder({
              orderNumber: res.orderNumber,
              totalAmount: res.amount / 100,
              paymentId: paymentResponse.razorpay_payment_id,
            });
          } else {
            setErrorMsg(`Payment verification error: ${verification.error || 'Signature check failed'}`);
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Failed to initiate secure checkout');
      setLoading(false);
    }
  };

  // If order was confirmed, show receipt
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#FFFFFF] border border-[#E8E4DA] p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FCF9F0] border border-[#C5A059] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#8C6D17]" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
            Order Confirmed & Payment Verified
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] mb-4">
            Thank You for Entrusting Kanchi Jewelry
          </h2>

          <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto mb-8 font-light leading-relaxed">
            Your creation has been allocated in our vault. Our master jewelers will prepare the hallmarked certificates and tamper-proof security courier.
          </p>

          <div className="bg-[#FAF9F5] border border-[#E8E4DA] p-6 max-w-md mx-auto text-left space-y-3 mb-8 text-xs">
            <div className="flex justify-between pb-2 border-b border-[#E8E4DA]">
              <span className="text-[#777777]">Order Reference</span>
              <span className="font-mono font-medium text-[#111111]">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#E8E4DA]">
              <span className="text-[#777777]">Total Paid</span>
              <span className="font-mono font-semibold text-[#111111]">{formatPrice(confirmedOrder.totalAmount)}</span>
            </div>
            {confirmedOrder.paymentId && (
              <div className="flex justify-between pb-2 border-b border-[#E8E4DA]">
                <span className="text-[#777777]">Transaction ID</span>
                <span className="font-mono text-[11px] text-[#555555]">{confirmedOrder.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#777777]">Delivery Status</span>
              <span className="text-[#8C6D17] font-medium">Preparing Insured Dispatch</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/account' : '/jewelry')}
              className="w-full sm:w-auto px-8 py-3 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors"
            >
              {user ? 'View Order in Account' : 'Continue Shopping'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-3 border border-[#D6CEBE] text-[#111111] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#FAF9F5] transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full border border-[#D6CEBE] flex items-center justify-center mx-auto mb-4 text-[#888888]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl text-[#111111] mb-2">No Items to Checkout</h2>
        <p className="text-xs text-[#666666] mb-6">Your shopping bag is empty. Add fine jewelry before checking out.</p>
        <button
          onClick={() => navigate('/jewelry')}
          className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] hover:bg-[#8C6D17] transition-colors"
        >
          Browse Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
          Secure Encrypted Transaction
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111111]">
          Checkout & Insured Delivery
        </h1>
      </div>

      {errorMsg && (
        <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-900 p-4 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Shipping Form Left */}
        <div className="lg:col-span-7">
          <form onSubmit={handleInitiatePayment} className="space-y-6">
            <div className="bg-white border border-[#E8E4DA] p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#E8E4DA] flex items-center justify-between">
                <span>1. Shipping Information</span>
                <span className="text-xs font-sans text-[#777777] font-normal">Armed Escort Transit</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Recipient's legal full name"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="For invoice and hallmark certificate"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House / Flat number, building, street"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Apartment / Suite / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="e.g. Near Temple Tower, Floor 4"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g. Chennai / Mumbai"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs px-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateway Box */}
            <div className="bg-white border border-[#E8E4DA] p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#E8E4DA] flex items-center justify-between">
                <span>2. Payment Method</span>
                <span className="text-xs font-sans text-[#8C6D17] font-medium">Razorpay 256-Bit</span>
              </h2>

              <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#8C6D17]" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#111111]">
                      Online Payment via Razorpay
                    </h4>
                    <p className="text-[11px] text-[#777777]">
                      Credit/Debit Cards, UPI, NetBanking, EMI & Wallets
                    </p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-[#888888]" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C6D17] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Order & Opening Razorpay...
                  </>
                ) : (
                  <>
                    Pay {formatPrice(grandTotal)} via Razorpay <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#888888] text-center leading-relaxed">
                By completing this order, you agree to our Terms of Sale and Hallmarking Purity Warranty. All prices and discounts are authoritatively verified server-side.
              </p>
            </div>
          </form>
        </div>

        {/* Order Review Sidebar Right */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E8E4DA] p-6 space-y-6 sticky top-28">
            <h3 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#E8E4DA]">
              Items in Vault Selection ({items.length})
            </h3>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#F0ECE2] pr-1">
              {items.map(({ product, quantity }) => {
                const img = product.images?.[0]?.public_url;
                const effectivePrice = product.discount_price ?? product.price;

                return (
                  <div key={product.id} className="py-3 flex gap-3 text-xs">
                    <div className="w-14 h-16 bg-[#F5F3EC] border border-[#E8E4DA] shrink-0 overflow-hidden">
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm text-[#111111] truncate">{product.name}</h4>
                      <div className="text-[11px] text-[#777777] mt-0.5">
                        Qty: {quantity} {product.material ? `· ${product.material}` : ''}
                      </div>
                    </div>
                    <div className="font-mono tabular-nums font-semibold text-[#111111] text-right">
                      {formatPrice(effectivePrice * quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#E8E4DA] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Gross Subtotal</span>
                <span className="font-mono tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-[#8C6D17]">
                  <span>Discount Applied</span>
                  <span className="font-mono tabular-nums">-{formatPrice(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#666666]">
                <span>Insured Armed Courier</span>
                <span className="font-mono tabular-nums">
                  {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DA] flex justify-between font-semibold text-[#111111]">
              <span className="font-serif text-base">Grand Total</span>
              <span className="font-mono text-xl tabular-nums">{formatPrice(grandTotal)}</span>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] space-y-2 text-[11px] text-[#666666]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span className="font-medium text-[#111111]">Anti-Tamper Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                <span>Transit fully insured up to point of customer signature</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
