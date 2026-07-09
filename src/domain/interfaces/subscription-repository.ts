import { Subscription } from '@domain/entities/subscription';

export interface ISubscriptionRepository {
    findById(id: string): Promise<Subscription | null>;
    findByUserId(userId: string): Promise<Subscription[]>;
    findActiveByUserId(userId: string): Promise<Subscription | null>;
    create(subscription: Subscription): Promise<Subscription>;
    update(subscription: Subscription): Promise<Subscription>;
    incrementDiagnosesUsed(subscriptionId: string): Promise<void>;
    /**
     * Atomically activate a subscription only if it is still PENDING_PAYMENT.
     * Returns true if THIS call activated it (idempotent — false if already
     * ACTIVE/other). Used on subscription payment confirmation.
     */
    activateIfPending(subscriptionId: string): Promise<boolean>;
}
