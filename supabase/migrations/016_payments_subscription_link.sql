-- Migration 016: Allow payments to reference a subscription instead of a transaction
-- Created: 2026-07-09
--
-- Subscription checkouts previously stored the subscription id in
-- payments.transaction_id, which has a NOT NULL FK to transactions(id) — so
-- every subscription checkout failed with a foreign-key violation. A payment now
-- references EITHER a transaction (diagnostic) OR a subscription (plan), never a
-- fake transaction id.

-- 1. transaction_id becomes optional (subscription payments have none).
ALTER TABLE payments ALTER COLUMN transaction_id DROP NOT NULL;

-- 2. Add a proper subscription_id FK.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- 3. Integrity: a payment must reference exactly one of transaction / subscription.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_reference_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_reference_check
  CHECK (
    (transaction_id IS NOT NULL AND subscription_id IS NULL)
    OR (transaction_id IS NULL AND subscription_id IS NOT NULL)
  );
