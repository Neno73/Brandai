# Data Model: BrendAI

**Feature**: BrendAI - Automated Brand Merchandise Design System
**Date**: 2025-10-12
**Database**: Neon Postgres (serverless PostgreSQL, accessed via Vercel)

## Overview

The BrendAI data model uses a hybrid approach: normalized tables for core entities (sessions, products) and JSONB columns for flexible/nested data (scraped brand data, product images). This design optimizes for MVP development speed while maintaining query performance for common access patterns.

## Entity Relationship Diagram

```
┌──────────────┐
│   sessions   │
├──────────────┤
│ id (PK)      │
│ email        │
│ url          │
│ status       │
│ scraped_data │◄────── JSONB: { logo, colors, fonts, themes, sentiment }
│ concept      │
│ motif_image  │
│ product_imgs │◄────── JSONB: [{ product_id, url, timestamp }]
│ created_at   │
│ updated_at   │
└──────────────┘
       │
       │ (sessions.product_imgs contains product_id references)
       ▼
┌──────────────┐
│   products   │
├──────────────┤
│ id (PK)      │
│ name         │
│ base_image   │
│ print_zones  │◄────── JSONB: ["front", "back", "sleeves"]
│ constraints  │
│ max_colors   │
│ rec_elements │◄────── JSONB: ["icon", "graphic"]
│ is_archived  │
│ created_at   │
└──────────────┘
```

**Relationships**:
- `sessions.product_imgs` contains array of objects with `product_id` foreign key references to `products.id`
- Loose coupling: products can be archived without affecting historical session data

## Table Definitions

### `sessions`

Stores all data for a single brand kit generation workflow.

#### Schema

```sql
CREATE TABLE sessions (
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

-- Indexes for common query patterns
CREATE INDEX idx_sessions_email ON sessions(email);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_url_email ON sessions(url, email); -- Check for duplicate submissions

-- Trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key, auto-generated |
| `email` | TEXT | NOT NULL | User's email for lead capture and delivery |
| `url` | TEXT | NOT NULL | Website URL submitted by user |
| `status` | TEXT | NOT NULL | Workflow stage: `scraping`, `concept`, `motif`, `products`, `complete`, `failed` |
| `scraped_data` | JSONB | NOT NULL | Brand data from Brandfetch + Firecrawl (see structure below) |
| `concept` | TEXT | NULL | Generated creative concept (2-3 paragraphs from Gemini) |
| `motif_image_url` | TEXT | NULL | URL to Vercel Blob Storage for 6-element motif image |
| `product_images` | JSONB | NOT NULL | Array of product mockup objects (see structure below) |
| `created_at` | TIMESTAMP | NOT NULL | Session creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last modification time (auto-updated via trigger) |

#### `scraped_data` JSONB Structure

```typescript
{
  // From Brandfetch API
  logo: {
    original_url: string,      // URL from Brandfetch
    stored_url: string,         // URL in Vercel Blob after processing
    format: "png",              // Always converted to PNG
    width: number,              // Dimensions for quality check
    height: number
  },
  colors: string[],             // Array of hex codes, max 5, e.g., ["#FF5733", "#33FF57"]
  fonts: string[],              // Array of font family names, e.g., ["Roboto", "Open Sans"]

  // From Firecrawl
  title: string,                // <title> or first H1
  description: string,          // Meta description or first paragraph
  headings: string[],           // H1, H2 tags (up to 5)
  content: string,              // ~500 tokens of main content

  // Analyzed by Gemini (from text content)
  tagline: string | null,       // Extracted or inferred tagline
  tone: string,                 // E.g., "Professional", "Playful", "Technical"
  themes: string[],             // E.g., ["sustainability", "innovation", "community"]
  audience: string,             // E.g., "B2B software developers", "Eco-conscious consumers"
  industry: string,             // E.g., "SaaS", "E-commerce", "Non-profit"
  sentiment: string             // E.g., "Optimistic", "Bold", "Trustworthy"
}
```

**Example**:
```json
{
  "logo": {
    "original_url": "https://cdn.brandfetch.io/example/logo.svg",
    "stored_url": "https://blob.vercel-storage.com/sessions/abc-123/logo.png",
    "format": "png",
    "width": 800,
    "height": 800
  },
  "colors": ["#1E3A8A", "#10B981", "#F59E0B", "#EF4444", "#6B7280"],
  "fonts": ["Inter", "Roboto"],
  "title": "EcoTech Solutions - Sustainable Software",
  "description": "Building climate-positive technology for a better future",
  "headings": ["About Us", "Our Mission", "Products"],
  "content": "EcoTech Solutions partners with organizations to reduce their carbon footprint...",
  "tagline": "Code for the Planet",
  "tone": "Professional yet approachable",
  "themes": ["sustainability", "innovation", "technology"],
  "audience": "Tech-forward businesses committed to environmental impact",
  "industry": "SaaS",
  "sentiment": "Optimistic and mission-driven"
}
```

#### `product_images` JSONB Structure

Array of product mockup metadata.

```typescript
[
  {
    product_id: string,         // UUID reference to products table
    product_name: string,       // Denormalized for convenience (e.g., "T-Shirt")
    image_url: string,          // URL in Vercel Blob Storage
    generated_at: string,       // ISO 8601 timestamp
    generation_duration_ms: number, // Performance tracking
    success: boolean            // True if generation succeeded
  }
]
```

**Example**:
```json
[
  {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "product_name": "T-Shirt",
    "image_url": "https://blob.vercel-storage.com/sessions/abc-123/product-tshirt.png",
    "generated_at": "2025-10-12T14:32:10.000Z",
    "generation_duration_ms": 45300,
    "success": true
  },
  {
    "product_id": "660e8400-e29b-41d4-a716-446655440001",
    "product_name": "Hoodie",
    "image_url": "https://blob.vercel-storage.com/sessions/abc-123/product-hoodie.png",
    "generated_at": "2025-10-12T14:33:02.000Z",
    "generation_duration_ms": 52100,
    "success": true
  }
]
```

#### State Transitions

```
scraping → concept → motif → products → complete
   ↓         ↓         ↓         ↓         ↓
