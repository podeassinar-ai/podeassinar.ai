-- Migration: Add new user roles (SYSTEM_ADMIN, COMPANY_ADMIN)
-- Created: 2026-02-02

-- Step 1: Add new role values to the users table
-- Note: PostgreSQL doesn't have native ENUMs in this setup, roles are TEXT
-- We just need to ensure the application layer validates these values

-- Step 2: Add organization_id column for future B2B support
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Create index for organization queries
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- Step 4: Update RLS policy to allow SYSTEM_ADMIN to view all users
DROP POLICY IF EXISTS "System admins can view all users" ON users;
CREATE POLICY "System admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SYSTEM_ADMIN'
    )
  );

-- Step 5: Allow SYSTEM_ADMIN to update any user's role
DROP POLICY IF EXISTS "System admins can update user roles" ON users;
CREATE POLICY "System admins can update user roles"
  ON users FOR UPDATE
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SYSTEM_ADMIN'
    )
  );

-- Note: To promote your first SYSTEM_ADMIN, run this manually:
-- UPDATE users SET role = 'SYSTEM_ADMIN' WHERE email = 'your-email@example.com';
