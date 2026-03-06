import { describe, expect, it, vi } from 'vitest';
import { SyncPaymentStatusUseCase } from './sync-payment-status';
import { Payment } from '@domain/entities/payment';

function makePayment(overrides: Partial<Payment> = {}): Payment {
  const now = new Date('2026-03-06T00:00:00.000Z');

  return {
    id: 'payment-1',
    transactionId: 'tx-1',
    userId: 'user-1',
    type: 'DIAGNOSTIC',
    status: 'PENDING',
    amount: 300,
    currency: 'BRL',
    externalId: 'external-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('SyncPaymentStatusUseCase', () => {
  it('returns becameCompleted when checkout transitions to completed', async () => {
    const payment = makePayment();
    const paymentRepository = {
      findById: vi.fn().mockResolvedValue(payment),
      markPaid: vi.fn().mockResolvedValue({ ...payment, status: 'COMPLETED' }),
      updateStatus: vi.fn(),
    };
    const paymentGateway = {
      getCheckout: vi.fn().mockResolvedValue({ status: 'COMPLETED' }),
    };
    const auditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SyncPaymentStatusUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    const result = await useCase.execute({
      paymentId: payment.id,
      userId: payment.userId,
    });

    expect(result).toEqual({
      synced: true,
      previousStatus: 'PENDING',
      currentStatus: 'COMPLETED',
      becameCompleted: true,
      transactionId: payment.transactionId,
      paymentId: payment.id,
    });
    expect(paymentRepository.markPaid).toHaveBeenCalledWith(payment.id, payment.externalId);
  });

  it('does not report becameCompleted when status is unchanged', async () => {
    const payment = makePayment({ status: 'PROCESSING' });
    const paymentRepository = {
      findById: vi.fn().mockResolvedValue(payment),
      markPaid: vi.fn(),
      updateStatus: vi.fn(),
    };
    const paymentGateway = {
      getCheckout: vi.fn().mockResolvedValue({ status: 'PROCESSING' }),
    };
    const auditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SyncPaymentStatusUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    const result = await useCase.execute({
      paymentId: payment.id,
      userId: payment.userId,
    });

    expect(result).toEqual({
      synced: false,
      previousStatus: 'PROCESSING',
      currentStatus: 'PROCESSING',
      becameCompleted: false,
      transactionId: payment.transactionId,
      paymentId: payment.id,
    });
    expect(paymentRepository.markPaid).not.toHaveBeenCalled();
  });
});
