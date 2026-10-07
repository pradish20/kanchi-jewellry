import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    setLoading(true);
    try {
      const ids = await wishlistService.getWishlistProductIds(user.id);
      setWishlistIds(ids);
    } catch (e) {
      console.error('Error fetching wishlist', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    const isCurrentlyIn = isInWishlist(productId);

    // Optimistic UI update
    setWishlistIds((prev) =>
      isCurrentlyIn ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    if (user) {
      try {
        if (isCurrentlyIn) {
          await wishlistService.removeFromWishlist(user.id, productId);
        } else {
          await wishlistService.addToWishlist(user.id, productId);
        }
      } catch (e) {
        console.error('Wishlist sync error', e);
        // Rollback
        setWishlistIds((prev) =>
          isCurrentlyIn ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        loading,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
