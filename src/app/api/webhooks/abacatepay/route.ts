import { NextRequest, NextResponse } from 'next/server';
import { ProcessPaymentWebhookUseCase } from '@application/use-cases/process-payment-webhook';
import { AbacatePayGateway } from '@infrastructure/services/abacate-pay-gateway';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabasePaymentRepository, SupabaseTransactionRepository } from '@infrastructure/repositories';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';
import { inngest } from '@/inngest';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('abacatepay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const paymentGateway = new AbacatePayGateway();
    
    const isValid = paymentGateway.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = paymentGateway.parseWebhookEvent(payload);
    
    const paymentRepo = new SupabasePaymentRepository(supabase);
    const transactionRepo = new SupabaseTransactionRepository(supabase);
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

    if (event.type === 'billing.paid') {
      const payment = await paymentRepo.findById(event.metadata.paymentId);
      if (payment) {
        await inngest.send({
          name: 'diagnosis/generate-requested',
          data: {
            userId: payment.userId,
            transactionId: payment.transactionId,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}