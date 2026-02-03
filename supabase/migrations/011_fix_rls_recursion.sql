-- Migration: Fix RLS recursion in users table
-- Created: 2026-02-02

-- Step 1: Create a function to check if a user is a system admin without recursion
-- Using SECURITY DEFINER to bypass RLS checks inside the function
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'SYSTEM_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "System admins can view all users" ON users;
DROP POLICY IF EXISTS "System admins can update user roles" ON users;
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "System admins can view all records" ON users;
DROP POLICY IF EXISTS "System admins can update any record" ON users;

-- Step 3: Re-create policies using the non-recursive function
-- Policy: Users can view their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: System admins can view all records
CREATE POLICY "System admins can view all records"
  ON users FOR SELECT
  USING (is_system_admin());

-- Policy: System admins can update roles and deactivation status
CREATE POLICY "System admins can update any record"
  ON users FOR UPDATE
  USING (is_system_admin());

-- Note: We split "own record" and "system admin" into separate policies.
-- PostgreSQL evaluates multiple policies for a table by OR-ing them together.
-- This avoids complex OR logic in a single policy and improves performance/security.
