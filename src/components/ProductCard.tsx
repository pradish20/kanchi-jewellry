import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types/database';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (slug: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickView }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.public_url ||
    product.images?.[0]?.public_url ||
    '';

  const secondaryImage =
    product.images?.length && product.images.length > 1
      ? product.images.find((img) => !img.is_primary)?.public_url
      : primaryImage;

  const isOutOfStock = product.stock_quantity <= 0;
  const isWishlisted = isInWishlist(product.id);

  const regularPrice = product.price;
  const discountPrice = product.discount_price;
  const hasDiscount = discountPrice !== null && discountPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - discountPrice!) / regularPrice) * 100)
    : 0;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className="group flex flex-col bg-[#FFFFFF] border border-[#EBE7DE] hover:border-[#D6CEBE] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Image Container (65-75% height) */}
      <div className="relative aspect-4/5 w-full bg-[#F5F3EC] overflow-hidden">
        {primaryImage && !imageError ? (
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
            onClick={() => onNavigate(product.slug)}
          />
        ) : (
          /* Styled Fallback Container per Zero-Broken-Image Policy */
          <div
            onClick={() => onNavigate(product.slug)}
            className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FAF9F5] to-[#EAE6DA] cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-[#C5A059]" />
            </div>
            <span className="font-serif text-sm text-[#111111] font-medium tracking-wide">
              {product.name}
            </span>
            <span className="text-[11px] text-[#888888] mt-1 font-sans">
              {product.material || '22K Fine Gold'}
            </span>
          </div>
        )}

        {/* Minimal Unboxed Stock & Discount Indicator */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-[#111111] text-[#FAF9F5] text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-[#8A2525] text-[#FAF9F5] text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5">
              Sold Out
            </span>
          ) : product.stock_quantity <= 3 ? (
            <span className="bg-[#8C6D17] text-[#FAF9F5] text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5">
              Only {product.stock_quantity} Left
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs transition-colors z-10 ${
            isWishlisted ? 'text-[#8A2525]' : 'text-[#444444] hover:text-[#111111]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#8A2525]' : ''}`} />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden md:flex absolute bottom-3 left-3 right-3 py-2 bg-white/95 backdrop-blur-xs text-[#111111] text-[11px] uppercase tracking-[0.16em] font-medium items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#FAF9F5] shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#666666]" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed clean metadata with typographic separators */}
          <div className="flex items-center gap-2 text-[11px] text-[#777777] uppercase tracking-[0.15em] mb-1.5">
            <span>{product.material || '22K Gold'}</span>
            {product.weight && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.weight}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onNavigate(product.slug)}
            className="font-serif text-base sm:text-lg text-[#111111] font-medium leading-snug line-clamp-1 hover:text-[#8C6D17] cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-3 border-t border-[#F0ECE2] flex items-center justify-between">
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            {hasDiscount ? (
              <>
                <span className="text-sm sm:text-base font-semibold text-[#111111]">
                  {formatPrice(discountPrice!)}
                </span>
                <span className="text-xs text-[#888888] line-through font-normal">
                  {formatPrice(regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-semibold text-[#111111]">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addItem(product, 1)}
            disabled={isOutOfStock}
            className={`p-2 transition-colors focus-visible:outline-none ${
              isOutOfStock
                ? 'opacity-30 cursor-not-allowed text-[#888888]'
                : 'text-[#111111] hover:text-[#8C6D17] hover:bg-[#FAF9F5]'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to shopping bag'}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
