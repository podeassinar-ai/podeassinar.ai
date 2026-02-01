'use server';

import { InitiatePaymentUseCase } from '@application/use-cases/initiate-payment';
import { AbacatePayGateway } from '@infrastructure/services/abacate-pay-gateway';
import { 
  SupabaseTransactionRepository, 
  SupabasePaymentRepository, 
  SupabaseUserRepository 
} from '@infrastructure/repositories';
import { getSupabaseClient } from '@infrastructure/database/supabase-client';
import { redirect } from 'next/navigation';

export async function initiatePaymentAction(transactionId: string) {
  const supabase = getSupabaseClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const paymentRepo = new SupabasePaymentRepository(supabase);
  const userRepo = new SupabaseUserRepository(supabase);
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
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/meus-diagnosticos`,
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