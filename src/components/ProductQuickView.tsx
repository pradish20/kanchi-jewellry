import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types/database';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  onViewDetails: (slug: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  onViewDetails,
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const images = product.images?.length
    ? product.images.map((i) => i.public_url)
    : [];

  const currentImage = images[selectedImageIndex] || '';
  const isOutOfStock = product.stock_quantity <= 0;
  const isWishlisted = isInWishlist(product.id);

  const regularPrice = product.price;
  const discountPrice = product.discount_price;
  const hasDiscount = discountPrice !== null && discountPrice < regularPrice;
  const effectivePrice = hasDiscount ? discountPrice! : regularPrice;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#FFFFFF] border border-[#E8E4DA] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#444444] hover:text-[#111111] z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Gallery Side */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-[#F5F3EC] overflow-hidden border border-[#E8E4DA]">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#888888]">
                  Fine Jewelry
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 shrink-0 border overflow-hidden ${
                      selectedImageIndex === idx ? 'border-[#C5A059] ring-1 ring-[#C5A059]' : 'border-[#E8E4DA]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#777777] uppercase tracking-[0.16em] mb-2">
                <span>SKU: {product.sku}</span>
                <span aria-hidden="true">·</span>
                <span>{product.material || '22K Gold'}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] font-medium leading-tight mb-3">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 font-mono tabular-nums mb-4">
                <span className="text-xl sm:text-2xl font-semibold text-[#111111]">
                  {formatPrice(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-[#888888] line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mb-6 font-light">
                {product.description || 'Artisanal heirloom jewelry crafted with traditional South Indian goldsmithing techniques.'}
              </p>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs py-4 border-y border-[#F0ECE2] mb-6">
                <div>
                  <span className="text-[#888888] block text-[11px] uppercase tracking-wider">Gross Weight</span>
                  <span className="font-medium text-[#222222]">{product.weight || '12.5 grams'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px] uppercase tracking-wider">Purity Stamp</span>
                  <span className="font-medium text-[#222222]">22K 916 BIS Hallmarked</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px] uppercase tracking-wider">Dimensions</span>
                  <span className="font-medium text-[#222222]">{product.dimensions || 'Standard Luxury Fit'}</span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[11px] uppercase tracking-wider">Availability</span>
                  <span className={`font-medium ${isOutOfStock ? 'text-red-700' : 'text-emerald-800'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in Vault`}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-[#D6CEBE]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-sm text-[#444444] hover:bg-[#FAF9F5]"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-mono font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-2 text-sm text-[#444444] hover:bg-[#FAF9F5]"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-6 text-xs uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-[#E5E1D6] text-[#888888] cursor-not-allowed'
                      : addedNotice
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#111111] text-[#FAF9F5] hover:bg-[#8C6D17]'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Shopping Bag'}
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border border-[#D6CEBE] hover:bg-[#FAF9F5] transition-colors ${
                    isWishlisted ? 'text-[#8A2525]' : 'text-[#444444]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#8A2525]' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onViewDetails(product.slug);
                  }}
                  className="text-xs uppercase tracking-[0.16em] text-[#8C6D17] hover:underline font-medium"
                >
                  View Full Product Details →
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Insured Delivery</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
