import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Gem, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickView } from '../components/ProductQuickView';
import { Product, Category } from '../types/database';
import { productsService } from '../services/productsService';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadHomeData = async () => {
      try {
        const [cats, featRes, newsRes] = await Promise.all([
          productsService.getCategories(),
          productsService.getProducts({ featuredOnly: true, limit: 4 }),
          productsService.getNewArrivals(4),
        ]);

        if (mounted) {
          setCategories(cats);
          setFeaturedProducts(featRes.products);
          setNewArrivals(newsRes);
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-[#0F0F10] text-[#FAF9F5] overflow-hidden -mt-4">
        {/* Background Visual Layer with Subtle Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
            alt="Kanchi Royal Indian Bridal Jewellery"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0F0F10]/50 to-[#0F0F10]" />
        </div>

        {/* Hero Content (Restrained, high-character typography, no long paragraphs) */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 flex flex-col items-center">
          <span className="text-[#C5A059] text-xs sm:text-sm uppercase tracking-[0.28em] font-medium mb-4 block">
            Temple Craftsmanship · Pure 22K Gold
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#FAF9F5] leading-[1.08] mb-6 text-balance max-w-3xl">
            Timeless Jewellery. Endless Elegance.
          </h1>

          <p className="text-sm sm:text-base text-[#D4CEBF] font-light max-w-xl mb-10 leading-relaxed tracking-wide">
            Discover jewellery crafted to celebrate every moment. Rooted in the ancient gold sculpting heritage of Kanchipuram.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/jewelry')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FAF9F5] text-[#111111] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A059] hover:text-[#111111] transition-all shadow-md"
            >
              Shop Collection
            </button>
            <button
              onClick={() => navigate('/new-items')}
              className="w-full sm:w-auto px-8 py-3.5 border border-[#C5A059]/60 text-[#FAF9F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF9F5]/10 hover:border-[#C5A059] transition-all"
            >
              Explore New Items
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
            Heirloom Curations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight">
            Featured Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/jewelry/${cat.slug}`)}
              className="group relative aspect-4/5 bg-[#F5F3EC] overflow-hidden cursor-pointer border border-[#E8E4DA] hover:border-[#C5A059] transition-all"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium mb-1">
                  Collection
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#FAF9F5] font-medium tracking-wide">
                  {cat.name}
                </h3>
                <span className="text-xs text-[#E5E1D6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 flex items-center gap-1">
                  View category <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COLLECTION (is_featured = true) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8E4DA]">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-1">
              Curated by Master Goldsmiths
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight">
              Featured Collection
            </h2>
          </div>
          <button
            onClick={() => navigate('/jewelry')}
            className="text-xs uppercase tracking-[0.18em] text-[#111111] hover:text-[#8C6D17] flex items-center gap-1.5 font-medium transition-colors"
          >
            <span>View All Jewelry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={(slug) => navigate(`/product/${slug}`)}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8E4DA]">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-1">
              Fresh from our Vault
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => navigate('/new-items')}
            className="text-xs uppercase tracking-[0.18em] text-[#111111] hover:text-[#8C6D17] flex items-center gap-1.5 font-medium transition-colors"
          >
            <span>Explore All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={(slug) => navigate(`/product/${slug}`)}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. WHY KANCHI JEWELRY */}
      <section className="bg-[#FAF9F5] border-y border-[#E8E4DA] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
              The Heritage Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight">
              Why Kanchi Jewelry
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white border border-[#E8E4DA] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mb-4">
                <Gem className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Authentic Craftsmanship
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-light">
                Sculpted by master South Indian artisans using centuries-old repoussé and filigree goldsmithing traditions.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E4DA] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Elegant Designs
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-light">
                Balanced between sacred temple royalty and modern minimal grace for the discerning connoisseur.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E4DA] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Secure Payments
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-light">
                Encrypted Razorpay payment gateway with server-authoritative checkout and zero compromise on security.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E8E4DA] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border border-[#C5A059]/40 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-lg text-[#111111] font-medium mb-2">
                Trusted Service
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed font-light">
                100% BIS Hallmarked purity, tamper-proof armed courier transit, and dedicated bridal concierge care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#111111] text-[#FAF9F5] p-10 sm:p-16 text-center border border-[#262626] relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <span className="text-[#C5A059] text-[11px] uppercase tracking-[0.25em] font-medium block mb-3">
              Heirloom Bespoke Jewelry
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#FAF9F5] mb-6 text-balance">
              Find Something Truly Timeless.
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed mb-8 font-light">
              Explore our full collection of 22K hallmarked gold and uncut polki diamond creations crafted to accompany life's grandest milestones.
            </p>
            <button
              onClick={() => navigate('/jewelry')}
              className="px-8 py-3.5 bg-[#FAF9F5] text-[#111111] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A059] transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewDetails={(slug) => navigate(`/product/${slug}`)}
      />
    </div>
  );
};
