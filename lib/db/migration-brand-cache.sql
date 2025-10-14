-- Migration: v1.2 - Brand Cache Table
-- Date: 2025-10-15
-- Feature: Domain-based caching for Brandfetch API data
-- Description: Create brand_cache table to cache extracted brand data for 30 days

BEGIN;

-- Create brand_cache table
CREATE TABLE IF NOT EXISTS brand_cache (
  domain TEXT PRIMARY KEY,
  scraped_data JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create index for expiration queries (cleanup old entries)
CREATE INDEX IF NOT EXISTS idx_brand_cache_expires ON brand_cache(expires_at);

-- Create index for cache hit queries (by domain)
CREATE INDEX IF NOT EXISTS idx_brand_cache_domain ON brand_cache(domain) WHERE expires_at > NOW();

-- Comments for documentation
COMMENT ON TABLE brand_cache IS 'Caches Brandfetch API responses for 30 days to reduce API calls';
COMMENT ON COLUMN brand_cache.domain IS 'Normalized domain (e.g., example.com without www)';
COMMENT ON COLUMN brand_cache.scraped_data IS 'JSONB containing logo, colors, fonts, and other brand data';
COMMENT ON COLUMN brand_cache.cached_at IS 'Timestamp when data was cached';
COMMENT ON COLUMN brand_cache.expires_at IS 'Timestamp when cache expires (30 days from cached_at)';

COMMIT;
