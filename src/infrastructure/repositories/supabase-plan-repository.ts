import { IPlanRepository } from '@domain/interfaces/plan-repository';
import { Plan, BillingCycle } from '@domain/entities/plan';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabasePlanRepository implements IPlanRepository {
    constructor(private supabase: SupabaseClient) { }

    async findById(id: string): Promise<Plan | null> {
        const { data, error } = await this.supabase
            .from('plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return this.mapToEntity(data);
    }

    async findAll(): Promise<Plan[]> {
        const { data, error } = await this.supabase
            .from('plans')
            .select('*')
            .order('price_cents', { ascending: true });

        if (error || !data) return [];

        return data.map(this.mapToEntity);
    }

    async findActive(): Promise<Plan[]> {
        const { data, error } = await this.supabase
            .from('plans')
            .select('*')
            .eq('is_active', true)
            .order('price_cents', { ascending: true });

        if (error || !data) return [];

        return data.map(this.mapToEntity);
    }

    async create(plan: Plan): Promise<Plan> {
        const { data, error } = await this.supabase
            .from('plans')
            .insert({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                diagnoses_per_cycle: plan.diagnosesPerCycle,
                price_cents: plan.priceCents,
                billing_cycle: plan.billingCycle,
                is_active: plan.isActive,
                created_at: plan.createdAt.toISOString(),
                updated_at: plan.updatedAt.toISOString(),
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return this.mapToEntity(data);
    }

    async update(plan: Plan): Promise<Plan> {
        const { error } = await this.supabase
            .from('plans')
            .update({
                name: plan.name,
                description: plan.description,
                diagnoses_per_cycle: plan.diagnosesPerCycle,
                price_cents: plan.priceCents,
                billing_cycle: plan.billingCycle,
                is_active: plan.isActive,
                updated_at: new Date().toISOString(),
            })
            .eq('id', plan.id);

        if (error) throw new Error(error.message);

        return plan;
    }

    private mapToEntity(data: any): Plan {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            diagnosesPerCycle: data.diagnoses_per_cycle,
            priceCents: data.price_cents,
            billingCycle: data.billing_cycle as BillingCycle,
            isActive: data.is_active,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}
