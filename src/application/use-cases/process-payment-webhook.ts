import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IPaymentGateway, PaymentWebhookEvent } from '@domain/interfaces/payment-gateway';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface ProcessPaymentWebhookInput {
  payload: string;
  signature: string;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private transactionRepository: ITransactionRepository,
    private paymentGateway: IPaymentGateway,
    private auditService: IAuditService
  ) {}

  async execute(input: ProcessPaymentWebhookInput): Promise<void> {
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
      case 'payment.completed':
        await this.handlePaymentCompleted(payment.id, payment.transactionId, event.externalId, payment.userId);
        break;
      case 'payment.failed':
        await this.paymentRepository.updateStatus(payment.id, 'FAILED', event.externalId);
        break;
      case 'payment.refunded':
        await this.paymentRepository.updateStatus(payment.id, 'REFUNDED', event.externalId);
        break;
    }
  }

  private async handlePaymentCompleted(
    paymentId: string,
    transactionId: string,
    externalId: string,
    userId: string
  ): Promise<void> {
    await this.paymentRepository.markPaid(paymentId, externalId);
    await this.transactionRepository.updateStatus(transactionId, 'PROCESSING');

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      resource: 'PAYMENT',
      resourceId: paymentId,
      metadata: { status: 'COMPLETED', externalId },
    });
  }
}
