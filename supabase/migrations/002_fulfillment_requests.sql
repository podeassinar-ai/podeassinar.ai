-- Migration: fulfillment_requests table for ManualFulfillmentQueue
-- Manages certificate request queue (certidões)

CREATE TYPE fulfillment_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE fulfillment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registry_number TEXT NOT NULL,
  registry_office TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'MATRICULA_ATUALIZADA',
  status fulfillment_status NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fulfillment_requests_status ON fulfillment_requests(status);
CREATE INDEX idx_fulfillment_requests_transaction_id ON fulfillment_requests(transaction_id);
CREATE INDEX idx_fulfillment_requests_assigned_to ON fulfillment_requests(assigned_to);

CREATE TRIGGER update_fulfillment_requests_updated_at
  BEFORE UPDATE ON fulfillment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE fulfillment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fulfillment requests"
  ON fulfillment_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and Lawyers can view all fulfillment requests"
  ON fulfillment_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('ADMIN', 'LAWYER')
  ));

CREATE POLICY "Admins and Lawyers can update fulfillment requests"
  ON fulfillment_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('ADMIN', 'LAWYER')
  ));

CREATE POLICY "Users can create own fulfillment requests"
  ON fulfillment_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
