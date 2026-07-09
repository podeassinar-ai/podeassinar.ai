-- Migration 015: Base-table privilege grants + RLS policy fixes
-- Created: 2026-07-09
--
-- WHY THIS EXISTS
-- Tables created via raw SQL migrations do NOT automatically receive the
-- SELECT/INSERT/UPDATE/DELETE grants that the Supabase dashboard would apply.
-- Without these grants, PostgREST (the anon/authenticated clients used by the
-- browser and SSR) gets "permission denied for table ..." on EVERY table, even
-- when an RLS policy would allow the row. Server actions using the service_role
-- key masked this because service_role bypasses both grants and RLS.
--
-- SECURITY MODEL: grants let a role *touch* a table; RLS (already ENABLED on all
-- tables) decides *which rows*. Granting DML to anon is safe here precisely
-- because every table has RLS enabled and only permissive policies expose rows.

-- ============================================================
-- 1. Base-table DML grants (RLS still gates rows for anon/authenticated).
--    service_role has BYPASSRLS but STILL needs table grants — without them the
--    entire backend (every server action using the service-role client) fails
--    with "permission denied for table ...". This is the same missing-grant bug
--    that would otherwise break the whole app on a fresh Postgres.
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Future tables created by the postgres role inherit the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

-- ============================================================
-- 2. Fix RLS policies that reference `users` via a raw subquery.
--    A raw `SELECT ... FROM users` inside a USING clause errors for any role
--    that lacks a grant on `users`, taking down the whole query. The
--    is_staff() SECURITY DEFINER helper (migration 012/013) bypasses that.
-- ============================================================

-- plans."Admins can manage plans" — this broke the PUBLIC /planos page for
-- anonymous visitors because the FOR ALL policy's USING ran on anon SELECTs.
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
DROP POLICY IF EXISTS "Staff can manage plans" ON plans;
CREATE POLICY "Staff can manage plans"
  ON plans FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- audit_logs."Admins can view all audit logs" — restrict to ADMIN/DPO via a
-- dedicated non-recursive helper so it doesn't error for other roles.
CREATE OR REPLACE FUNCTION public.is_admin_or_dpo()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'DPO')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins and DPO can view all audit logs" ON audit_logs;
CREATE POLICY "Admins and DPO can view all audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin_or_dpo());

-- fulfillment_requests: drop the two raw-subquery policies. They are redundant
-- with the SAFE is_staff()-based "Staff can view/update all fulfillment
-- requests" policies added in migration 013, and the raw ones would error for
-- a plain authenticated user reading their own requests.
DROP POLICY IF EXISTS "Admins and Lawyers can view all fulfillment requests" ON fulfillment_requests;
DROP POLICY IF EXISTS "Admins and Lawyers can update fulfillment requests" ON fulfillment_requests;

-- ============================================================
-- 3. Prevent privilege escalation on the users table.
--    The "Users can update own profile" policy (migration 001) had USING
--    (auth.uid() = id) and NO WITH CHECK. In Postgres, an UPDATE policy with no
--    WITH CHECK reuses the USING expression as the new-row check — which stays
--    true after a user flips their own `role` to SYSTEM_ADMIN. Combined with the
--    now-granted UPDATE on users (section 1), an authenticated CLIENT could
--    escalate to admin directly via the public anon key. A BEFORE UPDATE trigger
--    is the robust guard: it blocks role/is_active changes by non-admins
--    regardless of which client issues the UPDATE, while still letting a real
--    SYSTEM_ADMIN (or the service_role backend) manage roles.
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  -- auth.role() reads the request JWT role claim. It is NULL for a direct DB
  -- connection (migrations / service-role backend that doesn't forward a JWT),
  -- 'service_role' for the service key, and 'anon'/'authenticated' for clients.
  -- NOTE: current_user is NOT reliable here — this function is SECURITY DEFINER,
  -- so current_user is always the owner (postgres). Use auth.role() instead.
  request_role text := auth.role();
BEGIN
  -- Only guard changes to role / is_active; all other column edits pass through.
  IF NEW.role IS NOT DISTINCT FROM OLD.role
     AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN
    RETURN NEW;
  END IF;

  -- Trusted backend contexts (no JWT, or the service_role key) may manage roles.
  IF request_role IS NULL OR request_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Client-issued (anon/authenticated) role or is_active changes require admin.
  IF public.is_system_admin() THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not authorized to change role or active status';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON users;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- Defense in depth: pin WITH CHECK on the own-profile UPDATE policy so the id
-- can't be changed either.
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 4. admin_notifications: remove the wide-open INSERT policy.
--    "Service role can insert notifications" used WITH CHECK (true), which lets
--    ANY authenticated user forge notifications for any recipient. The
--    service_role key bypasses RLS entirely, so backend inserts never needed it.
--    The is_staff()-gated "Staff can insert notifications" (migration 013)
--    remains for staff-to-staff dispatch.
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert notifications" ON admin_notifications;
