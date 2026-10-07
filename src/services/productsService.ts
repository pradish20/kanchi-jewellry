import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category, ProductImage } from '../types/database';

export interface GetProductsParams {
  categorySlug?: string;
  categoryId?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc';
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  inStockOnly?: boolean;
  limit?: number;
  offset?: number;
}

// Curated architectural fallback products used when Supabase is not yet connected or tables are empty
export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Rings',
    slug: 'rings',
    description: 'Handcrafted solitaire, cocktail, and heritage polki rings in 22K hallmarked gold.',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Chains',
    slug: 'chains',
    description: 'Graceful twisted, rope, and traditional temple link chains crafted with heirloom finesse.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Sculptural temple kangan bangles, diamond cuff bracelets, and delicate filigree cuffs.',
    image_url: 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Regal royal chokers, uncut polki haar, and bridal statement necklaces with natural gemstones.',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 4,
  },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aadhya Royal Polki Solitaire Ring',
    slug: 'aadhya-royal-polki-solitaire-ring',
    sku: 'KJ-RNG-001',
    description: 'A magnificent handcrafted cocktail ring featuring an uncut polki diamond encircled by fine 22K yellow gold filigree and subtle black enamel accents.',
    price: 84500,
    discount_price: 79900,
    category_id: 'c1111111-1111-1111-1111-111111111111',
    material: '22K Gold & Polki Diamond',
    weight: '8.4 grams',
    dimensions: '22mm diameter',
    colour: 'Yellow Gold',
    collection: 'Royal Polki Heritage',
    occasion: 'Festive & Bridal',
    stock_quantity: 8,
    is_featured: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      {
        id: 'img-1-1',
        product_id: 'prod-1',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
      {
        id: 'img-1-2',
        product_id: 'prod-1',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
        is_primary: false,
        sort_order: 2,
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Surya Hand-Twisted Rope Chain',
    slug: 'surya-hand-twisted-rope-chain',
    sku: 'KJ-CHN-002',
    description: 'Classical South Indian heritage rope chain intricately twisted by master goldsmiths in hallmarked 22K gold. Elegant when worn solo or layered.',
    price: 125000,
    discount_price: null,
    category_id: 'c2222222-2222-2222-2222-222222222222',
    material: '22K Hallmarked Gold',
    weight: '24.2 grams',
    dimensions: '20 inches length',
    colour: 'Warm Yellow Gold',
    collection: 'Temple Classic',
    occasion: 'Everyday Luxury',
    stock_quantity: 5,
    is_featured: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    images: [
      {
        id: 'img-2-1',
        product_id: 'prod-2',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Kamakshi Floral Temple Kangan Pair',
    slug: 'kamakshi-floral-temple-kangan-pair',
    sku: 'KJ-BRC-003',
    description: 'A pair of traditional solid gold temple bangles adorned with high-relief floral carvings and bezel-set Burmese rubies.',
    price: 248000,
    discount_price: 235000,
    category_id: 'c3333333-3333-3333-3333-333333333333',
    material: '22K Gold & Natural Rubies',
    weight: '46.8 grams',
    dimensions: 'Size 2.6 (60mm diameter)',
    colour: 'Antique Matte Gold',
    collection: 'Temple Heritage',
    occasion: 'Bridal',
    stock_quantity: 3,
    is_featured: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    images: [
      {
        id: 'img-3-1',
        product_id: 'prod-3',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-4',
    name: 'Nitya Heritage Choker Necklace',
    slug: 'nitya-heritage-choker-necklace',
    sku: 'KJ-NCK-004',
    description: 'Opulent bridal choker featuring graduating rows of uncut diamonds with Basra pearl drops and handcrafted emerald cabochons.',
    price: 395000,
    discount_price: 375000,
    category_id: 'c4444444-4444-4444-4444-444444444444',
    material: '22K Gold, Polki & Basra Pearls',
    weight: '72.6 grams',
    dimensions: 'Adjustable dori thread (14-18 in)',
    colour: 'Yellow Gold with Emerald Accents',
    collection: 'Kanchi Imperial',
    occasion: 'Bridal',
    stock_quantity: 2,
    is_featured: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    images: [
      {
        id: 'img-4-1',
        product_id: 'prod-4',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-5',
    name: 'Veda Minimalist Diamond Band',
    slug: 'veda-minimalist-diamond-band',
    sku: 'KJ-RNG-005',
    description: 'Understated modern eternity ring in 18K yellow gold flush-set with brilliant-cut diamonds. Minimal, contemporary luxury.',
    price: 52000,
    discount_price: null,
    category_id: 'c1111111-1111-1111-1111-111111111111',
    material: '18K Gold & VVS Diamonds',
    weight: '4.1 grams',
    dimensions: '3mm band width',
    colour: 'Yellow Gold',
    collection: 'Contemporary Fine',
    occasion: 'Everyday Luxury',
    stock_quantity: 12,
    is_featured: false,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    images: [
      {
        id: 'img-5-1',
        product_id: 'prod-5',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-6',
    name: 'Meera Fluted Gold Link Chain',
    slug: 'meera-fluted-gold-link-chain',
    sku: 'KJ-CHN-006',
    description: 'A sleek Italian-inspired interlocking box link chain sculpted in polished 22K yellow gold with a secure safety lobster clasp.',
    price: 98000,
    discount_price: 92000,
    category_id: 'c2222222-2222-2222-2222-222222222222',
    material: '22K Yellow Gold',
    weight: '18.0 grams',
    dimensions: '18 inches length',
    colour: 'Yellow Gold',
    collection: 'Contemporary Fine',
    occasion: 'Everyday Luxury',
    stock_quantity: 6,
    is_featured: false,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    images: [
      {
        id: 'img-6-1',
        product_id: 'prod-6',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-7',
    name: 'Rukmini Open Filigree Cuff',
    slug: 'rukmini-open-filigree-cuff',
    sku: 'KJ-BRC-007',
    description: 'Delicate architectural open cuff bracelet crafted with lace-like gold wirework and cabochon emerald terminal caps.',
    price: 142000,
    discount_price: null,
    category_id: 'c3333333-3333-3333-3333-333333333333',
    material: '22K Gold & Zambian Emeralds',
    weight: '26.5 grams',
    dimensions: 'Adjustable open wrist size',
    colour: 'Yellow Gold',
    collection: 'Temple Heritage',
    occasion: 'Festive',
    stock_quantity: 4,
    is_featured: false,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    images: [
      {
        id: 'img-7-1',
        product_id: 'prod-7',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1611591475810-7e3d7a863750?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: 'prod-8',
    name: 'Devi Peacock Kasu Haram Necklace',
    slug: 'devi-peacock-kasu-haram-necklace',
    sku: 'KJ-NCK-008',
    description: 'Classic South Indian Kasu Mala long necklace featuring embossed Lakshmi coin medallions crowned by sculpted peacock motifs.',
    price: 460000,
    discount_price: 438000,
    category_id: 'c4444444-4444-4444-4444-444444444444',
    material: '22K Hallmarked Gold',
    weight: '88.2 grams',
    dimensions: '26 inches long haram',
    colour: 'Antique Finish Gold',
    collection: 'Kanchi Imperial',
    occasion: 'Bridal',
    stock_quantity: 1,
    is_featured: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    images: [
      {
        id: 'img-8-1',
        product_id: 'prod-8',
        storage_path: null,
        public_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
        sort_order: 1,
      },
    ],
  },
];

export const productsService = {
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return FALLBACK_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_CATEGORIES;
      }
      return data;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  },

  async getAllCategoriesAdmin(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return FALLBACK_CATEGORIES;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProducts(params: GetProductsParams = {}): Promise<{ products: Product[]; total: number }> {
    if (!isSupabaseConfigured()) {
      let filtered = [...FALLBACK_PRODUCTS];

      if (params.categorySlug) {
        const cat = FALLBACK_CATEGORIES.find(
          (c) =>
            c.slug.toLowerCase() === params.categorySlug?.toLowerCase() ||
            c.name.toLowerCase() === params.categorySlug?.toLowerCase()
        );
        if (cat) {
          filtered = filtered.filter((p) => p.category_id === cat.id);
        }
      }

      if (params.categoryId) {
        filtered = filtered.filter((p) => p.category_id === params.categoryId);
      }

      if (params.featuredOnly) {
        filtered = filtered.filter((p) => p.is_featured);
      }

      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.material?.toLowerCase().includes(q) ||
            p.collection?.toLowerCase().includes(q)
        );
      }

      if (params.minPrice !== undefined) {
        filtered = filtered.filter((p) => (p.discount_price ?? p.price) >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        filtered = filtered.filter((p) => (p.discount_price ?? p.price) <= params.maxPrice!);
      }
      if (params.material) {
        filtered = filtered.filter((p) => p.material?.toLowerCase().includes(params.material!.toLowerCase()));
      }
      if (params.inStockOnly) {
        filtered = filtered.filter((p) => p.stock_quantity > 0);
      }

      if (params.sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
      } else if (params.sortBy === 'price_asc') {
        filtered.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
      } else if (params.sortBy === 'price_desc') {
        filtered.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
      }

      const total = filtered.length;
      const offset = params.offset || 0;
      const limit = params.limit || 24;
      const paginated = filtered.slice(offset, offset + limit);

      return { products: paginated, total };
    }

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `, { count: 'exact' })
        .eq('is_active', true);

      if (params.categorySlug) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .ilike('slug', params.categorySlug)
          .maybeSingle();

        if (catData?.id) {
          query = query.eq('category_id', catData.id);
        } else {
          const { data: catByName } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', params.categorySlug)
            .maybeSingle();

          if (catByName?.id) {
            query = query.eq('category_id', catByName.id);
          }
        }
      }

      if (params.categoryId) {
        query = query.eq('category_id', params.categoryId);
      }

      if (params.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      if (params.searchQuery) {
        query = query.or(`name.ilike.%${params.searchQuery}%,description.ilike.%${params.searchQuery}%,sku.ilike.%${params.searchQuery}%,material.ilike.%${params.searchQuery}%`);
      }

      if (params.minPrice !== undefined) {
        query = query.gte('price', params.minPrice);
      }
      if (params.maxPrice !== undefined) {
        query = query.lte('price', params.maxPrice);
      }
      if (params.material) {
        query = query.ilike('material', `%${params.material}%`);
      }
      if (params.inStockOnly) {
        query = query.gt('stock_quantity', 0);
      }

      if (params.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (params.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (params.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const offset = params.offset || 0;
      const limit = params.limit || 24;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error || !data || data.length === 0) {
        // Fallback to sample data if database has not been seeded yet
        return this.getProducts({ ...params, limit: undefined, offset: undefined });
      }

      return { products: data as Product[], total: count || data.length };
    } catch {
      return this.getProducts({ ...params, limit: undefined, offset: undefined });
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured()) {
      const found = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
      return found || null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        const found = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
        return found || null;
      }

      return data as Product;
    } catch {
      const found = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
      return found || null;
    }
  },

  async getNewArrivals(limit = 4): Promise<Product[]> {
    const { products } = await this.getProducts({ sortBy: 'newest', limit });
    return products;
  },

  // Helper to extract strictly valid database columns for products table
  // Ensures category_id UUID is stored and never sends a non-existent 'category' column
  sanitizeProductPayload(productData: Partial<Product>): Record<string, any> {
    const raw = productData as Record<string, any>;

    const payload: Record<string, any> = {
      name: raw.name !== undefined ? raw.name : undefined,
      slug: raw.slug !== undefined ? raw.slug : undefined,
      sku: raw.sku !== undefined ? raw.sku : undefined,
      description: raw.description !== undefined ? raw.description : undefined,
      price: raw.price !== undefined ? Number(raw.price) : undefined,
      discount_price:
        raw.discount_price !== undefined
          ? raw.discount_price !== null && raw.discount_price !== ''
            ? Number(raw.discount_price)
            : null
          : undefined,
      // Store category UUID in category_id column. Never send 'category'
      category_id:
        raw.category_id !== undefined
          ? (raw.category_id || null)
          : raw.category && typeof raw.category === 'object' && raw.category.id
          ? raw.category.id
          : undefined,
      material: raw.material !== undefined ? raw.material : undefined,
      weight: raw.weight !== undefined ? raw.weight : raw.gross_weight !== undefined ? raw.gross_weight : undefined,
      dimensions: raw.dimensions !== undefined ? raw.dimensions : undefined,
      colour: raw.colour !== undefined ? raw.colour : undefined,
      collection: raw.collection !== undefined ? raw.collection : raw.collection_name !== undefined ? raw.collection_name : undefined,
      occasion: raw.occasion !== undefined ? raw.occasion : undefined,
      stock_quantity: raw.stock_quantity !== undefined ? Number(raw.stock_quantity) : undefined,
      is_featured: raw.is_featured !== undefined ? Boolean(raw.is_featured) : undefined,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : undefined,
    };

    // Remove any undefined properties so partial updates don't overwrite unspecified fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    // CRITICAL: Strip any joined relation, client field, or non-existent columns.
    // The products table in Supabase does NOT have a 'category' column, only 'category_id' (UUID).
    delete payload.category;
    delete payload.images;
    delete payload.collection_name;
    delete payload.gross_weight;
    delete payload.id;

    return payload;
  },

  // Admin Product Operations
  async createProduct(productData: Partial<Product>, images: Array<{ url: string; isPrimary: boolean }>): Promise<Product> {
    const payload = this.sanitizeProductPayload(productData);

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .single();

    if (error) throw error;

    if (images && images.length > 0) {
      const imageRecords = images.map((img, idx) => ({
        product_id: data.id,
        public_url: img.url,
        is_primary: img.isPrimary,
        sort_order: idx + 1,
      }));
      await supabase.from('product_images').insert(imageRecords);
    }

    return data as Product;
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    const payload: Record<string, any> = {
      ...this.sanitizeProductPayload(productData),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('jewelry-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('jewelry-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async saveCategory(categoryData: Partial<Category>): Promise<Category> {
    if (categoryData.id) {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
