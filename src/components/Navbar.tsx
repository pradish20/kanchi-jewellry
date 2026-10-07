import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, onOpenSearch }) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jewelryDropdownOpen, setJewelryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isConfigured = isSupabaseConfigured();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setJewelryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setJewelryDropdownOpen(false);
  };

  const isJewelryActive = currentRoute.startsWith('/jewelry');

  return (
    <>
      {/* Top Heritage & Trust Ticker */}
      <div className="bg-[#111111] text-[#FAF9F5] text-xs py-2 px-4 border-b border-[#262626]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#C5A059] tracking-widest text-[11px] uppercase font-medium">BIS Hallmarked 22K Gold</span>
            <span className="text-[#444444]" aria-hidden="true">·</span>
            <span className="hidden sm:inline text-[#A0A0A0] text-[11px]">Insured & Discreet Global Shipping</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {!isConfigured && (
              <button
                onClick={() => handleNav('/admin/setup-guide')}
                className="text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
              >
                Connect Supabase Setup
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className="text-[#C5A059] hover:text-[#EEDFAE] font-medium"
              >
                Admin Portal
              </button>
            )}
            <span className="text-[#888888]">Heritage of Kanchipuram</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar - strict 3-zone contract */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E8E4DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#111111] hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNav('/')}
              className="text-left group"
            >
              <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.2em] text-[#111111] group-hover:text-[#8C6D17] transition-colors whitespace-nowrap">
                KANCHI JEWELRY
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single line, unboxed, quiet hover states) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-medium text-[#222222]">
            <button
              onClick={() => handleNav('/')}
              className={`hover:text-[#8C6D17] transition-colors pb-1 border-b ${
                currentRoute === '/' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#444444]'
              }`}
            >
              Home
            </button>

            {/* Dropdown Menu for Jewelry */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setJewelryDropdownOpen(!jewelryDropdownOpen)}
                onMouseEnter={() => setJewelryDropdownOpen(true)}
                className={`flex items-center gap-1 hover:text-[#8C6D17] transition-colors pb-1 border-b ${
                  isJewelryActive ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#444444]'
                }`}
              >
                <span>Jewelry</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${jewelryDropdownOpen ? 'rotate-180 text-[#8C6D17]' : ''}`} />
              </button>

              {jewelryDropdownOpen && (
                <div
                  onMouseLeave={() => setJewelryDropdownOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-[#FFFFFF] border border-[#E8E4DA] shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[#888888] px-3 py-1 font-semibold border-b border-[#F0ECE2] mb-1">
                    Fine Collections
                  </div>
                  <button
                    onClick={() => handleNav('/jewelry')}
                    className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#111111] hover:bg-[#FAF9F5] hover:text-[#8C6D17] transition-colors"
                  >
                    All Jewelry
                  </button>
                  <button
                    onClick={() => handleNav('/jewelry/rings')}
                    className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#444444] hover:bg-[#FAF9F5] hover:text-[#8C6D17] transition-colors"
                  >
                    Rings
                  </button>
                  <button
                    onClick={() => handleNav('/jewelry/chains')}
                    className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#444444] hover:bg-[#FAF9F5] hover:text-[#8C6D17] transition-colors"
                  >
                    Chains
                  </button>
                  <button
                    onClick={() => handleNav('/jewelry/bracelets')}
                    className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#444444] hover:bg-[#FAF9F5] hover:text-[#8C6D17] transition-colors"
                  >
                    Bracelets
                  </button>
                  <button
                    onClick={() => handleNav('/jewelry/necklaces')}
                    className="w-full text-left px-3 py-2 text-xs uppercase tracking-[0.15em] text-[#444444] hover:bg-[#FAF9F5] hover:text-[#8C6D17] transition-colors"
                  >
                    Necklaces
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('/new-items')}
              className={`hover:text-[#8C6D17] transition-colors pb-1 border-b ${
                currentRoute === '/new-items' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#444444]'
              }`}
            >
              New Items
            </button>
            <button
              onClick={() => handleNav('/about')}
              className={`hover:text-[#8C6D17] transition-colors pb-1 border-b ${
                currentRoute === '/about' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#444444]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNav('/contact')}
              className={`hover:text-[#8C6D17] transition-colors pb-1 border-b ${
                currentRoute === '/contact' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#444444]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Search, Wishlist, Account, Cart, Shop Now) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#222222] hover:text-[#8C6D17] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              title="Search jewelry catalog"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => handleNav('/account?tab=wishlist')}
              className="p-2 text-[#222222] hover:text-[#8C6D17] transition-colors relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              title="View wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#111111] text-[#FAF9F5] text-[10px] font-mono flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav(user ? '/account' : '/auth')}
              className="p-2 text-[#222222] hover:text-[#8C6D17] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              title={user ? 'My Account' : 'Sign In'}
              aria-label="Account"
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#222222] hover:text-[#8C6D17] transition-colors relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C5A059] text-[#111111] text-[10px] font-mono font-bold flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('/jewelry')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#8C6D17] transition-colors whitespace-nowrap ml-2 shadow-sm"
            >
              Shop Now
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF9F5] shadow-2xl z-50 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#E8E4DA]">
              <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#111111]">
                KANCHI JEWELRY
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#444444] hover:text-[#111111]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 py-6 text-sm uppercase tracking-[0.16em] font-medium text-[#222222]">
              <button
                onClick={() => handleNav('/')}
                className="text-left py-2 hover:text-[#8C6D17] border-b border-[#F0ECE2]"
              >
                Home
              </button>
              <div className="py-2 border-b border-[#F0ECE2]">
                <div className="text-[#888888] text-xs mb-2 tracking-[0.2em]">Jewelry Collections</div>
                <div className="flex flex-col gap-2 pl-3 text-xs tracking-[0.15em] text-[#333333]">
                  <button onClick={() => handleNav('/jewelry')} className="text-left py-1 hover:text-[#8C6D17]">
                    All Jewelry
                  </button>
                  <button onClick={() => handleNav('/jewelry/rings')} className="text-left py-1 hover:text-[#8C6D17]">
                    Rings
                  </button>
                  <button onClick={() => handleNav('/jewelry/chains')} className="text-left py-1 hover:text-[#8C6D17]">
                    Chains
                  </button>
                  <button onClick={() => handleNav('/jewelry/bracelets')} className="text-left py-1 hover:text-[#8C6D17]">
                    Bracelets
                  </button>
                  <button onClick={() => handleNav('/jewelry/necklaces')} className="text-left py-1 hover:text-[#8C6D17]">
                    Necklaces
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleNav('/new-items')}
                className="text-left py-2 hover:text-[#8C6D17] border-b border-[#F0ECE2]"
              >
                New Items
              </button>
              <button
                onClick={() => handleNav('/about')}
                className="text-left py-2 hover:text-[#8C6D17] border-b border-[#F0ECE2]"
              >
                About
              </button>
              <button
                onClick={() => handleNav('/contact')}
                className="text-left py-2 hover:text-[#8C6D17] border-b border-[#F0ECE2]"
              >
                Contact
              </button>
              <button
                onClick={() => handleNav(user ? '/account' : '/auth')}
                className="text-left py-2 hover:text-[#8C6D17] border-b border-[#F0ECE2]"
              >
                {user ? 'My Account' : 'Sign In / Register'}
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-[#E8E4DA] flex flex-col gap-3">
              <button
                onClick={() => handleNav('/jewelry')}
                className="w-full py-3 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors"
              >
                Shop Collection
              </button>
              <p className="text-[11px] text-[#777777] text-center tracking-wide">
                Kanchipuram, Tamil Nadu, India
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
