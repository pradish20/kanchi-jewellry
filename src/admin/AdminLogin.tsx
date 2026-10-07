import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  navigate: (route: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { signIn, isAdmin, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  // If already logged in as admin, go to /admin
  if (user && isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!isConfigured) {
        setErrorMsg('Supabase is not configured yet. Please configure your Supabase URL & Key in .env and create the admin user.');
        setLoading(false);
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Check if user is present in admin_users table
      setTimeout(() => {
        if (!isAdmin) {
          setErrorMsg('Access Restricted: This authenticated account does not possess administrator privileges in admin_users.');
        } else {
          navigate('/admin');
        }
        setLoading(false);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#111111] text-[#FAF9F5] border border-[#262626] p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-[#C5A059]/50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[#C5A059]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#C5A059] font-medium block mb-1">
            Privileged Access
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">
            Kanchi Vault Administration
          </h1>
          <p className="text-xs text-[#888888] mt-2 font-light">
            Authorized personnel only. Protected by Supabase Row Level Security & RBAC.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kanchijewelry.com"
                className="w-full bg-[#1A1A1A] border border-[#333333] text-xs pl-9 pr-3 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#999999] mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#1A1A1A] border border-[#333333] text-xs pl-9 pr-3 py-2.5 text-[#FAF9F5] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FAF9F5] text-[#111111] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262626] text-center space-y-3">
          <button
            onClick={() => navigate('/admin/setup-guide')}
            className="text-xs text-[#C5A059] hover:underline block w-full"
          >
            Need help creating your first Admin account? View Guide →
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#666666] hover:text-[#999999]"
          >
            Return to Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
