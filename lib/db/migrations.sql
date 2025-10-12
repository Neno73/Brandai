-- Migration: v1.0 - Initial schema
-- Date: 2025-10-12
-- Feature: BrendAI - Automated Brand Merchandise Design System
-- Description: Create sessions and products tables with indexes

BEGIN;

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scraping', 'concept', 'motif', 'products', 'complete', 'failed')),
  scraped_data JSONB DEFAULT '{}'::jsonb,
  concept TEXT,
  motif_image_url TEXT,
  product_images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_url_email ON sessions(url, email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  base_image_url TEXT NOT NULL,
  print_zones JSONB NOT NULL,
  constraints TEXT,
  max_colors INT DEFAULT 8,
  recommended_elements JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_archived) WHERE is_archived = FALSE;

-- Seed default products
INSERT INTO products (name, base_image_url, print_zones, constraints, max_colors, recommended_elements) VALUES
  (
    'T-Shirt',
    '/assets/product-mockups/tshirt.png',
    '["front", "back"]'::jsonb,
    'Standard screen printing zones. Front: 12x16 inches max. Back: 12x14 inches max.',
    8,
    '["icon", "graphic", "typography"]'::jsonb
  ),
  (
    'Hoodie',
    '/assets/product-mockups/hoodie.png',
    '["front", "back", "sleeves", "pocket"]'::jsonb,
    'No inside printing. Solid cuffs only. Pocket embroidery max 2x2cm. Sleeve prints max 4x8 inches.',
    8,
    '["icon", "graphic"]'::jsonb
  ),
  (
    'Mug',
    '/assets/product-mockups/mug.png',
    '["wrap"]'::jsonb,
    '360° full-color sublimation print. Handle area will be solid.',
    999,
    '["pattern", "graphic", "icon"]'::jsonb
  ),
  (
    'USB Stick',
    '/assets/product-mockups/usb.png',
    '["front"]'::jsonb,
    'Logo area only: 2x2cm max. Single-color engraving or full-color print.',
    4,
    '["icon"]'::jsonb
  ),
  (
    'Socks',
    '/assets/product-mockups/socks.png',
    '["ankle"]'::jsonb,
    'Ankle area only (no heel/toe). Stretch fabric - avoid fine details under 5mm.',
    6,
    '["icon", "pattern"]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

COMMIT;
