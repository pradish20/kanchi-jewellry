import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WishlistItem } from '../types/database';

export const wishlistService = {
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!isSupabaseConfigured() || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products(
            *,
            category:categories(*),
            images:product_images(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as WishlistItem[]) || [];
    } catch {
      return [];
    }
  },

  async getWishlistProductIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured() || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map((item) => item.product_id);
    } catch {
      return [];
    }
  },

  async addToWishlist(userId: string, productId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;

    const { error } = await supabase.from('wishlists').insert({
      user_id: userId,
      product_id: productId,
    });

    if (error && error.code !== '23505') {
      // Ignore unique violation
      throw error;
    }
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },
};
