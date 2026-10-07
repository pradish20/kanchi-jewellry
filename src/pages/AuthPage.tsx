import React, { useState } from 'react';
import { Lock, Mail, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  navigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const isConfigured = isSupabaseConfigured();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, redirect to account
  if (user) {
    navigate('/account');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate('/account');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully! Check your email inbox to verify your account or sign in directly.');
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Password reset link sent to your email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E8E4DA] p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-2">
            Client Portal
          </span>
          <h1 className="font-serif text-3xl text-[#111111]">
            {mode === 'signin' && 'Sign In to Your Account'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h1>
          <p className="text-xs text-[#777777] mt-2 font-light">
            Access your orders, bespoke jewelry inquiries, and personal vault wishlist.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-3 bg-[#FCF9F0] border border-[#EEDFAE] text-[11px] text-[#6F5517]">
            <strong>Note:</strong> Supabase credentials are required for live accounts. Add your Supabase URL & Key in <code>.env</code> or visit the setup guide.
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full legal name"
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs pl-9 pr-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs pl-9 pr-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] uppercase tracking-wider text-[#777777]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#8C6D17] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] text-xs pl-9 pr-3 py-2.5 text-[#111111] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#8C6D17] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Password Reset'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-6 border-t border-[#E8E4DA] text-center text-xs text-[#666666]">
          {mode === 'signin' ? (
            <p>
              New to Kanchi Jewelry?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[#111111] font-semibold hover:text-[#8C6D17] underline ml-1"
              >
                Register an Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-[#111111] font-semibold hover:text-[#8C6D17] underline ml-1"
              >
                Sign In Instead
              </button>
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-[#F0ECE2]">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-[11px] text-[#888888] hover:text-[#111111] transition-colors"
            >
              Are you an administrator? Sign in to Admin Portal →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
