-- Migration: Add AI confidence field to diagnoses
-- Execute this in your Supabase SQL Editor

ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2);

COMMENT ON COLUMN diagnoses.ai_confidence IS 'AI confidence score (0.00 to 1.00) for prioritizing human review';
