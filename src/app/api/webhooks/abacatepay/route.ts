import { NextRequest, NextResponse } from 'next/server';
import { ProcessPaymentWebhookUseCase } from '@application/use-cases/process-payment-webhook';
import { AbacatePayGateway } from '@infrastructure/services/abacate-pay-gateway';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabasePaymentRepository, SupabaseTransactionRepository } from '@infrastructure/repositories';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('abacatepay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    
    const paymentRepo = new SupabasePaymentRepository(supabase);
    const transactionRepo = new SupabaseTransactionRepository(supabase);
    const paymentGateway = new AbacatePayGateway();
    const auditService = new SupabaseAuditService();

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepo,
      transactionRepo,
      paymentGateway,
      auditService
    );

    await useCase.execute({
      payload,
      signature,
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}