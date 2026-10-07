# KANCHI JEWELRY — PRODUCTION SETUP & DEPLOYMENT GUIDE

This document provides the complete, step-by-step instructions to connect your **Supabase PostgreSQL database**, **Supabase Authentication**, **Supabase Storage**, **Supabase Edge Functions**, and **Razorpay Payment Gateway**.

---

## 1. Quick Architecture Overview

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase Auth (Sign Up, Sign In, Password Reset, RBAC)
- **Storage**: Supabase Storage bucket (`jewelry-images`)
- **Payments**: Razorpay via Supabase Edge Functions (`create-razorpay-order`, `verify-payment`, `razorpay-webhook`)
- **Security Boundary**: The Razorpay secret key and Supabase Service Role key exist **ONLY** in Supabase Edge Function secrets. They never touch the browser.

---

## 2. Environment Variables Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# FRONTEND / CLIENT-SIDE (Safe to expose in browser bundle)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
VITE_RAZORPAY_KEY_ID="rzp_live_your_key_id" # or rzp_test_...
```

---

## 3. Supabase Database Setup

### Step 3.1: Run Schema Migration
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project, click **SQL Editor** in the left menu, then click **New Query**.
3. Open `supabase/migrations/20250101000000_initial_schema.sql` from this codebase.
4. Paste the complete SQL content and click **Run**.
5. This creates:
   - `categories` table with indexes
   - `products` table with indexes
   - `product_images` table with cascade delete
   - `orders` table
   - `order_items` table
   - `payments` table
   - `wishlists` table
   - `admin_users` table and `public.is_admin()` security helper function
   - `site_settings` table
   - `webhook_logs` table (for idempotent webhooks)
   - `deduct_product_stock()` atomic PL/pgSQL function
   - Row Level Security (RLS) policies for all tables

### Step 3.2: (Optional) Seed Sample Jewelry Catalog
If you want initial 22K gold rings, chains, bangles, and necklaces to test with:
1. In Supabase SQL Editor, open `supabase/seed.sql`.
2. Paste and click **Run**.

---

## 4. Supabase Storage Setup (Product Imagery)

1. In your Supabase Dashboard, click **Storage** in the left sidebar.
2. Click **New bucket**.
3. Bucket name: `jewelry-images`
4. Set **Public bucket** to `ON` (so images can be rendered in the store).
5. In SQL Editor, run the storage policies:

```sql
-- Allow public visitors to read jewelry photos:
CREATE POLICY "Public Read Jewelry Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'jewelry-images');

-- Allow authenticated admins to upload product photos:
CREATE POLICY "Admins Upload Jewelry Images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'jewelry-images' AND
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  )
);
```

---

## 5. First Admin User Creation

We never use hardcoded credentials or client-side checks for administrative privileges. Authorization is enforced at the database level using `admin_users` and RLS.

1. Open the storefront in your browser and visit `/auth`.
2. Click **Register an Account** and sign up with your admin email address.
3. Open your Supabase Dashboard, go to **Authentication > Users**.
4. Find your newly created user and copy the **User UID** (UUID format).
5. In the Supabase SQL Editor, run:

```sql
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES (
  'PASTE_YOUR_COPIED_USER_UID_HERE',
  'admin',
  true
);
```

6. You can now visit `/admin/login` on the website and log in.

---

## 6. Supabase Edge Functions Deployment (Razorpay)

### Step 6.1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 6.2: Link Your Supabase Project
```bash
supabase login
supabase link --project-ref your-project-ref
```

### Step 6.3: Set Function Secrets
Set your private keys in Supabase (NEVER in Git or React code):

```bash
supabase secrets set RAZORPAY_KEY_ID="rzp_live_your_key_id"
supabase secrets set RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase Edge Functions runtime)*.

### Step 6.4: Deploy Functions
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook
```

---

## 7. Razorpay Webhook Configuration

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings > Webhooks > Add New Webhook**.
3. **Webhook URL**:
   `https://<your-project-ref>.supabase.co/functions/v1/razorpay-webhook`
4. **Secret**: Enter your `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events**:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Click **Create Webhook**.

---

## 8. Verifying Payment & Order Security

- **Price & Stock Integrity**: The browser only sends product IDs and quantities. The Supabase Edge function `create-razorpay-order` calculates authoritative prices, discounts, shipping, and verifies current inventory against PostgreSQL before initiating any payment with Razorpay.
- **Payment Verification**: Payments are only marked `PAID` after cryptographic HMAC-SHA256 signature verification in `verify-payment` or verified webhook notifications.
- **Idempotency**: Razorpay webhook processing records event IDs in `webhook_logs` to prevent duplicate ledger transactions.

---

## 9. Deployment to Production

### Frontend (Vercel / Cloudflare Pages / Netlify / Cloud Run):
Build the production bundle:
```bash
npm run build
```
Set environment variables in your hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`
