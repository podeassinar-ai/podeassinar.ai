import { Payment, PaymentStatus, PaymentType } from '../entities/payment';

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByExternalId(externalId: string): Promise<Payment | null>;
  findByTransactionId(transactionId: string): Promise<Payment[]>;
  updateStatus(id: string, status: PaymentStatus, externalId?: string): Promise<Payment>;
  markPaid(id: string, externalId: string): Promise<Payment>;
  /**
   * Atomically mark COMPLETED only if not already completed. Returns null when
   * a concurrent request already completed it — the caller uses this to run
   * post-payment side effects exactly once.
   */
  markPaidIfPending(id: string, externalId: string): Promise<Payment | null>;
}

export interface PaymentFilters {
  userId?: string;
  transactionId?: string;
  type?: PaymentType;
  status?: PaymentStatus;
}
