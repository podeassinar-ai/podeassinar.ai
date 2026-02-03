-- Migration: Grant Admin/System Admin global access via RLS
-- Created: 2026-02-03
-- Purpose: Allow admins to view all platform data using their own authenticated session

-- Step 1: Helper function to check if user is staff (admin/system_admin/lawyer)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('SYSTEM_ADMIN', 'ADMIN', 'LAWYER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================== TRANSACTIONS ==================

-- Allow staff to view all transactions
DROP POLICY IF EXISTS "Staff can view all transactions" ON transactions;
CREATE POLICY "Staff can view all transactions"
  ON transactions FOR SELECT
  USING (is_staff());

-- Allow staff to update all transactions
DROP POLICY IF EXISTS "Staff can update all transactions" ON transactions;
CREATE POLICY "Staff can update all transactions"
  ON transactions FOR UPDATE
  USING (is_staff());

-- ================== DIAGNOSES ==================

-- Allow staff to view all diagnoses
DROP POLICY IF EXISTS "Staff can view all diagnoses" ON diagnoses;
CREATE POLICY "Staff can view all diagnoses"
  ON diagnoses FOR SELECT
  USING (is_staff());

-- Allow staff to update all diagnoses (for review/approval)
DROP POLICY IF EXISTS "Staff can update all diagnoses" ON diagnoses;
CREATE POLICY "Staff can update all diagnoses"
  ON diagnoses FOR UPDATE
  USING (is_staff());

-- ================== FULFILLMENT REQUESTS ==================

-- Allow staff to view all fulfillment requests
DROP POLICY IF EXISTS "Staff can view all fulfillment requests" ON fulfillment_requests;
CREATE POLICY "Staff can view all fulfillment requests"
  ON fulfillment_requests FOR SELECT
  USING (is_staff());

-- Allow staff to update all fulfillment requests
DROP POLICY IF EXISTS "Staff can update all fulfillment requests" ON fulfillment_requests;
CREATE POLICY "Staff can update all fulfillment requests"
  ON fulfillment_requests FOR UPDATE
  USING (is_staff());

-- ================== ADMIN NOTIFICATIONS ==================

-- Allow staff to insert notifications (for dispatching to other staff)
DROP POLICY IF EXISTS "Staff can insert notifications" ON admin_notifications;
CREATE POLICY "Staff can insert notifications"
  ON admin_notifications FOR INSERT
  WITH CHECK (is_staff());

-- ================== USER SUBSCRIPTIONS (for dashboard stats) ==================

-- Allow staff to view all subscriptions
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON user_subscriptions;
CREATE POLICY "Staff can view all subscriptions"
  ON user_subscriptions FOR SELECT
  USING (is_staff());
