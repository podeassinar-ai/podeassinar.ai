'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import {
  SupabaseTransactionRepository,
  SupabaseDiagnosisRepository
} from '@infrastructure/repositories';
import { LegalDiagnosis } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';

export interface DiagnosisReportData {
  diagnosis: LegalDiagnosis;
  transaction: Transaction;
}

export type DiagnosisReportState =
  | { status: 'ready'; data: DiagnosisReportData }
  | { status: 'processing'; transaction: Transaction }
  | { status: 'not_found' };

export async function getDiagnosisById(diagnosisId: string): Promise<DiagnosisReportData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const transactionRepo = new SupabaseTransactionRepository(supabase);

  const diagnosis = await diagnosisRepo.findById(diagnosisId);
  if (!diagnosis) {
    return null;
  }

  const transaction = await transactionRepo.findById(diagnosis.transactionId);
  if (!transaction) {
    return null;
  }

  if (transaction.userId !== user.id) {
    throw new Error('Unauthorized access to diagnosis');
  }

  return { diagnosis, transaction };
}

export async function getDiagnosisByTransactionId(transactionId: string): Promise<DiagnosisReportData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const transactionRepo = new SupabaseTransactionRepository(supabase);

  const transaction = await transactionRepo.findById(transactionId);
  if (!transaction) {
    return null;
  }

  if (transaction.userId !== user.id) {
    throw new Error('Unauthorized access to transaction');
  }

  const diagnosis = await diagnosisRepo.findByTransactionId(transactionId);
  if (!diagnosis) {
    return null;
  }

  return { diagnosis, transaction };
}

export async function getDiagnosisReportState(transactionId: string): Promise<DiagnosisReportState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const transactionRepo = new SupabaseTransactionRepository(supabase);

  const transaction = await transactionRepo.findById(transactionId);
  if (!transaction) {
    return { status: 'not_found' };
  }

  if (transaction.userId !== user.id) {
    throw new Error('Unauthorized access to transaction');
  }

  const diagnosis = await diagnosisRepo.findByTransactionId(transactionId);
  if (!diagnosis) {
    return { status: 'processing', transaction };
  }

  return {
    status: 'ready',
    data: { diagnosis, transaction },
  };
}

export async function getUserDiagnoses(): Promise<DiagnosisReportData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);

  const transactions = await transactionRepo.findByUserId(user.id);
  const results: DiagnosisReportData[] = [];

  for (const transaction of transactions) {
    const diagnosis = await diagnosisRepo.findByTransactionId(transaction.id);
    if (diagnosis) {
      results.push({ diagnosis, transaction });
    }
  }

  return results;
}
