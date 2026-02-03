import { Subscription } from '@domain/entities/subscription';

export interface ISubscriptionRepository {
    findById(id: string): Promise<Subscription | null>;
    findByUserId(userId: string): Promise<Subscription[]>;
    findActiveByUserId(userId: string): Promise<Subscription | null>;
    create(subscription: Subscription): Promise<Subscription>;
    update(subscription: Subscription): Promise<Subscription>;
    incrementDiagnosesUsed(subscriptionId: string): Promise<void>;
}
