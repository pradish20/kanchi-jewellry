import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FolderTree,
  Boxes,
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminSettings } from './AdminSettings';
import { AdminSetupGuide } from './AdminSetupGuide';

interface AdminLayoutProps {
  initialTab?: string;
  navigate: (route: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ initialTab = 'dashboard', navigate }) => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isConfigured = isSupabaseConfigured();

  // If initialTab changes from parent
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Auth guard: If Supabase is configured and user is not admin, redirect to admin login
  useEffect(() => {
    if (!loading && isConfigured && (!user || !isAdmin)) {
      if (activeTab !== 'setup-guide') {
        navigate('/admin/login');
      }
    }
  }, [user, isAdmin, loading, isConfigured, activeTab, navigate]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Payments', icon: ShoppingBag },
    { id: 'products', label: 'Product Catalog', icon: Layers },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'inventory', label: 'Vault Inventory', icon: Boxes },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'setup-guide', label: 'Supabase & Razorpay Setup', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EE] flex flex-col lg:flex-row text-[#111111]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#111111] text-[#FAF9F5] p-4 flex items-center justify-between border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1 text-[#FAF9F5]"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg tracking-wider text-[#FAF9F5]">
            KANCHI ADMIN
          </span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-[#C5A059] flex items-center gap-1"
        >
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-[#111111] text-[#FAF9F5] flex flex-col justify-between transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#262626] flex items-center justify-between">
            <div>
              <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#FAF9F5] block">
                KANCHI
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium">
                Vault Administration
              </span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-[#888888] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left font-medium ${
                    isActive
                      ? 'bg-[#C5A059] text-[#111111]'
                      : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#FAF9F5]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#262626] space-y-2 text-xs">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#888888] hover:text-[#FAF9F5] hover:bg-[#1A1A1A] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Storefront</span>
          </button>

          {user && (
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#888888] hover:text-red-400 hover:bg-[#1A1A1A] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          )}

          <div className="pt-2 text-[10px] text-[#666666] text-center">
            Signed in as: {user?.email || 'Setup Preview Mode'}
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'setup-guide' && <AdminSetupGuide />}
      </main>
    </div>
  );
};
