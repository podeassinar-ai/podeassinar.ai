'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';
import {
  SupabaseTransactionRepository,
  SupabaseDiagnosisRepository,
  SupabaseFulfillmentRepository,
  SupabaseUserRepository,
} from '@infrastructure/repositories';
import { LegalDiagnosis } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { FulfillmentRequest } from '@domain/entities/fulfillment-request';

async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const userRepo = new SupabaseUserRepository(supabase);
  const dbUser = await userRepo.findById(user.id);

  if (!dbUser || !['ADMIN', 'LAWYER'].includes(dbUser.role)) {
    throw new Error('Access denied: Admin or Lawyer role required');
  }

  return { user, supabase, dbUser };
}

export interface AdminDashboardStats {
  pendingReviews: number;
  pendingFulfillments: number;
  processingTransactions: number;
  completedToday: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { supabase } = await verifyAdminAccess();

  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);

  const serviceClient = getSupabaseServiceClient();

  const pendingReviews = await diagnosisRepo.findPendingReview();
  const pendingFulfillments = await fulfillmentRepo.findPending();

  const { data: processingData } = await serviceClient
    .from('transactions')
    .select('id')
    .eq('status', 'PROCESSING');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: completedData } = await serviceClient
    .from('diagnoses')
    .select('id')
    .eq('status', 'DELIVERED')
    .gte('delivered_at', today.toISOString());

  return {
    pendingReviews: pendingReviews.length,
    pendingFulfillments: pendingFulfillments.length,
    processingTransactions: processingData?.length ?? 0,
    completedToday: completedData?.length ?? 0,
  };
}

export interface PendingReviewItem {
  diagnosis: LegalDiagnosis;
  transaction: Transaction;
  userName: string;
  userEmail: string;
}

export async function getPendingReviews(): Promise<PendingReviewItem[]> {
  await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const diagnosisRepo = new SupabaseDiagnosisRepository(serviceClient);
  const transactionRepo = new SupabaseTransactionRepository(serviceClient);
  const userRepo = new SupabaseUserRepository(serviceClient);

  const pendingDiagnoses = await diagnosisRepo.findPendingReview();
  const results: PendingReviewItem[] = [];

  for (const diagnosis of pendingDiagnoses) {
    const transaction = await transactionRepo.findById(diagnosis.transactionId);
    if (!transaction) continue;

    const user = await userRepo.findById(transaction.userId);
    if (!user) continue;

    results.push({
      diagnosis,
      transaction,
      userName: user.name,
      userEmail: user.email,
    });
  }

  return results;
}

export async function approveDiagnosis(diagnosisId: string): Promise<LegalDiagnosis> {
  const { user } = await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const diagnosisRepo = new SupabaseDiagnosisRepository(serviceClient);
  return diagnosisRepo.markReviewed(diagnosisId, user.id);
}

export async function getPendingFulfillments(): Promise<(FulfillmentRequest & { userName: string; userEmail: string })[]> {
  await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(serviceClient);
  const userRepo = new SupabaseUserRepository(serviceClient);

  const pending = await fulfillmentRepo.findPending();
  const results = [];

  for (const request of pending) {
    const user = await userRepo.findById(request.userId);
    results.push({
      ...request,
      userName: user?.name ?? 'Usuário desconhecido',
      userEmail: user?.email ?? '',
    });
  }

  return results;
}

export async function assignFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
  const { user } = await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(serviceClient);
  return fulfillmentRepo.assign(fulfillmentId, user.id);
}

export async function completeFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
  await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(serviceClient);
  return fulfillmentRepo.markCompleted(fulfillmentId);
}

export async function addFulfillmentNotes(fulfillmentId: string, notes: string): Promise<FulfillmentRequest> {
  await verifyAdminAccess();
  const serviceClient = getSupabaseServiceClient();

  const fulfillmentRepo = new SupabaseFulfillmentRepository(serviceClient);
  return fulfillmentRepo.addNotes(fulfillmentId, notes);
}
