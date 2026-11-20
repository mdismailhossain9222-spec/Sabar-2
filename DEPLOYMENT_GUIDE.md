# Sabr By Simran — Complete Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED SUPABASE DATABASE                      │
│  ─────────────────────────────────────────────────────────────  │
│  Table: products  (public SELECT only)                          │
│  Table: orders    (public INSERT only)                          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────────────┐       ┌─────────────────────────────┐
│      MAIN WEBSITE           │       │       ADMIN DASHBOARD       │
│   (Vite + React + Hono)     │       │      (Next.js 15+)          │
│                             │       │                             │
│  • Cloudflare Workers       │       │  • Vercel                   │
│  • https://sabar-2...       │       │  • admin.sabarbysimran.com  │
│  • Port 5173 (local)        │       │  • Port 3000 (local)        │
└─────────────────────────────┘       └─────────────────────────────┘
```

---

## Prerequisites

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard → **New Project**
2. Organization: your existing team
3. Name: `Sabr By Simran`
4. Region: Singapore (closest to UAE)
5. Wait ~2 minutes for provisioning

### 2. Run Database Schema
1. In Supabase Dashboard → **SQL Editor**
2. Paste contents of `supabase-setup.sql` (from repo root)
3. Click **Run** — this creates:
   - `products` table (with your 4 products seeded)
   - `orders` table
   - RLS policies (public SELECT on products, public INSERT on orders)

### 3. Get Supabase Credentials
1. Go to **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJ...` (long JWT)

---

## Environment Variables Required

### Main Website (Cloudflare Worker)
Set via `wrangler secret put` or Cloudflare Dashboard:

```bash
# Required for Stripe
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET

# Required for WhatsApp notifications (NEW)
npx wrangler secret put WHATSAPP_ACCESS_TOKEN
npx wrangler secret put WHATSAPP_PHONE_NUMBER_ID
# Optional (defaults shown):
npx wrangler secret put WHATSAPP_TEMPLATE_NAME      # default: "order_confirmation"
npx wrangler secret put WHATSAPP_TEMPLATE_LANGUAGE  # default: "en_US"

# Required for Supabase (shared with Dashboard)
npx wrangler secret put VITE_SUPABASE_URL
npx wrangler secret put VITE_SUPABASE_ANON_KEY
```

### Dashboard (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## WhatsApp Cloud API Setup (for Task 2)

### 1. Create Meta Developer Account
1. Go to https://developers.facebook.com/ → **My Apps** → **Create App**
2. Choose **Business** → **WhatsApp Business API**
3. Complete business verification (required for production)

### 2. Set Up WhatsApp Business Account
1. In Meta Dashboard → **WhatsApp** → **Getting Started**
2. Add a **Phone Number** (this becomes your Business Account number)
3. Note the **Phone Number ID** (looks like `123456789012345`)

### 3. Create Message Template
1. Go to **WhatsApp** → **Message Templates** → **Create Template**
2. Category: **Utility** → **Order Update**
3. Template name: `order_confirmation` (or your choice)
4. Language: `en_US` (or your choice)
5. Template body (example):

```
Hello {{1}},

Your order {{2}} has been confirmed!

📦 Total: {{3}}
💳 Payment: {{4}}
📍 Delivery: {{5}}

Items:
{{6}}

Track your order: {{7}}

Thank you for choosing Sabr By Simran!
```

6. Submit for approval (takes minutes to hours)

### 4. Get Access Token
1. In Meta Dashboard → **WhatsApp** → **API Setup**
2. Generate **Permanent Access Token** (or use short-lived + refresh)
3. Copy the token

### 5. Add to Environment Variables
Add these 4 secrets to **both** Cloudflare Worker and Vercel Dashboard:

| Variable | Source | Example |
|----------|--------|---------|
| `WHATSAPP_ACCESS_TOKEN` | Meta Dashboard token | `EAA...` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business number ID | `123456789012345` |
| `WHATSAPP_TEMPLATE_NAME` | Your template name | `order_confirmation` |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Language code | `en_US` |

---

## Local Development

### Terminal 1 — Main Website
```bash
cd /d/Desktop/Sabr/2
npm run dev
# Runs on http://localhost:5173
```

### Terminal 2 — Dashboard
```bash
cd /d/Desktop/Sabr/2/Dashboard
npm run dev
# Runs on http://localhost:3000
```

### Test Order Flow
1. Open http://localhost:5173 → Add to cart → Checkout (COD)
2. Open http://localhost:3000 → See order appear instantly in Orders tab
3. Dashboard shows real-time data from Supabase

---

## Deployment

### 1. Main Website → Cloudflare Workers
```bash
cd /d/Desktop/Sabr/2
npm run build
npx wrangler deploy
# Deploys to: https://sabar-2.mdismailhossain9222.workers.dev
```

### 2. Dashboard → Vercel (Separate Project)

