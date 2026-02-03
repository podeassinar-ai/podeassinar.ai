import { ISubscriptionRepository } from '@domain/interfaces/subscription-repository';
import { Subscription, SubscriptionStatus } from '@domain/entities/subscription';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseSubscriptionRepository implements ISubscriptionRepository {
    constructor(private supabase: SupabaseClient) { }

    async findById(id: string): Promise<Subscription | null> {
        const { data, error } = await this.supabase
            .from('user_subscriptions')
            .select(`
        *,
        plan:plans(*)
      `)
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return this.mapToEntity(data);
    }

    async findByUserId(userId: string): Promise<Subscription[]> {
        const { data, error } = await this.supabase
            .from('user_subscriptions')
            .select(`
        *,
        plan:plans(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(this.mapToEntity);
    }

    async findActiveByUserId(userId: string): Promise<Subscription | null> {
        const now = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('user_subscriptions')
            .select(`
        *,
        plan:plans(*)
      `)
            .eq('user_id', userId)
            .eq('status', 'ACTIVE')
            .gte('current_period_end', now)
            .lte('current_period_start', now)
            .single();

        if (error || !data) return null;

        return this.mapToEntity(data);
    }

    async create(subscription: Subscription): Promise<Subscription> {
        const { data, error } = await this.supabase
            .from('user_subscriptions')
            .insert({
                id: subscription.id,
                user_id: subscription.userId,
                plan_id: subscription.planId,
                status: subscription.status,
                current_period_start: subscription.currentPeriodStart.toISOString(),
                current_period_end: subscription.currentPeriodEnd.toISOString(),
                diagnoses_used: subscription.diagnosesUsed,
                external_subscription_id: subscription.externalSubscriptionId,
                cancelled_at: subscription.cancelledAt?.toISOString(),
                created_at: subscription.createdAt.toISOString(),
                updated_at: subscription.updatedAt.toISOString(),
            })
            .select(`
        *,
        plan:plans(*)
      `)
            .single();

        if (error) throw new Error(error.message);

        return this.mapToEntity(data);
    }

    async update(subscription: Subscription): Promise<Subscription> {
        const { error } = await this.supabase
            .from('user_subscriptions')
            .update({
                status: subscription.status,
                current_period_start: subscription.currentPeriodStart.toISOString(),
                current_period_end: subscription.currentPeriodEnd.toISOString(),
                diagnoses_used: subscription.diagnosesUsed,
                external_subscription_id: subscription.externalSubscriptionId,
                cancelled_at: subscription.cancelledAt?.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

        if (error) throw new Error(error.message);

        return subscription;
    }

    async incrementDiagnosesUsed(subscriptionId: string): Promise<void> {
        const { error } = await this.supabase.rpc('increment_diagnoses_used', {
            subscription_id: subscriptionId,
        });

        // Fallback if RPC doesn't exist: manual increment
        if (error) {
            const sub = await this.findById(subscriptionId);
            if (sub) {
                await this.supabase
                    .from('user_subscriptions')
                    .update({
                        diagnoses_used: sub.diagnosesUsed + 1,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', subscriptionId);
            }
        }
    }

    private mapToEntity(data: any): Subscription {
        const subscription: Subscription = {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            status: data.status as SubscriptionStatus,
            currentPeriodStart: new Date(data.current_period_start),
            currentPeriodEnd: new Date(data.current_period_end),
            diagnosesUsed: data.diagnoses_used,
            externalSubscriptionId: data.external_subscription_id,
            cancelledAt: data.cancelled_at ? new Date(data.cancelled_at) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };

        if (data.plan) {
            subscription.plan = {
                id: data.plan.id,
                name: data.plan.name,
                description: data.plan.description,
                diagnosesPerCycle: data.plan.diagnoses_per_cycle,
                priceCents: data.plan.price_cents,
                billingCycle: data.plan.billing_cycle,
                isActive: data.plan.is_active,
                createdAt: new Date(data.plan.created_at),
                updatedAt: new Date(data.plan.updated_at),
            };
        }

        return subscription;
    }
}
