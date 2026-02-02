-- Migration: Add property details columns to transactions table
-- These columns store data from the "Informações" (Step 0) and "Questionário" (Step 1) forms

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS property_value TEXT,
ADD COLUMN IF NOT EXISTS has_matricula TEXT,
ADD COLUMN IF NOT EXISTS matricula_option TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT;
