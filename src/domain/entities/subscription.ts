import { Plan } from './plan';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_PAYMENT';

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    diagnosesUsed: number;
    externalSubscriptionId?: string;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    plan?: Plan;
}

export function createSubscription(params: {
    id: string;
    userId: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}): Subscription {
    const now = new Date();
    return {
        id: params.id,
        userId: params.userId,
        planId: params.planId,
        status: 'PENDING_PAYMENT',
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
        diagnosesUsed: 0,
        createdAt: now,
        updatedAt: now,
    };
}

export function isSubscriptionActive(subscription: Subscription): boolean {
    if (subscription.status !== 'ACTIVE') {
        return false;
    }
    const now = new Date();
    return now >= subscription.currentPeriodStart && now <= subscription.currentPeriodEnd;
}

export function getRemainingCredits(subscription: Subscription, plan: Plan): number {
    if (!isSubscriptionActive(subscription)) {
        return 0;
    }
    return Math.max(0, plan.diagnosesPerCycle - subscription.diagnosesUsed);
}

export function canUseCredit(subscription: Subscription, plan: Plan): boolean {
    return getRemainingCredits(subscription, plan) > 0;
}
