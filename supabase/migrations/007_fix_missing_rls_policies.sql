-- Migration: Add missing RLS policies for questionnaires and diagnoses
-- This fixes the "new row violates row-level security policy" error

-- Allow users to create questionnaires for their own transactions
CREATE POLICY "Users can create own questionnaires"
  ON questionnaires FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = questionnaires.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- Allow users to delete questionnaires for their own transactions (for rollbacks)
CREATE POLICY "Users can delete own questionnaires"
  ON questionnaires FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = questionnaires.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- Allow users to create diagnoses for their own transactions
CREATE POLICY "Users can create own diagnoses"
  ON diagnoses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = diagnoses.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- Allow users to update diagnoses for their own transactions
CREATE POLICY "Users can update own diagnoses"
  ON diagnoses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = diagnoses.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- Allow users to delete diagnoses for their own transactions (for rollbacks)
CREATE POLICY "Users can delete own diagnoses"
  ON diagnoses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = diagnoses.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

-- Allow users to delete their own transactions (for rollbacks)
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