failed ← failed ← failed ← failed ← failed
```

**Rules**:
- `scraping`: Initial state on session creation
- `concept`: After `scraped_data` is populated
- `motif`: After `concept` is generated
- `products`: After `motif_image_url` is set
- `complete`: After all 5 product images generated + email sent
- `failed`: Can transition from any state on unrecoverable error

**Validation**:
- Cannot skip stages (enforce in application logic)
- `failed` status includes error details in future enhancement (add `error_message` field)

### `products`

Admin-configurable product templates used for mockup generation.

#### Schema

```sql
CREATE TABLE products (
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

-- Index for active products query
CREATE INDEX idx_products_active ON products(is_archived) WHERE is_archived = FALSE;
```

#### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key, auto-generated |
| `name` | TEXT | NOT NULL | Product name (e.g., "T-Shirt", "Hoodie"), must be unique |
| `base_image_url` | TEXT | NOT NULL | URL to base mockup template image in `/public/assets/` |
| `print_zones` | JSONB | NOT NULL | Array of printable areas: `["front", "back", "sleeves", "wrap", "ankle"]` |
| `constraints` | TEXT | NULL | Human-readable printing/embroidery restrictions |
| `max_colors` | INT | NOT NULL | Maximum colors for this product (default 8) |
| `recommended_elements` | JSONB | NULL | Suggested motif element types: `["icon", "pattern", "graphic"]` |
| `is_archived` | BOOLEAN | NOT NULL | Soft delete flag (prevents deletion of products used in sessions) |
| `created_at` | TIMESTAMP | NOT NULL | Product creation time |

#### `print_zones` JSONB Structure

Array of valid print areas for the product.

**Valid Values**:
- `"front"` - Front center
- `"back"` - Back center
- `"sleeves"` - Sleeve printing
- `"wrap"` - 360° wrap (mugs, water bottles)
- `"ankle"` - Ankle area (socks)
- `"pocket"` - Small pocket area (hoodies)
- `"all-over"` - Full surface print

**Example**:
```json
["front", "back", "sleeves"]
```

#### Default Product Seed Data

```sql
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
  );
```

## Indexes Strategy

### Query Patterns & Optimization

**Common Queries**:

1. **Find session by ID** (magic link access):
```sql
SELECT * FROM sessions WHERE id = $1;
```
- Uses primary key index (automatic)
- O(1) lookup

2. **Find sessions by email** (duplicate check, user history):
```sql
SELECT * FROM sessions WHERE email = $1 ORDER BY created_at DESC;
```
- Uses `idx_sessions_email` index
- O(log n) lookup + sort

3. **Check for existing session** (duplicate submission):
```sql
SELECT * FROM sessions WHERE url = $1 AND email = $2 ORDER BY created_at DESC LIMIT 1;
```
- Uses `idx_sessions_url_email` composite index
- O(log n) lookup

4. **Admin dashboard: recent sessions**:
```sql
SELECT id, email, url, status, created_at FROM sessions ORDER BY created_at DESC LIMIT 50;
```
- Uses `idx_sessions_created_at` index
- O(1) for top N

5. **Find abandoned sessions** (recovery email cron job):
```sql
SELECT * FROM sessions
WHERE status IN ('concept', 'motif')
  AND updated_at < NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM email_log WHERE session_id = sessions.id AND type = 'recovery'
  );
