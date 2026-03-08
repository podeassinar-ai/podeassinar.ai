'use server';

import { InitiatePaymentUseCase } from '@application/use-cases/initiate-payment';
import { SyncPaymentStatusUseCase } from '@application/use-cases/sync-payment-status';
import { PostPaymentProcessingService } from '@application/services/post-payment-processing';
import { AbacatePayGateway } from '@infrastructure/services/abacate-pay-gateway';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import {
  SupabaseTransactionRepository,
  SupabasePaymentRepository,
  SupabaseUserRepository,
  SupabaseDiagnosisRepository
} from '@infrastructure/repositories';
import { createClient } from '@infrastructure/database/supabase-server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { inngest } from '@/inngest';
import { isSystemAdmin } from '@domain/entities/user';

async function triggerPostPaymentProcessing(
  transactionId: string,
  userId: string,
  transactionRepo: SupabaseTransactionRepository,
  diagnosisRepo: SupabaseDiagnosisRepository
) {
  const service = new PostPaymentProcessingService(
    transactionRepo,
    diagnosisRepo,
    async ({ transactionId: queuedTransactionId, userId: queuedUserId }) => {
      await inngest.send({
        name: 'documents/extraction-batch-requested',
        data: {
          userId: queuedUserId,
          transactionId: queuedTransactionId,
        },
      });
    }
  );

  return service.execute({ transactionId, userId });
}

export async function initiatePaymentAction(transactionId: string) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const userRepo = new SupabaseUserRepository(supabase);

  // Get user profile to check role
  const userProfile = await userRepo.findById(user.id);

  // ADMIN BYPASS: Skip payment gateway for admin users (for testing)
  if (userProfile && isSystemAdmin(userProfile)) {
    console.log('[ADMIN BYPASS] Skipping payment gateway, triggering document extraction and AI diagnosis.');

    const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
    await triggerPostPaymentProcessing(transactionId, user.id, transactionRepo, diagnosisRepo);

    // Redirect to meus-diagnosticos
    redirect('/meus-diagnosticos');
  }


  // Production flow: initiate payment via gateway
  const paymentRepo = new SupabasePaymentRepository(supabase);
  const paymentGateway = new AbacatePayGateway();

  const useCase = new InitiatePaymentUseCase(
    transactionRepo,
    paymentRepo,
    userRepo,
    paymentGateway
  );

  try {
    const result = await useCase.execute({
      userId: user.id,
      transactionId: transactionId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meus-diagnosticos?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/diagnostico`,
    });

    if (result.checkoutUrl) {
      redirect(result.checkoutUrl);
    }
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Payment initiation failed:', error);
    throw new Error('Failed to initiate payment: ' + error.message);
  }
}

export async function syncPaymentStatusAction(paymentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const paymentRepo = new SupabasePaymentRepository(supabase);
  const paymentGateway = new AbacatePayGateway();
  const auditService = new SupabaseAuditService();

  const useCase = new SyncPaymentStatusUseCase(
    paymentRepo,
    paymentGateway,
    auditService
  );

  try {
    const result = await useCase.execute({
      paymentId,
      userId: user.id,
    });

    if (result.becameCompleted) {
      const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
      await triggerPostPaymentProcessing(result.transactionId, user.id, transactionRepo, diagnosisRepo);
    }

    revalidatePath('/meus-diagnosticos');

    return result;
  } catch (error: any) {
    console.error('Payment sync failed:', error);
    throw new Error('Failed to sync payment status: ' + error.message);
  }
}

export async function syncPaymentByTransactionAction(transactionId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const paymentRepo = new SupabasePaymentRepository(supabase);
  const paymentGateway = new AbacatePayGateway();
  const auditService = new SupabaseAuditService();

  const payments = await paymentRepo.findByTransactionId(transactionId);
  const pendingPayment = payments.find(p =>
    p.status === 'PENDING' || p.status === 'PROCESSING'
  );

  if (!pendingPayment) {
    return { synced: false, message: 'No pending payment found for this transaction' };
  }

  const useCase = new SyncPaymentStatusUseCase(
    paymentRepo,
    paymentGateway,
    auditService
  );

  try {
    const result = await useCase.execute({
      paymentId: pendingPayment.id,
      userId: user.id,
    });

    if (result.becameCompleted) {
      const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
      await triggerPostPaymentProcessing(result.transactionId, user.id, transactionRepo, diagnosisRepo);
    }

    revalidatePath('/meus-diagnosticos');

    return result;
  } catch (error: any) {
    console.error('Payment sync failed:', error);
    throw new Error('Failed to sync payment status: ' + error.message);
  }
}
