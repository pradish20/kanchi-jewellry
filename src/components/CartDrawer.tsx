import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalItemsCount,
    subtotal,
    discountTotal,
    shippingFee,
    grandTotal,
    freeShippingThreshold,
  } = useCart();

  if (!isCartOpen) return null;

  const netProductAmount = subtotal - discountTotal;
  const progressPercent = Math.min(100, Math.round((netProductAmount / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - netProductAmount);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FFFFFF] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#111111]" />
            <h2 className="font-serif text-xl tracking-wider text-[#111111] font-medium">
              Shopping Bag ({totalItemsCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-[#666666] hover:text-[#111111]"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-[#FAF9F5] px-6 py-3 border-b border-[#E8E4DA] text-xs">
          {amountNeededForFreeShipping > 0 ? (
            <p className="text-[#555555]">
              Add <span className="font-mono font-medium text-[#111111]">{formatPrice(amountNeededForFreeShipping)}</span> more for complimentary insured courier delivery.
            </p>
          ) : (
            <p className="text-[#8C6D17] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              Complimentary Insured Armed Courier Unlocked
            </p>
          )}
          <div className="w-full bg-[#E5E1D6] h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#111111] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#F0ECE2]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full border border-[#D6CEBE] flex items-center justify-center mb-4 text-[#888888]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg text-[#111111] mb-1">Your bag is empty</h3>
              <p className="text-xs text-[#777777] max-w-xs mb-6">
                Discover our heirloom collection of 22K gold, polki diamonds, and temple jewellery.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('/jewelry');
                }}
                className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#8C6D17] transition-colors"
              >
                Explore Jewelry
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const img = product.images?.[0]?.public_url;
              const effectivePrice = product.discount_price ?? product.price;

              return (
                <div key={product.id} className="py-4 flex gap-4">
                  <div className="w-20 h-24 bg-[#F5F3EC] overflow-hidden border border-[#E8E4DA] shrink-0">
                    {img && (
                      <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-sm font-medium text-[#111111] line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-[#999999] hover:text-[#8A2525] p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-[#777777] mt-0.5">
                        {product.material || '22K Gold'} {product.weight ? `· ${product.weight}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D6CEBE]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#444444] hover:bg-[#FAF9F5]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock_quantity}
                          className="px-2 py-0.5 text-xs text-[#444444] hover:bg-[#FAF9F5] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="font-mono text-xs font-semibold tabular-nums text-[#111111]">
                        {formatPrice(effectivePrice * quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-[#FAF9F5] border-t border-[#E8E4DA] space-y-3">
            <div className="flex justify-between text-xs text-[#666666]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-xs text-[#8C6D17]">
                <span>Savings & Discounts</span>
                <span className="font-mono tabular-nums">-{formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#666666]">
              <span>Insured Shipping</span>
              <span className="font-mono tabular-nums">
                {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E8E4DA] flex justify-between text-sm font-semibold text-[#111111]">
              <span className="font-serif text-base">Estimated Total</span>
              <span className="font-mono text-base tabular-nums">{formatPrice(grandTotal)}</span>
            </div>

            <p className="text-[10px] text-[#888888] leading-tight text-center">
              * Final authoritative total and vault inventory reservation are securely verified server-side at checkout.
            </p>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
