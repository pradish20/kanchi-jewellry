import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  navigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discountTotal,
    shippingFee,
    grandTotal,
    freeShippingThreshold,
  } = useCart();

  const netProductAmount = subtotal - discountTotal;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - netProductAmount);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full border border-[#D6CEBE] flex items-center justify-center mx-auto mb-4 text-[#888888]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl text-[#111111] mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#666666] max-w-sm mx-auto mb-8 font-light">
          Explore our collection of handcrafted 22K gold rings, chains, bracelets, and bridal necklaces.
        </p>
        <button
          onClick={() => navigate('/jewelry')}
          className="px-8 py-3 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors"
        >
          Explore Fine Jewelry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-[#E8E4DA] mb-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D17] block mb-1">
            Active Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#111111]">
            Your Shopping Bag
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-[0.15em] text-[#888888] hover:text-[#8A2525] transition-colors"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Items Table */}
        <div className="lg:col-span-8 divide-y divide-[#E8E4DA]">
          {items.map(({ product, quantity }) => {
            const img = product.images?.[0]?.public_url;
            const effectivePrice = product.discount_price ?? product.price;

            return (
              <div key={product.id} className="py-6 flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-28 bg-[#F5F3EC] border border-[#E8E4DA] shrink-0 overflow-hidden">
                  {img && (
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => navigate(`/product/${product.slug}`)}
                        className="font-serif text-lg text-[#111111] hover:text-[#8C6D17] cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#777777] mt-1">
                        <span>SKU: {product.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.material || '22K Gold'}</span>
                        {product.weight && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{product.weight}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono tabular-nums">
                      <span className="text-base font-semibold text-[#111111]">
                        {formatPrice(effectivePrice * quantity)}
                      </span>
                      {quantity > 1 && (
                        <div className="text-[11px] text-[#888888]">
                          {formatPrice(effectivePrice)} each
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F5F3EC]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#777777] uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center border border-[#D6CEBE]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3 py-1 text-xs text-[#444444] hover:bg-[#FAF9F5]"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-mono font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock_quantity}
                          className="px-3 py-1 text-xs text-[#444444] hover:bg-[#FAF9F5] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-xs text-[#888888] hover:text-[#8A2525] flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-6">
            <button
              onClick={() => navigate('/jewelry')}
              className="text-xs uppercase tracking-[0.16em] text-[#111111] hover:text-[#8C6D17] flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Browsing Collections</span>
            </button>
          </div>
        </div>

        {/* Order Summary Side */}
        <div className="lg:col-span-4">
          <div className="bg-[#FAF9F5] border border-[#E8E4DA] p-6 space-y-4 sticky top-28">
            <h3 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#E8E4DA]">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-[#555555]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#111111]">{formatPrice(subtotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-[#8C6D17]">
                  <span>Special Savings</span>
                  <span className="font-mono tabular-nums">-{formatPrice(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Courier</span>
                <span className="font-mono tabular-nums text-[#111111]">
                  {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            {amountNeededForFreeShipping > 0 && (
              <div className="p-3 bg-white border border-[#E8E4DA] text-[11px] text-[#666666]">
                Add <strong className="font-mono text-[#111111]">{formatPrice(amountNeededForFreeShipping)}</strong> for complimentary insured armed transit.
              </div>
            )}

            <div className="pt-4 border-t border-[#E8E4DA] flex justify-between font-semibold text-[#111111]">
              <span className="font-serif text-base">Estimated Total</span>
              <span className="font-mono text-lg tabular-nums">{formatPrice(grandTotal)}</span>
            </div>

            <p className="text-[10px] text-[#888888] leading-tight">
              * Rates and inventory allocations are authoritatively validated server-side during checkout creation.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#777777]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>256-Bit Encrypted Razorpay Checkout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
