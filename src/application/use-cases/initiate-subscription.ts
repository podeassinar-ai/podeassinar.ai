import { IPlanRepository } from '@domain/interfaces/plan-repository';
import { ISubscriptionRepository } from '@domain/interfaces/subscription-repository';
import { IPaymentRepository } from '@domain/interfaces/payment-repository';
import { IPaymentGateway } from '@domain/interfaces/payment-gateway';
import { IUserRepository } from '@domain/interfaces/user-repository';
import { createSubscription, Subscription } from '@domain/entities/subscription';
import { createPayment, Payment } from '@domain/entities/payment';
import { v4 as uuidv4 } from 'uuid';

export interface InitiateSubscriptionInput {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
}

export interface InitiateSubscriptionOutput {
    subscription: Subscription;
    payment: Payment;
    checkoutUrl: string;
}

export class InitiateSubscriptionUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private paymentRepository: IPaymentRepository,
        private userRepository: IUserRepository,
        private paymentGateway: IPaymentGateway
    ) { }

    async execute(input: InitiateSubscriptionInput): Promise<InitiateSubscriptionOutput> {
        const plan = await this.planRepository.findById(input.planId);
        if (!plan) {
            throw new Error('Plan not found');
        }

        if (!plan.isActive) {
            throw new Error('This plan is no longer available');
        }

        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.phone) {
            throw new Error('User phone number is required for payment');
        }

        if (!user.documentNumber) {
            throw new Error('User document number (CPF/CNPJ) is required for payment');
        }

        // Check for existing active subscription
        const existingSubscription = await this.subscriptionRepository.findActiveByUserId(input.userId);
        if (existingSubscription) {
            throw new Error('User already has an active subscription');
        }

        // Calculate period dates
        const now = new Date();
        const periodEnd = new Date(now);

        switch (plan.billingCycle) {
            case 'MONTHLY':
                periodEnd.setMonth(periodEnd.getMonth() + 1);
                break;
            case 'QUARTERLY':
                periodEnd.setMonth(periodEnd.getMonth() + 3);
                break;
            case 'YEARLY':
                periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                break;
        }

        // Create the subscription (pending payment)
        const subscription = createSubscription({
            id: uuidv4(),
            userId: input.userId,
            planId: input.planId,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        });

        const savedSubscription = await this.subscriptionRepository.create(subscription);

        // Create the payment record
        const payment = createPayment({
            id: uuidv4(),
            transactionId: savedSubscription.id, // Use subscription ID as the "transaction" reference
            userId: input.userId,
            type: 'SUBSCRIPTION',
            amount: plan.priceCents,
            currency: 'BRL',
        });

        const savedPayment = await this.paymentRepository.create(payment);

        // Create checkout session
        const checkoutResult = await this.paymentGateway.createCheckout({
            amount: plan.priceCents,
            currency: 'BRL',
            description: `Assinatura ${plan.name} - PodeAssinar.ai`,
            metadata: {
                paymentId: savedPayment.id,
                subscriptionId: savedSubscription.id,
                planId: input.planId,
                userId: input.userId,
                type: 'SUBSCRIPTION',
            },
            successUrl: input.successUrl,
            cancelUrl: input.cancelUrl,
            customer: {
                email: user.email,
                name: user.name,
                cellphone: user.phone,
                taxId: user.documentNumber,
            },
        });

        return {
            subscription: savedSubscription,
            payment: savedPayment,
            checkoutUrl: checkoutResult.checkoutUrl,
        };
    }
}
