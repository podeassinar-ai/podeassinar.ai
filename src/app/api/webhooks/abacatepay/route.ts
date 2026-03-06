import { NextRequest, NextResponse } from 'next/server';
import { ProcessPaymentWebhookUseCase } from '@application/use-cases/process-payment-webhook';
import { PostPaymentProcessingService } from '@application/services/post-payment-processing';
import { AbacatePayGateway } from '@infrastructure/services/abacate-pay-gateway';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabaseDiagnosisRepository, SupabasePaymentRepository, SupabaseTransactionRepository } from '@infrastructure/repositories';
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

    const useCase = new ProcessPaymentWebhookUseCase(paymentRepo, paymentGateway, auditService);

    const result = await useCase.execute({
      payload,
      signature,
    });

    if (result.paymentCompleted && result.transactionId && result.userId) {
      const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
      const service = new PostPaymentProcessingService(
        transactionRepo,
        diagnosisRepo,
        async ({ transactionId, userId }) => {
          await inngest.send({
            name: 'documents/extraction-batch-requested',
            data: { transactionId, userId },
          });
        }
      );

      await service.execute({
        transactionId: result.transactionId,
        userId: result.userId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
