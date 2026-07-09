import { NextRequest, NextResponse } from 'next/server';
import { ProcessPaymentWebhookUseCase } from '@application/use-cases/process-payment-webhook';
import { PostPaymentProcessingService } from '@application/services/post-payment-processing';
import { AbacatePayGateway, UnknownWebhookEventError } from '@infrastructure/services/abacate-pay-gateway';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabaseDiagnosisRepository, SupabasePaymentRepository, SupabaseTransactionRepository, SupabaseSubscriptionRepository } from '@infrastructure/repositories';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';
import { inngest } from '@/inngest';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    const paymentGateway = new AbacatePayGateway();

    // AbacatePay's documented primary auth is the ?webhookSecret= query param.
    // We also accept an HMAC-SHA256 header (X-Webhook-Signature) if present.
    const providedSecret = req.nextUrl.searchParams.get('webhookSecret');
    const signatureHeader =
      req.headers.get('x-webhook-signature') ?? req.headers.get('abacatepay-signature');

    const isValid =
      paymentGateway.verifyWebhookSecret(providedSecret) ||
      (signatureHeader ? paymentGateway.verifyWebhookSignature(payload, signatureHeader) : false);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook authentication' }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const paymentRepo = new SupabasePaymentRepository(supabase);
    const transactionRepo = new SupabaseTransactionRepository(supabase);
    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    const auditService = new SupabaseAuditService();

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepo,
      paymentGateway,
      auditService,
      subscriptionRepo
    );

    let result;
    try {
      result = await useCase.execute({ payload });
    } catch (error) {
      // Unknown/unhandled event types are acked (200) so AbacatePay stops
      // retrying, without mutating any payment state.
      if (error instanceof UnknownWebhookEventError) {
        console.warn(error.message);
        return NextResponse.json({ received: true, ignored: error.eventType });
      }
      throw error;
    }

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

      // PostPaymentProcessingService is idempotent (guards on transaction
      // status), so running it on every billing.paid — including redeliveries —
      // is safe and recovers a transaction whose pipeline enqueue previously
      // failed. If it throws (e.g. Inngest transiently down) we return 500 so
      // AbacatePay redelivers and we retry; the payment is already COMPLETED so
      // no double charge or double processing can occur.
      await service.execute({
        transactionId: result.transactionId,
        userId: result.userId,
      });
    }

    return NextResponse.json({ received: true, newlyCompleted: result.newlyCompleted ?? false });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
