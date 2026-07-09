-- Migration: Add admin_notifications table
-- Created: 2026-02-02

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries by recipient
CREATE INDEX idx_admin_notifications_recipient ON admin_notifications(recipient_id);
CREATE INDEX idx_admin_notifications_unread ON admin_notifications(recipient_id) WHERE read_at IS NULL;

-- RLS Policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins and lawyers can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON admin_notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON admin_notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Service role can insert notifications (used by backend)
CREATE POLICY "Service role can insert notifications"
  ON admin_notifications FOR INSERT
  WITH CHECK (true);
