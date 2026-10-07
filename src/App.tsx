import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { NewItemsPage } from './pages/NewItemsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { isSupabaseConfigured } from './lib/supabase';
import { KeyRound, X } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [searchParamQuery, setSearchParamQuery] = useState<string | undefined>();

  // Browser navigation sync
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentRoute) {
      window.history.pushState({}, '', path);
      setCurrentRoute(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isConfigured = isSupabaseConfigured();
  const isAdminView = currentRoute.startsWith('/admin') && currentRoute !== '/admin/login';

  // Route matching helper
  const renderCurrentPage = () => {
    // 1. Admin Login
    if (currentRoute === '/admin/login') {
      return <AdminLogin navigate={navigate} />;
    }

    // 2. Admin Portal (/admin, /admin/setup-guide, etc.)
    if (currentRoute.startsWith('/admin')) {
      const subTab = currentRoute.replace('/admin/', '').replace('/admin', '') || 'dashboard';
      return <AdminLayout initialTab={subTab} navigate={navigate} />;
    }

    // 3. Product Details: /product/:slug
    if (currentRoute.startsWith('/product/')) {
      const slug = currentRoute.replace('/product/', '');
      return <ProductDetailPage slug={slug} navigate={navigate} />;
    }

    // 4. Jewelry Category Pages: /jewelry/:cat
    if (currentRoute.startsWith('/jewelry/')) {
      const categorySlug = currentRoute.replace('/jewelry/', '');
      return (
        <ShopPage
          categorySlug={categorySlug}
          initialSearchQuery={searchParamQuery}
          navigate={navigate}
        />
      );
    }

    // 5. Main Shop: /jewelry
    if (currentRoute === '/jewelry') {
      return <ShopPage initialSearchQuery={searchParamQuery} navigate={navigate} />;
    }

    // 6. New Items: /new-items
    if (currentRoute === '/new-items') {
      return <NewItemsPage navigate={navigate} />;
    }

    // 7. Cart: /cart
    if (currentRoute === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    // 8. Checkout: /checkout
    if (currentRoute === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    // 9. Account: /account
    if (currentRoute.startsWith('/account')) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = (urlParams.get('tab') as any) || 'orders';
      return <AccountPage initialTab={tabParam} navigate={navigate} />;
    }

    // 10. Customer Auth: /auth
    if (currentRoute === '/auth' || currentRoute === '/login' || currentRoute === '/register') {
      return <AuthPage navigate={navigate} />;
    }

    // 11. About: /about
    if (currentRoute === '/about') {
      return <AboutPage navigate={navigate} />;
    }

    // 12. Contact: /contact
    if (currentRoute === '/contact') {
      return <ContactPage />;
    }

    // 13. Default: Home Page
    return <HomePage navigate={navigate} />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SettingsProvider>
            <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#111111]">
              
              {/* Optional Development Diagnostic Banner */}
              {!isConfigured && !bannerDismissed && !isAdminView && (
                <div className="bg-[#FAF9F5] text-[#111111] px-4 py-2.5 text-xs border-b border-[#E8E4DA] shadow-xs">
                  <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#8C6D17] shrink-0" />
                      <span>
                        <strong>Kanchi Jewelry:</strong> Production backend ready. Add your Supabase &amp; Razorpay credentials in <code>.env</code> to persist live data.
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => navigate('/admin/setup-guide')}
                        className="text-[#8C6D17] hover:underline font-semibold"
                      >
                        View Setup Instructions →
                      </button>
                      <button
                        onClick={() => setBannerDismissed(true)}
                        className="text-[#777777] hover:text-[#111111] p-0.5"
                        aria-label="Dismiss banner"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Storefront Navbar (Hidden on Admin pages) */}
              {!isAdminView && (
                <Navbar
                  currentRoute={currentRoute}
                  navigate={navigate}
                  onOpenSearch={() => setSearchModalOpen(true)}
                />
              )}

              {/* Page Content Viewport */}
              <main className="flex-1">
                {renderCurrentPage()}
              </main>

              {/* Public Storefront Footer (Hidden on Admin pages) */}
              {!isAdminView && <Footer navigate={navigate} />}

              {/* Slide-over Cart Drawer */}
              {!isAdminView && <CartDrawer onNavigate={navigate} />}

              {/* Search Modal */}
              <SearchModal
                isOpen={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
                onSelectProduct={(slug) => navigate(`/product/${slug}`)}
                onViewAllResults={(q) => {
                  setSearchParamQuery(q);
                  navigate('/jewelry');
                }}
              />

            </div>
          </SettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
