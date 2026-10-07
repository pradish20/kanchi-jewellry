import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Category } from '../types/database';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory: (slug?: string) => void;
  sortBy: 'featured' | 'newest' | 'price_asc' | 'price_desc';
  onChangeSort: (sort: 'featured' | 'newest' | 'price_asc' | 'price_desc') => void;
  minPrice?: number;
  maxPrice?: number;
  onChangePriceRange: (min?: number, max?: number) => void;
  material?: string;
  onChangeMaterial: (mat?: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const MATERIALS = ['22K Gold', '18K Gold', 'Polki Diamond', 'Burmese Rubies', 'Zambian Emeralds'];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  sortBy,
  onChangeSort,
  minPrice,
  maxPrice,
  onChangePriceRange,
  material,
  onChangeMaterial,
  inStockOnly,
  onToggleInStock,
  onResetFilters,
  totalResults,
}) => {
  return (
    <div className="bg-[#FAF9F5] border border-[#E8E4DA] p-4 sm:p-6 mb-8">
      {/* Top Bar: Category Pill-Free Tabs & Sorting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DA]">
        
        {/* Category Filter Controls (Segmented clean text buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors whitespace-nowrap border-b-2 ${
              !selectedCategorySlug
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#666666] hover:text-[#111111]'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors whitespace-nowrap border-b-2 ${
                selectedCategorySlug === cat.slug
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Result Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-xs text-[#777777] font-mono tabular-nums whitespace-nowrap">
            {totalResults} {totalResults === 1 ? 'Piece' : 'Pieces'}
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-[11px] text-[#777777] uppercase tracking-wider whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as any)}
              className="bg-white border border-[#D6CEBE] text-xs py-1.5 px-3 text-[#111111] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Featured Collections</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Secondary Filter Row: Price, Material, In Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 items-center">
        
        {/* Material Selector */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
            Precious Material
          </label>
          <select
            value={material || ''}
            onChange={(e) => onChangeMaterial(e.target.value || undefined)}
            className="w-full bg-white border border-[#D6CEBE] text-xs py-1.5 px-3 text-[#111111] focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Materials</option>
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Filter */}
        <div>
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-[#777777] mb-1">
            <span>Price Ceiling</span>
            <span className="font-mono">{maxPrice ? `₹${(maxPrice / 1000).toFixed(0)}k` : 'Any'}</span>
          </div>
          <input
            type="range"
            min="20000"
            max="600000"
            step="10000"
            value={maxPrice || 600000}
            onChange={(e) => onChangePriceRange(minPrice, Number(e.target.value))}
            className="w-full accent-[#111111] cursor-pointer"
          />
        </div>

        {/* In-Stock Toggle */}
        <div className="flex items-center pt-2 sm:pt-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#333333]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onToggleInStock(e.target.checked)}
              className="accent-[#111111] w-4 h-4 cursor-pointer"
            />
            <span className="uppercase tracking-wider text-[11px]">Ready in Vault Only</span>
          </label>
        </div>

        {/* Reset Filter Button */}
        <div className="flex justify-end pt-2 sm:pt-4">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#777777] hover:text-[#111111] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>
    </div>
  );
};
