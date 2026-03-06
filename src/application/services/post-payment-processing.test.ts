import { describe, expect, it, vi } from 'vitest';
import { PostPaymentProcessingService } from './post-payment-processing';
import { createDiagnosis } from '@domain/entities/diagnosis';

describe('PostPaymentProcessingService', () => {
  it('creates missing diagnosis, marks transaction processing, and enqueues extraction once', async () => {
    const transaction = {
      id: 'tx-1',
      userId: 'user-1',
      type: 'RENTAL',
      status: 'PENDING_PAYMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const transactionRepository = {
      findById: vi.fn().mockResolvedValue(transaction),
      updateStatus: vi.fn().mockResolvedValue({ ...transaction, status: 'PROCESSING' }),
    };
    const diagnosisRepository = {
      findByTransactionId: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (diagnosis) => diagnosis),
    };
    const sendDocumentsExtractionRequested = vi.fn().mockResolvedValue(undefined);

    const service = new PostPaymentProcessingService(
      transactionRepository as any,
      diagnosisRepository as any,
      sendDocumentsExtractionRequested
    );

    const result = await service.execute({
      transactionId: transaction.id,
      userId: transaction.userId,
    });

    expect(result).toEqual({ enqueued: true });
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(transaction.id, 'PROCESSING');
    expect(diagnosisRepository.create).toHaveBeenCalledTimes(1);
    expect(sendDocumentsExtractionRequested).toHaveBeenCalledWith({
      transactionId: transaction.id,
      userId: transaction.userId,
    });
  });

  it('skips enqueue when transaction is already processing', async () => {
    const transactionRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'tx-1',
        userId: 'user-1',
        type: 'RENTAL',
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      updateStatus: vi.fn(),
    };
    const diagnosisRepository = {
      findByTransactionId: vi.fn().mockResolvedValue(createDiagnosis({
        id: 'diag-1',
        transactionId: 'tx-1',
      })),
      create: vi.fn(),
    };
    const sendDocumentsExtractionRequested = vi.fn();

    const service = new PostPaymentProcessingService(
      transactionRepository as any,
      diagnosisRepository as any,
      sendDocumentsExtractionRequested
    );

    const result = await service.execute({
      transactionId: 'tx-1',
      userId: 'user-1',
    });

    expect(result).toEqual({ enqueued: false });
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
    expect(sendDocumentsExtractionRequested).not.toHaveBeenCalled();
  });
});
