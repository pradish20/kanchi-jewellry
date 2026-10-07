import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  Database,
  CreditCard,
  Key,
} from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';

export const AdminSetupGuide: React.FC = () => {
  const config = getSupabaseConfig();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const adminPromotionSql = `-- Run this in your Supabase SQL Editor after signing up your user in the app:
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES (
    'PASTE_AUTH_USER_ID_HERE', -- Find this in Supabase Dashboard > Authentication > Users
    'admin',
    true
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', is_active = true;`;

  const storagePolicySql = `-- Create the dedicated storage bucket for product and category imagery:
INSERT INTO storage.buckets (id, name, public)
VALUES ('jewelry-images', 'jewelry-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view jewellery photography:
CREATE POLICY "Public Access Jewelry Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'jewelry-images');

-- Authenticated admins can upload & manage images:
CREATE POLICY "Admins Upload Jewelry Images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'jewelry-images' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  )
);`;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D17] font-medium block mb-1">
          Production Architecture & Credentials Guide
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
          Supabase & Razorpay Configuration
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Diagnostic inspector and step-by-step instructions to connect your live Supabase PostgreSQL and Razorpay payment gateway.
        </p>
      </div>

      {/* Live Connection Diagnostics */}
      <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
        <h2 className="font-serif text-lg text-[#111111] pb-3 border-b border-[#E8E4DA] flex items-center justify-between">
          <span>Live Environment Diagnostic</span>
          <span className="text-xs font-sans text-[#777777]">Client Status</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Supabase URL */}
          <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#777777] uppercase text-[10px] tracking-wider">VITE_SUPABASE_URL</span>
              {config.url ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div className="font-mono text-[11px] font-medium text-[#111111] truncate">
              {config.url || 'Not set in .env'}
            </div>
          </div>

          {/* Supabase Anon Key */}
          <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#777777] uppercase text-[10px] tracking-wider">VITE_SUPABASE_ANON_KEY</span>
              {config.hasKey ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div className="font-mono text-[11px] font-medium text-[#111111]">
              {config.hasKey ? 'Configured (Active)' : 'Not set in .env'}
            </div>
          </div>

          {/* Razorpay Key ID */}
          <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#777777] uppercase text-[10px] tracking-wider">VITE_RAZORPAY_KEY_ID</span>
              {config.hasRazorpayKey ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div className="font-mono text-[11px] font-medium text-[#111111] truncate">
              {config.hasRazorpayKey ? config.razorpayKeyId : 'Not set in .env'}
            </div>
          </div>
        </div>

        {config.isConfigured ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>Supabase is connected to your live PostgreSQL database!</span>
          </div>
        ) : (
          <div className="p-3 bg-[#FCF9F0] border border-[#EEDFAE] text-[#6F5517] text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C5A028] shrink-0 mt-0.5" />
            <div>
              <strong>Action Required:</strong> To persist products, orders, and real user authentication, copy <code>.env.example</code> to <code>.env</code> and fill in your Supabase project keys.
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Migration SQL */}
      <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
          <div>
            <h3 className="font-serif text-lg text-[#111111]">1. PostgreSQL Schema & RLS Migration</h3>
            <p className="text-xs text-[#777777]">Run in your Supabase Dashboard &gt; SQL Editor</p>
          </div>
          <span className="text-xs text-[#8C6D17] font-medium">Located at: /supabase/migrations/20250101000000_initial_schema.sql</span>
        </div>

        <p className="text-xs text-[#555555]">
          This migration creates all required tables (<code>products</code>, <code>categories</code>, <code>product_images</code>, <code>orders</code>, <code>order_items</code>, <code>payments</code>, <code>wishlists</code>, <code>admin_users</code>, <code>site_settings</code>, <code>webhook_logs</code>), atomic stock deduction function, indexes, and enables Row Level Security (RLS).
        </p>
      </div>

      {/* Step 2: Storage Bucket */}
      <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
          <div>
            <h3 className="font-serif text-lg text-[#111111]">2. Supabase Storage Setup</h3>
            <p className="text-xs text-[#777777]">Create bucket and permissions for product photographs</p>
          </div>
          <button
            onClick={() => copyToClipboard(storagePolicySql, 'storage')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-[#D6CEBE] text-xs hover:border-[#111111]"
          >
            {copiedSection === 'storage' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy SQL</span>
          </button>
        </div>

        <pre className="p-4 bg-[#111111] text-[#FAF9F5] text-[11px] font-mono overflow-x-auto">
          {storagePolicySql}
        </pre>
      </div>

      {/* Step 3: First Admin Promotion */}
      <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
          <div>
            <h3 className="font-serif text-lg text-[#111111]">3. Creating Your First Admin Account</h3>
            <p className="text-xs text-[#777777]">Secure database-level administrator authorization</p>
          </div>
          <button
            onClick={() => copyToClipboard(adminPromotionSql, 'admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-[#D6CEBE] text-xs hover:border-[#111111]"
          >
            {copiedSection === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy SQL</span>
          </button>
        </div>

        <ol className="list-decimal pl-4 space-y-2 text-xs text-[#555555]">
          <li>Navigate to the client portal and Register an account with your email.</li>
          <li>In your Supabase Dashboard, open <strong>Authentication &gt; Users</strong>.</li>
          <li>Copy your User UID (a UUID like <code>a1b2c3d4-...</code>).</li>
          <li>Run the SQL below in the SQL Editor, replacing <code>PASTE_AUTH_USER_ID_HERE</code> with your UID.</li>
          <li>You can now log in at <code>/admin/login</code> with your password!</li>
        </ol>

        <pre className="p-4 bg-[#111111] text-[#FAF9F5] text-[11px] font-mono overflow-x-auto">
          {adminPromotionSql}
        </pre>
      </div>

      {/* Step 4: Edge Functions & Razorpay Secrets */}
      <div className="bg-white border border-[#E8E4DA] p-6 space-y-4">
        <h3 className="font-serif text-lg text-[#111111] pb-3 border-b border-[#E8E4DA]">
          4. Supabase Edge Functions Deployment
        </h3>

        <div className="space-y-3 text-xs text-[#555555]">
          <p>Deploy the 3 functions using the Supabase CLI:</p>
          <pre className="p-3 bg-[#111111] text-[#FAF9F5] font-mono text-[11px]">
{`supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook`}
          </pre>

          <p className="font-medium text-[#111111] pt-2">Set Edge Function secrets in Supabase Dashboard &gt; Edge Functions &gt; Secrets:</p>
          <pre className="p-3 bg-[#111111] text-[#FAF9F5] font-mono text-[11px]">
{`supabase secrets set RAZORPAY_KEY_ID="rzp_live_..."
supabase secrets set RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"`}
          </pre>

          <p className="text-[11px] text-[#888888]">
            * Note: Razorpay Secret is NEVER sent to the browser and only resides in these encrypted Edge Functions.
          </p>
        </div>
      </div>

    </div>
  );
};
