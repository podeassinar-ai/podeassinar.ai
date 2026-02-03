-- Migration: Add Subscription Model
-- Plans and User Subscriptions for monthly due diligence packages

-- Subscription Status Enum
CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'EXPIRED',
  'PENDING_PAYMENT'
);

-- Billing Cycle Enum
CREATE TYPE billing_cycle AS ENUM (
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
);

-- Update payment_type to include SUBSCRIPTION
ALTER TYPE payment_type ADD VALUE IF NOT EXISTS 'SUBSCRIPTION';

-- Plans Table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  diagnoses_per_cycle INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  billing_cycle billing_cycle NOT NULL DEFAULT 'MONTHLY',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_is_active ON plans(is_active);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  diagnoses_used INTEGER NOT NULL DEFAULT 0,
  external_subscription_id TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Updated At Trigger for new tables
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans: Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
  ON plans FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  ));

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions (for cancellation)
CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed some initial plans
INSERT INTO plans (name, description, diagnoses_per_cycle, price_cents, billing_cycle) VALUES
  ('Starter', 'Ideal para pequenas imobiliárias', 5, 12500, 'MONTHLY'),
  ('Professional', 'Para imobiliárias em crescimento', 15, 30000, 'MONTHLY'),
  ('Enterprise', 'Para grandes operações', 50, 75000, 'MONTHLY');
