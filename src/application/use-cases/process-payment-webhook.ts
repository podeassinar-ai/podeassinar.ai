import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway } from '@domain/interfaces/payment-gateway';
import { IAuditService } from '@domain/interfaces/audit-service';
import { ISubscriptionRepository } from '@domain/interfaces/subscription-repository';
import { Payment } from '@domain/entities/payment';

export interface ProcessPaymentWebhookInput {
  // Webhook authentication is performed at the route boundary (query-string
  // secret or HMAC header) before this use case runs.
  payload: string;
}

export interface ProcessPaymentWebhookOutput {
  // True whenever the payment IS completed (so the route should ensure the
  // post-payment pipeline is running — this is idempotent and recovers from a
  // prior enqueue failure on webhook redelivery).
  paymentCompleted: boolean;
  // True only when THIS call performed the PENDING->COMPLETED transition. Used
  // to avoid duplicate audit entries.
  newlyCompleted?: boolean;
  transactionId?: string;
  subscriptionId?: string;
  userId?: string;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private paymentGateway: IPaymentGateway,
    private auditService: IAuditService,
    // Optional: only needed to activate subscriptions on SUBSCRIPTION payments.
    private subscriptionRepository?: ISubscriptionRepository
  ) {}

  async execute(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookOutput> {
    const event = this.paymentGateway.parseWebhookEvent(input.payload);

    // Resolve the payment by metadata.paymentId (set at checkout creation),
    // falling back to the gateway's externalId if metadata is absent.
    const payment =
      (event.metadata.paymentId
        ? await this.paymentRepository.findById(event.metadata.paymentId)
        : null) ?? (event.externalId
        ? await this.paymentRepository.findByExternalId(event.externalId)
        : null);

    if (!payment) {
      throw new Error('Payment not found');
    }

    switch (event.type) {
      case 'billing.paid':
        return this.handlePaymentCompleted(payment, event.externalId);
      case 'billing.expired':
        await this.paymentRepository.updateStatus(payment.id, 'FAILED', event.externalId);
        return { paymentCompleted: false };
      case 'billing.refunded':
        await this.paymentRepository.updateStatus(payment.id, 'REFUNDED', event.externalId);
        return { paymentCompleted: false };
      case 'billing.created':
        await this.paymentRepository.updateStatus(payment.id, 'PROCESSING', event.externalId);
        return { paymentCompleted: false };
    }
  }

  private async handlePaymentCompleted(
    payment: Payment,
    externalId: string
  ): Promise<ProcessPaymentWebhookOutput> {
    // Atomic compare-and-set: only ONE concurrent webhook/sync transitions the
    // payment to COMPLETED (returns null if it was already completed). We only
    // write the audit entry on the transition, but we ALWAYS report
    // paymentCompleted: true so the route (re)ensures the side effects run —
    // they are idempotent and this recovers from a prior enqueue/activation
    // failure when AbacatePay redelivers the webhook.
    const transitioned = await this.paymentRepository.markPaidIfPending(payment.id, externalId);

    if (transitioned) {
      await this.auditService.log({
        userId: payment.userId,
        action: 'UPDATE',
        resource: 'PAYMENT',
        resourceId: payment.id,
        metadata: { status: 'COMPLETED', externalId, paymentType: payment.type },
      });
    }

    // Subscription payments activate the subscription (idempotent). Diagnostic
    // payments hand the transactionId back to the route for the AI pipeline.
    // The output carries both ids (mutually exclusive on the payment), so the
    // caller routes the side effect.
    if (payment.type === 'SUBSCRIPTION' && payment.subscriptionId && this.subscriptionRepository) {
      await this.subscriptionRepository.activateIfPending(payment.subscriptionId);
    }

    return {
      paymentCompleted: true,
      newlyCompleted: transitioned !== null,
      transactionId: payment.transactionId,
      subscriptionId: payment.subscriptionId,
      userId: payment.userId,
    };
  }
}
