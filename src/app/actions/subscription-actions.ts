'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import {
    SupabasePlanRepository,
    SupabaseSubscriptionRepository,
    SupabaseTransactionRepository,
} from '@infrastructure/repositories';
import { CheckSubscriptionCreditUseCase } from '@application/use-cases/check-subscription-credit';
import { ConsumeSubscriptionCreditUseCase } from '@application/use-cases/consume-subscription-credit';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { Plan } from '@domain/entities/plan';
import { Subscription } from '@domain/entities/subscription';

export async function getAvailablePlansAction(): Promise<Plan[]> {
    const supabase = await createClient();
    const planRepo = new SupabasePlanRepository(supabase);

    return await planRepo.findActive();
}

export async function checkSubscriptionCreditsAction(): Promise<{
    hasActiveSubscription: boolean;
    hasAvailableCredits: boolean;
    remainingCredits: number;
    totalCredits: number;
    subscriptionId?: string;
    planName?: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            hasActiveSubscription: false,
            hasAvailableCredits: false,
            remainingCredits: 0,
            totalCredits: 0,
        };
    }

    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    const planRepo = new SupabasePlanRepository(supabase);

    const useCase = new CheckSubscriptionCreditUseCase(subscriptionRepo, planRepo);

    return await useCase.execute({ userId: user.id });
}

export async function consumeSubscriptionCreditAction(transactionId: string): Promise<{
    success: boolean;
    message: string;
    remainingCredits?: number;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' };
    }

    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    const planRepo = new SupabasePlanRepository(supabase);
    const transactionRepo = new SupabaseTransactionRepository(supabase);
    const auditService = new SupabaseAuditService();

    const useCase = new ConsumeSubscriptionCreditUseCase(
        subscriptionRepo,
        planRepo,
        transactionRepo,
        auditService
    );

    return await useCase.execute({
        userId: user.id,
        transactionId,
    });
}

export async function getActiveSubscriptionAction(): Promise<Subscription | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    return await subscriptionRepo.findActiveByUserId(user.id);
}

export async function getUserSubscriptionsAction(): Promise<Subscription[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    return await subscriptionRepo.findByUserId(user.id);
}

export async function getPlanByIdAction(planId: string): Promise<Plan | null> {
    const supabase = await createClient();
    const planRepo = new SupabasePlanRepository(supabase);
    return await planRepo.findById(planId);
}

export async function initiateSubscriptionAction(planId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { InitiateSubscriptionUseCase } = await import('@application/use-cases/initiate-subscription');
    const { AbacatePayGateway } = await import('@infrastructure/services/abacate-pay-gateway');
    const { SupabasePaymentRepository, SupabaseUserRepository } = await import('@infrastructure/repositories');

    const planRepo = new SupabasePlanRepository(supabase);
    const subscriptionRepo = new SupabaseSubscriptionRepository(supabase);
    const paymentRepo = new SupabasePaymentRepository(supabase);
    const userRepo = new SupabaseUserRepository(supabase);
    const paymentGateway = new AbacatePayGateway();

    const useCase = new InitiateSubscriptionUseCase(
        planRepo,
        subscriptionRepo,
        paymentRepo,
        userRepo,
        paymentGateway
    );

    const result = await useCase.execute({
        userId: user.id,
        planId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/minha-assinatura?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
    });

    return { checkoutUrl: result.checkoutUrl };
}
