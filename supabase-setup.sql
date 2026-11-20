-- Sabr By Simran — Database Schema (SQL)
-- Run this in Supabase Dashboard → SQL Editor after creating the project.

-- ──────────────────────────────────────────────────────────────
-- 1. CREATE TABLES
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,           -- AED whole numbers (e.g. 1000 = £1,000)
  category TEXT NOT NULL,
  colour TEXT NOT NULL,
  image TEXT NOT NULL,
  "imageAlt" TEXT NOT NULL,
  "imageWidth" INTEGER NOT NULL,
  "imageHeight" INTEGER NOT NULL,
  note TEXT NOT NULL,
  microcopy TEXT,
  description TEXT NOT NULL,
  sizes TEXT[] NOT NULL,            -- JSON array of size strings
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_emirate TEXT NOT NULL,
  payment_method TEXT NOT NULL,     -- 'apple' | 'google' | 'card' | 'cod'
  currency TEXT NOT NULL,
  total_aed NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | shipped | delivered
  items_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 3. POLICIES
-- ──────────────────────────────────────────────────────────────

-- products: public SELECT only (anyone can read)
DROP POLICY IF EXISTS "public-read-products" ON products;
CREATE POLICY "public-read-products" ON products
  FOR SELECT TO public USING (true);

-- orders: public INSERT only (no SELECT/UPDATE/DELETE for anon users)
DROP POLICY IF EXISTS "public-insert-orders" ON orders;
CREATE POLICY "public-insert-orders" ON orders
  FOR INSERT TO public WITH CHECK (true);

-- Allow authenticated users full access to orders (for admin/dashboard use later)
DROP POLICY IF EXISTS "admin-full-orders" ON orders;
CREATE POLICY "admin-full-orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────
-- 4. SEED PRODUCTS
-- ──────────────────────────────────────────────────────────────

INSERT INTO products (id, name, price, category, colour, image, "imageAlt", "imageWidth", "imageHeight", note, microcopy, description, sizes, badge) VALUES
  ('black-swan', 'The Black Swan', 1000, 'Eveningwear', 'Noir silk', '/The Black Swan.png',
   'The Black Swan — sculptural black satin evening dress', 1180, 1600,
   'Bias-cut liquid satin with a hand-draped neckline.',
   'A silhouette of its own',
   'Our signature after-dark silhouette, cut on the bias so the satin moves with you. A hand-draped neckline and open back keep the line sculptural, never severe.',
   ARRAY['S','M','L','XL'], 'Signature'),

  ('eclat', 'The Éclat', 800, 'Occasion', 'Blush satin', '/The Éclat.png',
   'The Éclat — blush pink satin column dress with a shoulder bow', 1200, 1600,
   'A soft rose column, finished with a sculptural bow.',
   'The new feminine',
   'A quiet entrance piece in blush satin. The column cut skims rather than clings, while an asymmetric shoulder bow gives The Éclat its soft, unmistakable presence.',
   ARRAY['S','M','L','XL'], 'New in'),

  ('espresso', 'The Espresso', 1500, 'Tailoring', 'Espresso', '/The Espresso.png',
   'The Espresso — chocolate brown tailored blazer and wide-leg trousers', 1200, 1600,
   'Sharp, feminine tailoring in a warm chocolate palette.',
   'The details do the talking',
   'A modern two-piece in deep chocolate. The single-breasted blazer is nipped at the waist and paired with a fluid wide-leg trouser — boardroom sharp, entirely feminine.',
   ARRAY['S','M','L','XL'], 'Limited'),

  ('coco', 'The Coco', 1800, 'Tweed', 'Crème bouclé', '/The Coco.png',
   'The Coco — cream bouclé tweed jacket and skirt set with gold buttons', 1200, 1600,
   'Cream bouclé and pearl detailing, made to be kept.',
   'An edit worth remembering',
   'A heirloom set in cream bouclé tweed, finished with pearl buttons and a softly structured shoulder. Designed to be worn together for occasions, or apart for every day.',
   ARRAY['S','M','L','XL'], NULL);
