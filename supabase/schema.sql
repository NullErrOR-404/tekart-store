-- TEKART Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- emoji or SVG name
    cover_image TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10,2) NOT NULL,
    old_price NUMERIC(10,2),
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    badge TEXT, -- e.g. "New", "Popular", "Sale"
    brand TEXT,
    gallery TEXT[] DEFAULT '{}', -- array of Supabase Storage URLs
    cover_image TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create view/computed column logic for in_stock if needed
-- Note: PostgreSQL supports generated columns. 
-- For Supabase compatibility, we can add a computed column or let the client compute: in_stock = stock > 0.
-- In our schema, we can also use a generated column:
-- ALTER TABLE products ADD COLUMN in_stock BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies for Categories
-- Public read access
CREATE POLICY "Allow public read access on categories" 
ON categories FOR SELECT 
USING (true);

-- Admin CRUD access
CREATE POLICY "Allow admin CRUD access on categories" 
ON categories FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Set RLS Policies for Products
-- Public read access
CREATE POLICY "Allow public read access on products" 
ON products FOR SELECT 
USING (true);

-- Admin CRUD access
CREATE POLICY "Allow admin CRUD access on products" 
ON products FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a storage bucket for product images if not already existing
-- In Supabase, bucket policies can be managed in the dashboard, but you'll need a public bucket named "product-images"
