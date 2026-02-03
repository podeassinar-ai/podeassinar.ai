import { ISubscriptionRepository } from '@domain/interfaces/subscription-repository';
import { IPlanRepository } from '@domain/interfaces/plan-repository';
import { canUseCredit } from '@domain/entities/subscription';

export interface CheckSubscriptionCreditInput {
    userId: string;
}

export interface CheckSubscriptionCreditOutput {
    hasActiveSubscription: boolean;
    hasAvailableCredits: boolean;
    remainingCredits: number;
    totalCredits: number;
    subscriptionId?: string;
    planName?: string;
}

export class CheckSubscriptionCreditUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository
    ) { }

    async execute(input: CheckSubscriptionCreditInput): Promise<CheckSubscriptionCreditOutput> {
        const subscription = await this.subscriptionRepository.findActiveByUserId(input.userId);

        if (!subscription) {
            return {
                hasActiveSubscription: false,
                hasAvailableCredits: false,
                remainingCredits: 0,
                totalCredits: 0,
            };
        }

        const plan = subscription.plan ?? await this.planRepository.findById(subscription.planId);

        if (!plan) {
            return {
                hasActiveSubscription: true,
                hasAvailableCredits: false,
                remainingCredits: 0,
                totalCredits: 0,
                subscriptionId: subscription.id,
            };
        }

        const remainingCredits = Math.max(0, plan.diagnosesPerCycle - subscription.diagnosesUsed);
        const hasAvailableCredits = canUseCredit(subscription, plan);

        return {
            hasActiveSubscription: true,
            hasAvailableCredits,
            remainingCredits,
            totalCredits: plan.diagnosesPerCycle,
            subscriptionId: subscription.id,
            planName: plan.name,
        };
    }
}
