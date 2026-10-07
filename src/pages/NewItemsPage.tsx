import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickView } from '../components/ProductQuickView';
import { Product } from '../types/database';
import { productsService } from '../services/productsService';
import { Loader2, Sparkles } from 'lucide-react';

interface NewItemsPageProps {
  navigate: (route: string) => void;
}

export const NewItemsPage: React.FC<NewItemsPageProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadNewItems = async () => {
      setLoading(true);
      try {
        const { products } = await productsService.getProducts({
          sortBy: 'newest',
          limit: 20,
        });
        if (mounted) setProducts(products);
      } catch (err) {
        console.error('Error fetching new arrivals', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNewItems();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Recently Unveiled</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#111111] font-normal tracking-tight mb-3">
          New Arrivals
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
          The latest masterworks from our Kanchipuram atelier. Every piece newly hallmarked and available for priority courier delivery.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#777777]">
            Loading recent arrivals...
          </span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-[#FAF9F5] border border-[#E8E4DA] p-8">
          <h3 className="font-serif text-xl text-[#111111] mb-2">No New Arrivals Currently</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mb-6">
            Explore our timeless heritage collection while our goldsmiths finish their next collection.
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
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={(slug) => navigate(`/product/${slug}`)}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewDetails={(slug) => navigate(`/product/${slug}`)}
      />
    </div>
  );
};
