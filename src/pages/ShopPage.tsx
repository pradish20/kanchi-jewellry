import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { ProductQuickView } from '../components/ProductQuickView';
import { Product, Category } from '../types/database';
import { productsService } from '../services/productsService';
import { Loader2 } from 'lucide-react';

interface ShopPageProps {
  categorySlug?: string;
  initialSearchQuery?: string;
  navigate: (route: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  categorySlug,
  initialSearchQuery,
  navigate,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price_asc' | 'price_desc'>('featured');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [material, setMaterial] = useState<string | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(initialSearchQuery);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    productsService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const res = await productsService.getProducts({
          categorySlug,
          searchQuery,
          sortBy,
          minPrice,
          maxPrice,
          material,
          inStockOnly,
          limit: pageSize,
          offset,
        });

        if (mounted) {
          setProducts(res.products);
          setTotalProducts(res.total);
        }
      } catch (err) {
        console.error('Catalog fetch error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, [categorySlug, searchQuery, sortBy, minPrice, maxPrice, material, inStockOnly, page]);

  const handleSelectCategory = (slug?: string) => {
    setPage(1);
    if (!slug) {
      navigate('/jewelry');
    } else {
      navigate(`/jewelry/${slug}`);
    }
  };

  const handleResetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMaterial(undefined);
    setInStockOnly(false);
    setSearchQuery(undefined);
    setSortBy('featured');
    setPage(1);
  };

  const currentCategory = categories.find((c) => c.slug === categorySlug);
  const pageTitle = currentCategory ? currentCategory.name : 'All Fine Jewelry';
  const pageDescription = currentCategory
    ? currentCategory.description
    : 'Explore our complete heritage collection of 22K hallmarked gold, uncut polki diamonds, and temple masterworks.';

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
          {categorySlug ? 'Curated Collection' : 'Heirloom Catalog'}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#111111] font-normal tracking-tight mb-3">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
          {pageDescription}
        </p>
      </div>

      {/* Filter and Sort Control Bar */}
      <ProductFilters
        categories={categories}
        selectedCategorySlug={categorySlug}
        onSelectCategory={handleSelectCategory}
        sortBy={sortBy}
        onChangeSort={(s) => {
          setSortBy(s);
          setPage(1);
        }}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChangePriceRange={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
          setPage(1);
        }}
        material={material}
        onChangeMaterial={(m) => {
          setMaterial(m);
          setPage(1);
        }}
        inStockOnly={inStockOnly}
        onToggleInStock={(v) => {
          setInStockOnly(v);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        totalResults={totalProducts}
      />

      {/* Active Search Term notice */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-[#FAF9F5] p-3 border border-[#E8E4DA] text-xs">
          <span>
            Showing results for query: <strong className="text-[#111111]">"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery(undefined)}
            className="text-[#8C6D17] hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-3" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#777777]">
            Retrieving vault catalog...
          </span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-[#FAF9F5] border border-[#E8E4DA] p-8">
          <h3 className="font-serif text-xl text-[#111111] mb-2">No Jewellery Found</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mb-6">
            We couldn't find any creations matching your current filter criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] hover:bg-[#8C6D17] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2 pt-8 border-t border-[#E8E4DA]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => {
                    setPage(pNum);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className={`w-9 h-9 text-xs font-mono transition-colors ${
                    page === pNum
                      ? 'bg-[#111111] text-[#FAF9F5]'
                      : 'bg-white border border-[#D6CEBE] text-[#333333] hover:border-[#111111]'
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>
          )}
        </>
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
