-- Migration: v1.1 - Add awaiting_approval status
-- Date: 2025-10-14
-- Feature: Add missing awaiting_approval status to sessions table
-- Description: Fix CHECK constraint to allow awaiting_approval status

BEGIN;

-- Drop the existing constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;

-- Add the updated constraint with awaiting_approval
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('scraping', 'awaiting_approval', 'concept', 'motif', 'products', 'complete', 'failed'));

COMMIT;