```
- Uses `idx_sessions_status` and `updated_at` scan
- Run daily via cron (low frequency, acceptable performance)

6. **Get active products** (mockup generation):
```sql
SELECT * FROM products WHERE is_archived = FALSE ORDER BY name;
```
- Uses `idx_products_active` partial index
- O(log n) for small product count (<50)

### JSONB Query Patterns

**Extract specific scraped data field**:
```sql
SELECT scraped_data->>'title' AS title FROM sessions WHERE id = $1;
```

**Filter by color presence**:
```sql
SELECT * FROM sessions WHERE scraped_data->'colors' @> '["#FF5733"]'::jsonb;
```

**Count products by success status**:
```sql
SELECT
  product_images->0->>'product_name' AS product,
  COUNT(*) FILTER (WHERE (product_images->0->>'success')::boolean) AS successful
FROM sessions
GROUP BY product;
```

## Validation Rules

### Application-Level Constraints

**Sessions**:
- `email`: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `url`: Must be valid HTTP/HTTPS URL, max 2048 chars
- `status`: Enum validation enforced by CHECK constraint
- `scraped_data.colors`: Min 2, max 5 hex codes (validated before insert)
- `scraped_data.logo.stored_url`: Required before transitioning to `concept` status
- `concept`: Min 100 chars, max 2000 chars
- `motif_image_url`: Must be valid URL to Vercel Blob
- `product_images`: Must have exactly 5 elements when status = `complete`

**Products**:
- `name`: 1-50 chars, alphanumeric + spaces
- `base_image_url`: Must be valid URL or path to `/public/assets/`
- `print_zones`: Min 1 zone, max 5 zones
- `max_colors`: 1-999 (999 = unlimited for full-color products)

### TypeScript Validation (Zod)

```typescript
// lib/utils/validation.ts
import { z } from 'zod'

export const SessionCreateSchema = z.object({
  email: z.string().email(),
  url: z.string().url().max(2048)
})

