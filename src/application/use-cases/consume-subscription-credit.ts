import { ISubscriptionRepository } from '@domain/interfaces/subscription-repository';
import { IPlanRepository } from '@domain/interfaces/plan-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IAuditService } from '@domain/interfaces/audit-service';
import { canUseCredit } from '@domain/entities/subscription';

export interface ConsumeSubscriptionCreditInput {
    userId: string;
    transactionId: string;
}

export interface ConsumeSubscriptionCreditOutput {
    success: boolean;
    message: string;
    remainingCredits?: number;
}

export class ConsumeSubscriptionCreditUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        private transactionRepository: ITransactionRepository,
        private auditService: IAuditService
    ) { }

    async execute(input: ConsumeSubscriptionCreditInput): Promise<ConsumeSubscriptionCreditOutput> {
        const transaction = await this.transactionRepository.findById(input.transactionId);
        if (!transaction) {
            return { success: false, message: 'Transaction not found' };
        }

        if (transaction.userId !== input.userId) {
            return { success: false, message: 'Unauthorized' };
        }

        if (transaction.status !== 'PENDING_PAYMENT') {
            return { success: false, message: 'Transaction is not pending payment' };
        }

        const subscription = await this.subscriptionRepository.findActiveByUserId(input.userId);
        if (!subscription) {
            return { success: false, message: 'No active subscription found' };
        }

        const plan = subscription.plan ?? await this.planRepository.findById(subscription.planId);
        if (!plan) {
            return { success: false, message: 'Plan not found' };
        }

        if (!canUseCredit(subscription, plan)) {
            return { success: false, message: 'No credits available' };
        }

        // Increment diagnoses used
        await this.subscriptionRepository.incrementDiagnosesUsed(subscription.id);

        // Update transaction status to PROCESSING
        transaction.status = 'PROCESSING';
        await this.transactionRepository.update(transaction);

        // Log audit
        await this.auditService.log({
            userId: input.userId,
            action: 'UPDATE',
            resource: 'TRANSACTION',
            resourceId: input.transactionId,
            metadata: {
                paymentMethod: 'SUBSCRIPTION_CREDIT',
                subscriptionId: subscription.id,
                planName: plan.name,
            },
        });

        const remainingCredits = plan.diagnosesPerCycle - subscription.diagnosesUsed - 1;

        return {
            success: true,
            message: 'Credit consumed successfully',
            remainingCredits,
        };
    }
}
