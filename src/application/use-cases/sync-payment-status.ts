import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway } from '@domain/interfaces/payment-gateway';
import { IAuditService } from '@domain/interfaces/audit-service';
import { PaymentStatus } from '@domain/entities/payment';

export interface SyncPaymentStatusInput {
  paymentId: string;
  userId: string;
}

export interface SyncPaymentStatusOutput {
  synced: boolean;
  previousStatus: PaymentStatus;
  currentStatus: PaymentStatus;
  becameCompleted: boolean;
  transactionId: string;
  paymentId: string;
}

export class SyncPaymentStatusUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private paymentGateway: IPaymentGateway,
    private auditService: IAuditService
  ) {}

  async execute(input: SyncPaymentStatusInput): Promise<SyncPaymentStatusOutput> {
    const payment = await this.paymentRepository.findById(input.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId !== input.userId) {
      throw new Error('Unauthorized access to payment');
    }

    if (!payment.externalId) {
      throw new Error('Payment has no external reference to sync');
    }

    const previousStatus = payment.status;

    if (previousStatus === 'COMPLETED' || previousStatus === 'REFUNDED') {
      return {
        synced: false,
        previousStatus,
        currentStatus: previousStatus,
        becameCompleted: false,
        transactionId: payment.transactionId,
        paymentId: payment.id,
      };
    }

    const checkoutDetails = await this.paymentGateway.getCheckout(payment.externalId);
    
    let newStatus: PaymentStatus = previousStatus;
    
    if (checkoutDetails.status === 'COMPLETED') {
      await this.paymentRepository.markPaid(payment.id, payment.externalId);
      newStatus = 'COMPLETED';

      await this.auditService.log({
        userId: input.userId,
        action: 'UPDATE',
        resource: 'PAYMENT',
        resourceId: payment.id,
        metadata: { 
          status: 'COMPLETED', 
          syncedFrom: previousStatus,
          externalId: payment.externalId 
        },
      });
    } else if (checkoutDetails.status === 'EXPIRED' && previousStatus !== 'FAILED') {
      await this.paymentRepository.updateStatus(payment.id, 'FAILED', payment.externalId);
      newStatus = 'FAILED';

      await this.auditService.log({
        userId: input.userId,
        action: 'UPDATE',
        resource: 'PAYMENT',
        resourceId: payment.id,
        metadata: { 
          status: 'FAILED', 
          syncedFrom: previousStatus,
          externalId: payment.externalId 
        },
      });
    }

    return {
      synced: newStatus !== previousStatus,
      previousStatus,
      currentStatus: newStatus,
      becameCompleted: newStatus === 'COMPLETED',
      transactionId: payment.transactionId,
      paymentId: payment.id,
    };
  }
}