export const ScrapedDataSchema = z.object({
  logo: z.object({
    original_url: z.string().url(),
    stored_url: z.string().url(),
    format: z.literal('png'),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).min(2).max(5),
  fonts: z.array(z.string()).optional(),
  title: z.string().min(1),
  description: z.string(),
  headings: z.array(z.string()),
  content: z.string().max(2000),
  tagline: z.string().nullable(),
  tone: z.string(),
  themes: z.array(z.string()),
  audience: z.string(),
  industry: z.string(),
  sentiment: z.string()
})

export const ProductSchema = z.object({
  name: z.string().min(1).max(50),
  base_image_url: z.string().url(),
  print_zones: z.array(z.enum(['front', 'back', 'sleeves', 'wrap', 'ankle', 'pocket', 'all-over'])).min(1),
  constraints: z.string().optional(),
  max_colors: z.number().int().min(1).max(999).default(8),
  recommended_elements: z.array(z.enum(['icon', 'pattern', 'graphic', 'typography'])).optional()
})
```

## Data Lifecycle

### Session Retention

**MVP**: Indefinite retention (no cleanup)

**Future Production**:
- Archive sessions older than 90 days (move `scraped_data` to cold storage)
- Delete `failed` sessions after 30 days
- Keep `complete` sessions with email activity (magic link clicks) indefinitely

### Image Asset Cleanup

**MVP**: No cleanup (Vercel Blob storage managed manually)

**Future Production**:
- Cron job to delete images for sessions marked as `failed` after 7 days
- Keep images for `complete` sessions for 1 year
- Implement signed URLs for time-limited access

## Migration Strategy

### Initial Schema Setup

```sql
-- Run in Neon SQL Editor or via neonctl CLI / migration tool

BEGIN;

-- Create sessions table
CREATE TABLE sessions (
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

-- Create indexes
CREATE INDEX idx_sessions_email ON sessions(email);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_url_email ON sessions(url, email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create products table
CREATE TABLE products (
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

CREATE INDEX idx_products_active ON products(is_archived) WHERE is_archived = FALSE;

-- Seed default products
INSERT INTO products (name, base_image_url, print_zones, constraints, max_colors, recommended_elements) VALUES
  ('T-Shirt', '/assets/product-mockups/tshirt.png', '["front", "back"]'::jsonb, 'Standard screen printing zones. Front: 12x16 inches max. Back: 12x14 inches max.', 8, '["icon", "graphic", "typography"]'::jsonb),
  ('Hoodie', '/assets/product-mockups/hoodie.png', '["front", "back", "sleeves", "pocket"]'::jsonb, 'No inside printing. Solid cuffs only. Pocket embroidery max 2x2cm. Sleeve prints max 4x8 inches.', 8, '["icon", "graphic"]'::jsonb),
  ('Mug', '/assets/product-mockups/mug.png', '["wrap"]'::jsonb, '360° full-color sublimation print. Handle area will be solid.', 999, '["pattern", "graphic", "icon"]'::jsonb),
  ('USB Stick', '/assets/product-mockups/usb.png', '["front"]'::jsonb, 'Logo area only: 2x2cm max. Single-color engraving or full-color print.', 4, '["icon"]'::jsonb),
  ('Socks', '/assets/product-mockups/socks.png', '["ankle"]'::jsonb, 'Ankle area only (no heel/toe). Stretch fabric - avoid fine details under 5mm.', 6, '["icon", "pattern"]'::jsonb);

COMMIT;
```

### Version Control

Store in `/lib/db/migrations.sql` and track with version comments:

```sql
-- Migration: v1.0 - Initial schema
-- Date: 2025-10-12
-- Author: BrendAI Team
-- Description: Create sessions and products tables with indexes

-- [SQL above]
```

## Performance Considerations

**Expected Load (MVP)**:
- 10-50 sessions/day
- ~500 session records/month
- 5 product templates (stable)

**Database Sizing**:
- Average session row: ~50KB (including JSONB)
- 500 sessions = ~25MB
- Indexes: ~5MB
- Total first month: ~30MB (well within free tier)

**Query Performance**:
- Session lookups: <5ms (indexed PK)
- Email searches: <10ms (indexed)
- Admin dashboard: <20ms (indexed created_at with LIMIT)

**Scaling Considerations** (future):
- Partition `sessions` table by `created_at` (monthly) at 100K+ rows
- Move `scraped_data` to separate table if query performance degrades
- Add Redis cache for frequently accessed sessions (magic link hot paths)

## TypeScript Type Definitions

```typescript
// lib/types/session.ts
export type SessionStatus = 'scraping' | 'concept' | 'motif' | 'products' | 'complete' | 'failed'

export interface Session {
  id: string
  email: string
  url: string
  status: SessionStatus
  scraped_data: ScrapedData
  concept: string | null
  motif_image_url: string | null
  product_images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ScrapedData {
  logo: {
    original_url: string
    stored_url: string
    format: 'png'
    width: number
    height: number
  }
  colors: string[] // hex codes
  fonts?: string[]
  title: string
  description: string
  headings: string[]
  content: string
  tagline: string | null
  tone: string
  themes: string[]
  audience: string
  industry: string
  sentiment: string
}

export interface ProductImage {
  product_id: string
  product_name: string
  image_url: string
  generated_at: string
  generation_duration_ms: number
  success: boolean
}

// lib/types/product.ts
export type PrintZone = 'front' | 'back' | 'sleeves' | 'wrap' | 'ankle' | 'pocket' | 'all-over'
export type ElementType = 'icon' | 'pattern' | 'graphic' | 'typography'

export interface Product {
  id: string
  name: string
  base_image_url: string
  print_zones: PrintZone[]
  constraints: string | null
  max_colors: number
  recommended_elements: ElementType[] | null
  is_archived: boolean
  created_at: string
}
```

## Summary

The BrendAI data model balances flexibility (JSONB for variable scraped data) with structure (normalized product templates). The two-table design minimizes complexity while supporting all MVP requirements. Indexes are strategically placed for common query patterns, and the schema includes future-proofing (soft deletes, timestamps, extensibility via JSONB).

**Key Design Decisions**:
1. **JSONB for scraped_data**: Websites vary greatly; rigid schema would require frequent migrations
2. **JSONB for product_images**: Array of objects is more efficient than separate table for MVP scale
3. **Soft deletes for products**: Prevents orphaned references in historical sessions
4. **UUID primary keys**: Enables distributed generation and secure magic links
5. **Status enum**: Finite state machine enforced at database level
6. **Minimal denormalization**: `product_name` in `product_images` avoids JOIN for display

**Next Steps**: Generate API contracts based on these data models and functional requirements.
