# Setup Instructions — Supabase Database

## Step 1: Create the Project
Go to https://supabase.com/dashboard → New Project

- **Organization**: `team_nvVvtu92W727wk0dfkKrvGmI` (your existing team)
- **Name**: Sabr By Simran
- **Database password**: choose a strong password
- **Region**: Singapore (closest to UAE)

Wait ~2 minutes for provisioning.

---

## Step 2: Get Your Credentials
After project creation:
1. Go to **Settings → API** (in the Supabase dashboard sidebar)
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJ...` (long string starting with eyJ)

---

## Step 3: Run the SQL Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Paste the contents of `supabase-setup.sql` (included in this repo)
3. Click **Run** — this creates both tables, enables RLS, sets policies, and seeds products

---

## Step 4: Update Environment Variables
Add these to your `.env` (already has placeholders):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Also add them as Cloudflare Worker environment variables via Wrangler:
```bash
npx wrangler secret put VITE_SUPABASE_URL
npx wrangler secret put VITE_SUPABASE_ANON_KEY
```

Or set them in the Cloudflare Dashboard → Workers & Pages → sabar-2 → Settings → Variables.

---

## What Happens When Connected
- **Products page** (`/`, `/product/:id`) will fetch from Supabase at runtime instead of using static data
- **Checkout** will save COD orders directly to the `orders` table with full customer details
- Stripe checkout orders still come through webhook; they'll need a separate handler to write to DB when webhook is ready
- If Supabase credentials aren't set, the app falls back gracefully to localStorage-only mode

---

## Verification Commands
```bash
# Test Supabase connection works in browser console:
# Check that products load dynamically (replace URL/key with yours)
# The app uses `isSupabaseConfigured()` which checks both vars are real URLs/keys
```