**Option A: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard → **Add New Project**
2. Import from GitHub: `mdismailhossain9222-spec/Sabar-2`
3. **Root Directory**: `Dashboard` ⚠️ (critical!)
4. Framework Preset: **Next.js** (auto-detected)
5. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   WHATSAPP_ACCESS_TOKEN=EAA...
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_TEMPLATE_NAME=order_confirmation
   WHATSAPP_TEMPLATE_LANGUAGE=en_US
   ```
6. Click **Deploy**

**Option B: CLI**
```bash
cd /d/Desktop/Sabr/2/Dashboard
npx vercel --prod
# Follow prompts, ensure Root Directory = Dashboard
```

### 3. Custom Subdomain for Dashboard
After Vercel deployment:
1. Vercel Dashboard → Project → **Settings → Domains**
2. Add `admin.sabarbysimran.com`
3. Vercel provides CNAME target → Add to your DNS (Cloudflare)

### 4. Admin Link in Main Website Footer
Already added in `src/pages/CheckoutPage.tsx` and `src/pages/Home.tsx`:
```tsx
<a href="https://admin.sabarbysimran.com" target="_blank" rel="noopener">
  Admin Dashboard
</a>
```

---

## Supabase Edge Function (Alternative WhatsApp Trigger)

If you prefer database-triggered WhatsApp instead of Worker webhook:

```bash
# 1. Install Supabase CLI
npm i -g supabase

# 2. Link to your project
cd /d/Desktop/Sabr/2
supabase link --project-ref YOUR_PROJECT_REF

# 3. Set secrets
supabase secrets set WHATSAPP_ACCESS_TOKEN=EAA...
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=123456789012345
supabase secrets set WHATSAPP_TEMPLATE_NAME=order_confirmation
supabase secrets set WHATSAPP_TEMPLATE_LANGUAGE=en_US

# 4. Deploy function
supabase functions deploy send-whatsapp-order

# 5. Create database webhook (in Supabase Dashboard → Database → Webhooks)
#    Table: orders, Events: INSERT, URL: https://YOUR_PROJECT.supabase.co/functions/v1/send-whatsapp-order
```

---

## Verification Checklist

| Component | Test |
|-----------|------|
| Main website loads | `https://sabar-2.mdismailhossain9222.workers.dev` → 200 OK |
| Checkout (COD) works | Place order → order saved to Supabase |
| Stripe checkout works | Place card order → redirects to Stripe |
| Dashboard loads | `https://admin.sabarbysimran.com` → 200 OK |
| Dashboard shows orders | Orders tab displays recent orders from Supabase |
| WhatsApp sends | After paid Stripe order → client receives WhatsApp |
| Admin link in footer | Main website footer has "Admin Dashboard" link |

---

## File Structure Summary

```
/d/Desktop/Sabr/2/
├── supabase/
│   ├── functions/send-whatsapp-order/index.ts    # Edge Function
│   └── setup.sql                                  # Run in SQL Editor
├── src/
│   ├── lib/
│   │   ├── whatsapp.ts                            # Worker WhatsApp helper
│   │   ├── supabase.ts                            # Main site Supabase client
│   │   └── orders.ts                              # Order submission
│   ├── worker.ts                                  # Cloudflare Worker (with WhatsApp)
│   ├── hooks/useStripe.ts                         # Stripe + metadata
│   └── pages/CheckoutPage.tsx                     # Updated for WhatsApp metadata
├── Dashboard/
│   ├── src/lib/
│   │   ├── supabase.ts                            # Dashboard Supabase client (lazy)
│   │   └── supabase-data.ts                       # Data layer (orders/products)
│   ├── src/app/api/*/route.ts                     # All API routes use Supabase
│   └── package.json                               # No Drizzle, uses @supabase/supabase-js
├── supabase-setup.sql                             # Root schema file
└── SUPABASE_SETUP.md                              # Setup instructions
```

---

## Quick Commands Reference

```bash
# Main website
cd /d/Desktop/Sabr/2
npm run dev          # Local dev (port 5173)
npm run build        # Production build
npx wrangler deploy  # Deploy to Cloudflare

# Dashboard
cd /d/Desktop/Sabr/2/Dashboard
npm run dev          # Local dev (port 3000)
npm run build        # Production build
npx vercel --prod    # Deploy to Vercel

# Supabase
supabase link --project-ref XXX
supabase functions deploy send-whatsapp-order
supabase db push     # If using local migrations
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Dashboard build fails on `supabaseUrl is required` | Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel env vars |
| WhatsApp not sending | Check Meta template approval status; verify phone number format |
| Orders not appearing in Dashboard | Verify Supabase RLS: orders table allows public INSERT |
| CORS errors | Check Worker CORS origins include Dashboard domain |
| `drizzle-orm` conflicts | Dashboard package.json no longer has Drizzle/pg dependencies |

---

**That's it!** Both apps now share the same Supabase database, with WhatsApp notifications on order confirmation. The Dashboard reads real-time orders/products, and the main website footer links to `admin.sabarbysimran.com`.