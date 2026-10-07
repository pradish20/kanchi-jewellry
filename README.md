# KANCHI JEWELRY — Production E-Commerce Platform

A production-ready luxury jewelry e-commerce website for **KANCHI JEWELRY**, built with React 19, TypeScript, Vite, Tailwind CSS v4, Supabase PostgreSQL, Supabase Authentication, Supabase Storage, Supabase Edge Functions, and Razorpay.

---

## 🌟 Brand & Aesthetics

- **Brand**: KANCHI JEWELRY
- **Visual Direction**: Editorial luxury South Indian fine jewellery
- **Color Palette**: Gold accents (`#C5A059`, `#8C6D17`), Ivory/Off-white canvas (`#FAF9F5`, `#FFFFFF`), and Rich Black typography (`#111111`)
- **Typography**: Cormorant Garamond display serif paired with Plus Jakarta Sans body typography
- **Zero-Pill Discipline**: Clean, unboxed metadata with elegant typographic separators (`·`, `/`)

---

## 🏛️ Technical Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom font themes and gold tokens
- **Routing**: Client-side state and browser history navigation supporting `/jewelry`, `/jewelry/:category`, `/product/:slug`, `/new-items`, `/cart`, `/checkout`, `/account`, `/auth`, `/about`, `/contact`, `/admin/login`, `/admin`
- **Shopping Bag**: Active session cart state with real-time calculations and complimentary shipping threshold indicator
- **Security Boundary**: Zero secret keys in client bundles. Only public `VITE_SUPABASE_ANON_KEY` and `VITE_RAZORPAY_KEY_ID` are exposed.

### Backend (Supabase & PostgreSQL)
- **Database**: PostgreSQL with Row Level Security (RLS) on all tables
  - `categories` (Rings, Chains, Bracelets, Necklaces)
  - `products` (22K Gold, Polki diamonds, weight, dimensions, stock)
  - `product_images` (Supabase Storage associations)
  - `orders` & `order_items` (Historical snapshots)
  - `payments` (Authoritative transaction logs)
  - `wishlists` (Client-isolated via RLS)
  - `admin_users` (Database-level role authorization)
  - `site_settings` (Editable brand contacts and shipping fees)
  - `webhook_logs` (Idempotency ledger for webhooks)
- **Functions**: PL/pgSQL atomic stock deduction `deduct_product_stock()`
- **Storage**: Dedicated `jewelry-images` bucket for product photography
- **Edge Functions**:
  - `create-razorpay-order`: Authoritatively calculates totals and initiates order
  - `verify-payment`: Verifies HMAC-SHA256 signature server-side
  - `razorpay-webhook`: Asynchronously captures payment and refund events idempotently

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

### 3. Database Migration
In your Supabase SQL Editor, run:
- `supabase/migrations/20250101000000_initial_schema.sql`
- (Optional seed) `supabase/seed.sql`

For full details on Edge Functions, Admin user setup, and Razorpay webhooks, consult [SETUP.md](./SETUP.md).

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Security Highlights

1. **No Frontend Price Trust**: Total amounts, discounts, and inventory allocations are calculated server-side inside Supabase Edge Functions directly from the PostgreSQL catalog.
2. **Cryptographic Payment Verification**: Payment success is never trusted based on client signals alone; it requires an HMAC-SHA256 signature match against `RAZORPAY_KEY_SECRET`.
3. **Database-Level Authorization**: Admin routes are protected by checking the user's authenticated UID against `admin_users` using Postgres RLS and security definer functions.
4. **Idempotent Webhooks**: Every webhook event is logged in `webhook_logs` to prevent duplicate ledger transactions or multiple stock deductions.
