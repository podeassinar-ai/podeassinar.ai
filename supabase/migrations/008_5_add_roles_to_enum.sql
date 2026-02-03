-- Migration: Add new user roles to ENUM
-- Part 1 of role management: Enum updates must be committed before use

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SYSTEM_ADMIN';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'COMPANY_ADMIN';
