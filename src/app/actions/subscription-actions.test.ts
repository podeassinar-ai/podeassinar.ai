import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Subscription } from '@domain/entities/subscription';

const createClientMock = vi.fn();
const findByIdMock = vi.fn();
const updateMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock('@infrastructure/database/supabase-server', () => ({
    createClient: createClientMock,
}));

vi.mock('next/cache', () => ({
    revalidatePath: revalidatePathMock,
}));

vi.mock('@infrastructure/repositories', async () => {
    const actual = await vi.importActual<typeof import('@infrastructure/repositories')>('@infrastructure/repositories');

    class MockSupabaseSubscriptionRepository {
        findById = findByIdMock;
        update = updateMock;
    }

    return {
        ...actual,
        SupabaseSubscriptionRepository: MockSupabaseSubscriptionRepository,
    };
});

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
    const now = new Date('2026-03-07T12:00:00.000Z');

    return {
        id: 'sub-1',
        userId: 'user-1',
        planId: 'plan-1',
        status: 'ACTIVE',
        currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
        currentPeriodEnd: new Date('2026-03-31T23:59:59.000Z'),
        diagnosesUsed: 0,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

describe('cancelSubscriptionAction', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('cancels an active subscription owned by the current user', async () => {
        createClientMock.mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
            },
        });
        findByIdMock.mockResolvedValue(makeSubscription());
        updateMock.mockImplementation(async (subscription: Subscription) => subscription);

        const { cancelSubscriptionAction } = await import('./subscription-actions');

        await expect(cancelSubscriptionAction('sub-1')).resolves.toEqual({ success: true });
        expect(findByIdMock).toHaveBeenCalledWith('sub-1');
        expect(updateMock).toHaveBeenCalledTimes(1);

        const updatedSubscription = updateMock.mock.calls[0][0] as Subscription;
        expect(updatedSubscription.status).toBe('CANCELLED');
        expect(updatedSubscription.cancelledAt).toBeInstanceOf(Date);
    });

    it('rejects cancellation when the subscription is not active', async () => {
        createClientMock.mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
            },
        });
        findByIdMock.mockResolvedValue(makeSubscription({ status: 'CANCELLED' }));

        const { cancelSubscriptionAction } = await import('./subscription-actions');

        await expect(cancelSubscriptionAction('sub-1')).rejects.toThrow('Subscription is not active');
        expect(updateMock).not.toHaveBeenCalled();
    });
});
