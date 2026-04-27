-- ============================================================
-- supabase-setup.sql
-- Run this in your Supabase SQL Editor to set up the schema.
-- https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- ── 1. Categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- ── 2. Products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Row Level Security ─────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can view menu)
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

-- Authenticated write (only logged-in admin can modify)
CREATE POLICY "Auth insert categories"
  ON categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update categories"
  ON categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth delete categories"
  ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert products"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update products"
  ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth delete products"
  ON products FOR DELETE TO authenticated USING (true);

-- ── 4. Seed data (optional) ───────────────────────────────────
INSERT INTO categories (name) VALUES
  ('Coffee'),
  ('Cold Drinks'),
  ('Desserts'),
  ('Food')
ON CONFLICT (name) DO NOTHING;

-- Seed a few sample products (replace image_url with real ones)
WITH cat AS (SELECT id, name FROM categories)
INSERT INTO products (name, description, price, image_url, category_id)
SELECT 'Oat Milk Latte',
       'Smooth espresso with silky oat milk, lightly sweetened',
       5.50,
       'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80',
       (SELECT id FROM cat WHERE name = 'Coffee')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Oat Milk Latte');

WITH cat AS (SELECT id, name FROM categories)
INSERT INTO products (name, description, price, image_url, category_id)
SELECT 'Cappuccino',
       'Classic Italian espresso topped with velvety foam',
       4.50,
       'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
       (SELECT id FROM cat WHERE name = 'Coffee')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cappuccino');

WITH cat AS (SELECT id, name FROM categories)
INSERT INTO products (name, description, price, image_url, category_id)
SELECT 'Cold Brew',
       '24-hour steeped smooth cold brew coffee',
       5.00,
       'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
       (SELECT id FROM cat WHERE name = 'Cold Drinks')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cold Brew');

WITH cat AS (SELECT id, name FROM categories)
INSERT INTO products (name, description, price, image_url, category_id)
SELECT 'Banana Bread',
       'Moist homemade banana bread with walnut crunch',
       4.00,
       'https://images.unsplash.com/photo-1606101273945-e9eba92c3e8a?w=400&q=80',
       (SELECT id FROM cat WHERE name = 'Desserts')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Banana Bread');

-- ── 5. Storage bucket (optional — for image uploads) ──────────
-- Run this separately or via Supabase dashboard:
-- Storage → New Bucket → Name: "product-images" → Public: ON
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
