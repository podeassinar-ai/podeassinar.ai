-- Migration 017: Allow system-initiated audit entries (no human user)
-- Created: 2026-07-09
--
-- System actions such as the LGPD retention purge (cron) are not tied to a
-- human user, but audit_logs.user_id was NOT NULL with an FK to users(id), so
-- those audit writes silently failed. Make user_id nullable; a NULL user_id
-- denotes a system actor. RLS on audit_logs (admins/DPO only) is unchanged.
ALTER TABLE audit_logs ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN audit_logs.user_id IS 'Acting user; NULL = system/automated action (e.g. retention purge)';
