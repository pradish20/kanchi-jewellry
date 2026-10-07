import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  ZoomIn,
  X,
} from 'lucide-react';
import { Product } from '../types/database';
import { productsService } from '../services/productsService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  navigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, navigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const { addItem, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const item = await productsService.getProductBySlug(slug);
        if (mounted) {
          setProduct(item);
          setSelectedImageIndex(0);
          setQuantity(1);

          if (item?.category_id) {
            const rel = await productsService.getProducts({
              categorySlug: item.category?.slug,
              limit: 4,
            });
            if (mounted) {
              setRelatedProducts(rel.products.filter((p) => p.id !== item.id));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
        <span className="text-xs uppercase tracking-[0.18em] text-[#777777]">
          Inspecting vault creation...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-[#111111] mb-2">Jewellery Piece Not Found</h2>
        <p className="text-xs text-[#666666] mb-6">
          The requested creation may have been archived or is no longer available.
        </p>
        <button
          onClick={() => navigate('/jewelry')}
          className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] hover:bg-[#8C6D17] transition-colors"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

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
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const toggleSection = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#777777] mb-8 uppercase tracking-[0.16em]">
        <button onClick={() => navigate('/')} className="hover:text-[#111111]">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button onClick={() => navigate('/jewelry')} className="hover:text-[#111111]">
          Jewelry
        </button>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <button
              onClick={() => navigate(`/jewelry/${product.category?.slug}`)}
              className="hover:text-[#111111]"
            >
              {product.category.name}
            </button>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Two-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Column: Gallery & Lightbox */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails (Vertical or Horizontal) */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] shrink-0 pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-22 sm:w-20 sm:h-24 bg-[#F5F3EC] border overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#C5A059] ring-1 ring-[#C5A059]'
                      : 'border-[#E8E4DA] hover:border-[#CCCCCC]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport with Zoom Trigger */}
          <div className="flex-1 relative aspect-4/5 bg-[#F5F3EC] border border-[#E8E4DA] overflow-hidden group">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#888888]">
                Fine Jewelry Image
              </div>
            )}

            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 bg-white/90 backdrop-blur-xs text-[#111111] shadow-xs hover:bg-white transition-colors"
              title="Expand view"
              aria-label="Expand view"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div>
            {/* Metadata Kicker */}
            <div className="flex items-center gap-2 text-xs text-[#777777] uppercase tracking-[0.16em] mb-2">
              <span>SKU: {product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>{product.collection || 'Heirloom Heritage'}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 font-mono tabular-nums mb-6">
              <span className="text-2xl sm:text-3xl font-semibold text-[#111111]">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#888888] line-through">
                    {formatPrice(regularPrice)}
                  </span>
                  <span className="bg-[#111111] text-[#FAF9F5] text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5">
                    Save {Math.round(((regularPrice - discountPrice!) / regularPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mb-6 font-light">
              {product.description ||
                'Handcrafted in 22K certified hallmarked gold with meticulous South Indian artisanal finish. A regal testament to heirloom elegance.'}
            </p>

            {/* Specifications Matrix */}
            <div className="border border-[#E8E4DA] bg-[#FAF9F5] p-4 grid grid-cols-2 gap-3 text-xs mb-8">
              <div>
                <span className="text-[#888888] text-[11px] block uppercase tracking-wider">Metal & Purity</span>
                <span className="font-medium text-[#111111]">{product.material || '22K 916 Hallmarked Gold'}</span>
              </div>
              <div>
                <span className="text-[#888888] text-[11px] block uppercase tracking-wider">Gross Weight</span>
                <span className="font-medium text-[#111111]">{product.weight || '14.8 grams'}</span>
              </div>
              <div>
                <span className="text-[#888888] text-[11px] block uppercase tracking-wider">Dimensions</span>
                <span className="font-medium text-[#111111]">{product.dimensions || 'Custom Size Available'}</span>
              </div>
              <div>
                <span className="text-[#888888] text-[11px] block uppercase tracking-wider">Occasion</span>
                <span className="font-medium text-[#111111]">{product.occasion || 'Bridal & Celebratory'}</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="text-xs text-[#8A2525] font-medium uppercase tracking-wider">
                  Currently Out of Stock in Vault
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#2E6B34] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#2E6B34]" />
                  <span>In Stock — Ready for Insured Dispatch ({product.stock_quantity} available)</span>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Main CTAs */}
            <div className="space-y-4 mb-8">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#777777] uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center border border-[#D6CEBE]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-xs text-[#444444] hover:bg-[#FAF9F5]"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-mono font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-1.5 text-xs text-[#444444] hover:bg-[#FAF9F5]"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 text-xs uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-[#E5E1D6] text-[#888888] cursor-not-allowed'
                      : addedNotice
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#111111] text-[#FAF9F5] hover:bg-[#8C6D17]'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Shopping Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Shopping Bag'}
                    </>
                  )}
                </button>

                {!isOutOfStock && (
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 px-6 border border-[#111111] text-[#111111] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#111111] hover:text-[#FAF9F5] transition-colors"
                  >
                    Buy Now
                  </button>
                )}

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border border-[#D6CEBE] hover:bg-[#FAF9F5] transition-colors flex items-center justify-center ${
                    isWishlisted ? 'text-[#8A2525]' : 'text-[#444444]'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#8A2525]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Accordion Panels for Trust & Care */}
            <div className="border-t border-[#E8E4DA] divide-y divide-[#E8E4DA] text-xs">
              
              {/* Product Details Panel */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between font-medium text-[#111111] uppercase tracking-[0.15em] py-1 text-left"
                >
                  <span>Artisanal Details & Specifications</span>
                  {openAccordion === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'details' && (
                  <div className="pt-3 text-[#555555] space-y-2 font-light">
                    <p>
                      Each piece is forged with uncompromised traditional mastery. Micro-filigree wire work, hand-chased borders, and stone settings undergo a stringent 5-point quality inspection before leaving our atelier.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Certified Hallmarked 22K (916) Purity with unique HUID</li>
                      <li>Handcrafted by traditional goldsmiths from Kanchipuram</li>
                      <li>Conflict-free natural diamonds and ethically sourced gemstones</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Insured Shipping */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between font-medium text-[#111111] uppercase tracking-[0.15em] py-1 text-left"
                >
                  <span>Complimentary Insured Shipping</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pt-3 text-[#555555] space-y-2 font-light">
                    <p>
                      Every order is dispatched in tamper-proof security cases via specialized insured couriers. Transit is 100% insured until signed by you in person.
                    </p>
                    <p className="text-[11px]">
                      Estimated delivery: 3 to 5 business days across India. Same-day concierge pickup available in Chennai and Kanchipuram by appointment.
                    </p>
                  </div>
                )}
              </div>

              {/* Jewellery Care */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('care')}
                  className="w-full flex items-center justify-between font-medium text-[#111111] uppercase tracking-[0.15em] py-1 text-left"
                >
                  <span>Heirloom Care & Storage</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'care' && (
                  <div className="pt-3 text-[#555555] space-y-2 font-light">
                    <p>
                      Store in the velvet pouch provided. Avoid contact with perfumes, hairsprays, and harsh chemicals. Clean gently with a microfiber cloth to maintain the lustrous gold sheen.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:text-[#C5A059]"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-[#E8E4DA]">
          <div className="text-center max-w-md mx-auto mb-10">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-1">
              Complementary Masterpieces
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#111111]">
              You May Also Admire
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={(slug) => navigate(`/product/${slug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
