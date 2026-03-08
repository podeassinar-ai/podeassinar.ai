-- PodeAssinar.ai Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
CREATE TYPE transaction_type AS ENUM (
  'SALE',
  'PURCHASE',
  'RENTAL',
  'FINANCING',
  'REFINANCING',
  'REGULARIZATION',
  'DONATION',
  'EXCHANGE',
  'BUILT_TO_SUIT',
  'SURFACE_RIGHT',
  'RURAL_LEASE',
  'GUARANTEES',
  'FIDUCIARY',
  'CAPITAL'
);

CREATE TYPE transaction_status AS ENUM (
  'PENDING_QUESTIONNAIRE',
  'PENDING_DOCUMENTS',
  'PENDING_PAYMENT',
  'PROCESSING',
  'PENDING_REVIEW',
  'COMPLETED',
  'CANCELLED',
  'ERROR'
);

CREATE TYPE document_type AS ENUM (
  'MATRICULA',
  'MATRICULA_ANTIGA',
  'IPTU',
  'RG_CPF',
  'CERTIDAO_CASAMENTO',
  'COMPROVANTE_ENDERECO',
  'PROCURACAO',
  'CONTRATO',
  'OUTROS'
);

CREATE TYPE document_status AS ENUM (
  'UPLOADED',
  'PROCESSING',
  'VALIDATED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE legal_basis AS ENUM (
  'CONSENT',
  'CONTRACT_EXECUTION',
  'LEGAL_OBLIGATION'
);

CREATE TYPE diagnosis_status AS ENUM (
  'DRAFT',
  'AI_GENERATED',
  'UNDER_REVIEW',
  'APPROVED',
  'DELIVERED'
);

CREATE TYPE risk_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

CREATE TYPE user_role AS ENUM (
  'CLIENT',
  'LAWYER',
  'ADMIN',
  'DPO'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE payment_type AS ENUM (
  'DIAGNOSTIC',
  'CERTIFICATE_REQUEST',
  'LEGAL_SERVICE'
);

CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'DOWNLOAD',
  'EXPORT'
);

CREATE TYPE audit_resource AS ENUM (
  'TRANSACTION',
  'DOCUMENT',
  'DIAGNOSIS',
  'USER',
  'PAYMENT'
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENT',
  phone TEXT,
  document_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'PENDING_QUESTIONNAIRE',
  property_address TEXT,
  registry_number TEXT,
  registry_office TEXT,
  property_type TEXT,
  property_value TEXT,
  has_matricula TEXT,
  matricula_option TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Questionnaires Table
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questionnaires_transaction_id ON questionnaires(transaction_id);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'UPLOADED',
  storage_ref TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  legal_basis legal_basis NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_transaction_id ON documents(transaction_id);
CREATE INDEX idx_documents_expires_at ON documents(expires_at);
CREATE INDEX idx_documents_type ON documents(type);

-- Diagnoses Table
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  status diagnosis_status NOT NULL DEFAULT 'DRAFT',
  property_status TEXT NOT NULL DEFAULT '',
  risks JSONB NOT NULL DEFAULT '[]',
  pathways JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  ai_confidence REAL,
  ai_generated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_transaction_id ON diagnoses(transaction_id);
CREATE INDEX idx_diagnoses_status ON diagnoses(status);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  external_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Audit Logs Table (LGPD Compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action audit_action NOT NULL,
  resource audit_resource NOT NULL,
  resource_id TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Updated At Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_diagnoses_updated_at
  BEFORE UPDATE ON diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Questionnaires
CREATE POLICY "Users can view own questionnaires"
  ON questionnaires FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = questionnaires.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own questionnaires"
  ON questionnaires FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = questionnaires.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- RLS Policies for Documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = documents.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = documents.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = documents.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- RLS Policies for Diagnoses
CREATE POLICY "Users can view own diagnoses"
  ON diagnoses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = diagnoses.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- RLS Policies for Payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for Audit Logs (only DPO and Admin)
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('ADMIN', 'DPO')
  ));

-- Storage Bucket Policy (execute in Supabase dashboard)
-- CREATE POLICY "Users can upload to own transaction folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'documents' AND
--     (storage.foldername(name))[1] = 'transactions' AND
--     EXISTS (
--       SELECT 1 FROM transactions 
--       WHERE transactions.id::text = (storage.foldername(name))[2]
--       AND transactions.user_id = auth.uid()
--     )
--   );
