import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway } from '@domain/interfaces/payment-gateway';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface ProcessPaymentWebhookInput {
  payload: string;
  signature: string;
}

export interface ProcessPaymentWebhookOutput {
  paymentCompleted: boolean;
  transactionId?: string;
  userId?: string;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private paymentGateway: IPaymentGateway,
    private auditService: IAuditService
  ) {}

  async execute(input: ProcessPaymentWebhookInput): Promise<ProcessPaymentWebhookOutput> {
    const isValid = this.paymentGateway.verifyWebhookSignature(input.payload, input.signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = this.paymentGateway.parseWebhookEvent(input.payload);
    
    const payment = await this.paymentRepository.findById(event.metadata.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    switch (event.type) {
      case 'billing.paid':
        return this.handlePaymentCompleted(payment.id, payment.transactionId, event.externalId, payment.userId);
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
    paymentId: string,
    transactionId: string,
    externalId: string,
    userId: string
  ): Promise<ProcessPaymentWebhookOutput> {
    const existingPayment = await this.paymentRepository.findById(paymentId);
    if (!existingPayment) {
      throw new Error('Payment not found');
    }

    if (existingPayment.status === 'COMPLETED') {
      return {
        paymentCompleted: false,
        transactionId,
        userId,
      };
    }

    await this.paymentRepository.markPaid(paymentId, externalId);

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      resource: 'PAYMENT',
      resourceId: paymentId,
      metadata: { status: 'COMPLETED', externalId },
    });

    return {
      paymentCompleted: true,
      transactionId,
      userId,
    };
  }
}
