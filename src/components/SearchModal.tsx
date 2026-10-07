import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../types/database';
import { productsService } from '../services/productsService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { products } = await productsService.getProducts({
          searchQuery: query.trim(),
          limit: 6,
        });
        setResults(products);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const quickSearches = ['Polki Ring', 'Temple Chain', 'Kangan Bracelet', 'Kasu Haram', '22K Gold', 'Bridal Choker'];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative bg-[#FFFFFF] border border-[#E8E4DA] shadow-2xl max-w-2xl w-full z-10 overflow-hidden animate-in fade-in slide-in-from-top-4">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-[#E8E4DA]">
          <Search className="w-5 h-5 text-[#888888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onClose();
                onViewAllResults(query.trim());
              }
            }}
            placeholder="Search rings, chains, necklaces, polki, gold..."
            className="w-full px-4 text-sm sm:text-base text-[#111111] placeholder-[#888888] focus:outline-none bg-transparent"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-[#C5A059] animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#888888] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="ml-3 p-1 text-[#888888] hover:text-[#111111] border-l border-[#E8E4DA] pl-3"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Suggestions */}
        {!query && (
          <div className="p-6 bg-[#FAF9F5]">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#888888] font-medium block mb-3">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 bg-white border border-[#E8E4DA] text-xs text-[#333333] hover:border-[#111111] hover:text-[#111111] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query && (
          <div className="max-h-96 overflow-y-auto p-4 sm:p-6 divide-y divide-[#F0ECE2]">
            {results.length > 0 ? (
              <>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#888888] pb-3">
                  Matching Treasures ({results.length})
                </div>
                {results.map((product) => {
                  const img = product.images?.[0]?.public_url;
                  const price = product.discount_price ?? product.price;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        onClose();
                        onSelectProduct(product.slug);
                      }}
                      className="py-3 flex items-center gap-4 hover:bg-[#FAF9F5] px-2 -mx-2 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-[#F0ECE2] overflow-hidden shrink-0 border border-[#E8E4DA]">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm text-[#111111] font-medium truncate group-hover:text-[#8C6D17]">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#777777] mt-0.5">
                          <span>{product.material || '22K Gold'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums font-medium text-[#111111]">
                            {formatPrice(price)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#111111] transition-colors" />
                    </div>
                  );
                })}

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onViewAllResults(query.trim());
                    }}
                    className="w-full py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#8C6D17] transition-colors"
                  >
                    View All Results for "{query}"
                  </button>
                </div>
              </>
            ) : !loading ? (
              <div className="py-8 text-center text-xs text-[#777777]">
                No fine jewelry found matching "{query}". Try checking the spelling or browse our collections.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
