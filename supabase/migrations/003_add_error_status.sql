-- Migration: Add ERROR status to transaction_status enum
-- Run this after the initial schema.sql

ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'ERROR';
