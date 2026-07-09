import { describe, expect, it, vi } from 'vitest';
import { ProcessPaymentWebhookUseCase } from './process-payment-webhook';
import { Payment } from '@domain/entities/payment';

function makePayment(overrides: Partial<Payment> = {}): Payment {
  const now = new Date('2026-03-06T00:00:00.000Z');
  return {
    id: 'payment-1',
    transactionId: 'tx-1',
    userId: 'user-1',
    type: 'DIAGNOSTIC',
    status: 'PENDING',
    amount: 30000,
    currency: 'BRL',
    externalId: 'ext-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeEvent(type: string, metadata: Record<string, string> = {}) {
  return { type, externalId: 'ext-1', metadata };
}

describe('ProcessPaymentWebhookUseCase', () => {
  it('marks payment completed and reports newlyCompleted on first billing.paid', async () => {
    const payment = makePayment();
    const paymentRepository = {
      findById: vi.fn().mockResolvedValue(payment),
      findByExternalId: vi.fn(),
      markPaidIfPending: vi.fn().mockResolvedValue({ ...payment, status: 'COMPLETED' }),
    };
    const paymentGateway = {
      parseWebhookEvent: vi.fn().mockReturnValue(makeEvent('billing.paid', { paymentId: 'payment-1' })),
    };
    const auditService = { log: vi.fn().mockResolvedValue(undefined) };

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    const result = await useCase.execute({ payload: '{}' });

    expect(result.paymentCompleted).toBe(true);
    expect(result.newlyCompleted).toBe(true);
    expect(result.transactionId).toBe('tx-1');
    expect(result.userId).toBe('user-1');
    expect(auditService.log).toHaveBeenCalledOnce();
  });

  it('is idempotent: a redelivered billing.paid does NOT re-audit but still asks the route to ensure the pipeline', async () => {
    const payment = makePayment({ status: 'COMPLETED' });
    const paymentRepository = {
      findById: vi.fn().mockResolvedValue(payment),
      findByExternalId: vi.fn(),
      // already completed -> atomic update matches 0 rows -> null
      markPaidIfPending: vi.fn().mockResolvedValue(null),
    };
    const paymentGateway = {
      parseWebhookEvent: vi.fn().mockReturnValue(makeEvent('billing.paid', { paymentId: 'payment-1' })),
    };
    const auditService = { log: vi.fn().mockResolvedValue(undefined) };

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    const result = await useCase.execute({ payload: '{}' });

    // paymentCompleted stays true so the (idempotent) pipeline enqueue can be
    // re-attempted, but no duplicate audit entry is written.
    expect(result.paymentCompleted).toBe(true);
    expect(result.newlyCompleted).toBe(false);
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('resolves the payment via externalId when metadata.paymentId is absent', async () => {
    const payment = makePayment();
    const paymentRepository = {
      findById: vi.fn(),
      findByExternalId: vi.fn().mockResolvedValue(payment),
      markPaidIfPending: vi.fn().mockResolvedValue({ ...payment, status: 'COMPLETED' }),
    };
    const paymentGateway = {
      parseWebhookEvent: vi.fn().mockReturnValue(makeEvent('billing.paid', {})),
    };
    const auditService = { log: vi.fn().mockResolvedValue(undefined) };

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    const result = await useCase.execute({ payload: '{}' });

    expect(paymentRepository.findByExternalId).toHaveBeenCalledWith('ext-1');
    expect(result.paymentCompleted).toBe(true);
  });

  it('throws when the referenced payment cannot be found', async () => {
    const paymentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByExternalId: vi.fn().mockResolvedValue(null),
      markPaidIfPending: vi.fn(),
    };
    const paymentGateway = {
      parseWebhookEvent: vi.fn().mockReturnValue(makeEvent('billing.paid', { paymentId: 'missing' })),
    };
    const auditService = { log: vi.fn() };

    const useCase = new ProcessPaymentWebhookUseCase(
      paymentRepository as any,
      paymentGateway as any,
      auditService as any
    );

    await expect(useCase.execute({ payload: '{}' })).rejects.toThrow('Payment not found');
  });
});
