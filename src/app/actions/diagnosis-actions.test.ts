import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@domain/entities/transaction';
import { createDiagnosis } from '@domain/entities/diagnosis';

const createClientMock = vi.fn();
const findTransactionByIdMock = vi.fn();
const findDiagnosisByTransactionIdMock = vi.fn();

vi.mock('@infrastructure/database/supabase-server', () => ({
  createClient: createClientMock,
}));

vi.mock('@infrastructure/repositories', async () => {
  const actual = await vi.importActual<typeof import('@infrastructure/repositories')>('@infrastructure/repositories');

  class MockSupabaseTransactionRepository {
    findById = findTransactionByIdMock;
  }

  class MockSupabaseDiagnosisRepository {
    findByTransactionId = findDiagnosisByTransactionIdMock;
  }

  return {
    ...actual,
    SupabaseTransactionRepository: MockSupabaseTransactionRepository,
    SupabaseDiagnosisRepository: MockSupabaseDiagnosisRepository,
  };
});

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  const now = new Date('2026-03-08T00:00:00.000Z');

  return {
    id: 'tx-1',
    userId: 'user-1',
    type: 'PURCHASE',
    status: 'PROCESSING',
    propertyAddress: 'Rua das Flores, 123',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('getDiagnosisReportState', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns processing when the transaction exists but the diagnosis is not ready yet', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });
    findTransactionByIdMock.mockResolvedValue(makeTransaction({ status: 'PROCESSING' }));
    findDiagnosisByTransactionIdMock.mockResolvedValue(null);

    const { getDiagnosisReportState } = await import('./diagnosis-actions');

    await expect(getDiagnosisReportState('tx-1')).resolves.toEqual({
      status: 'processing',
      transaction: expect.objectContaining({ id: 'tx-1' }),
    });
  });

  it('returns ready when the diagnosis exists for the current user transaction', async () => {
    const transaction = makeTransaction({ status: 'COMPLETED' });
    const diagnosis = createDiagnosis({ id: 'diag-1', transactionId: transaction.id });

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });
    findTransactionByIdMock.mockResolvedValue(transaction);
    findDiagnosisByTransactionIdMock.mockResolvedValue(diagnosis);

    const { getDiagnosisReportState } = await import('./diagnosis-actions');

    await expect(getDiagnosisReportState('tx-1')).resolves.toEqual({
      status: 'ready',
      data: {
        diagnosis,
        transaction,
      },
    });
  });

  it('returns not_found when the transaction does not exist', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });
    findTransactionByIdMock.mockResolvedValue(null);

    const { getDiagnosisReportState } = await import('./diagnosis-actions');

    await expect(getDiagnosisReportState('missing')).resolves.toEqual({
      status: 'not_found',
    });
  });
});
