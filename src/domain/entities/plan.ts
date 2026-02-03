export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Plan {
    id: string;
    name: string;
    description?: string;
    diagnosesPerCycle: number;
    priceCents: number;
    billingCycle: BillingCycle;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function createPlan(params: {
    id: string;
    name: string;
    description?: string;
    diagnosesPerCycle: number;
    priceCents: number;
    billingCycle?: BillingCycle;
}): Plan {
    const now = new Date();
    return {
        id: params.id,
        name: params.name,
        description: params.description,
        diagnosesPerCycle: params.diagnosesPerCycle,
        priceCents: params.priceCents,
        billingCycle: params.billingCycle ?? 'MONTHLY',
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
}

export function formatPlanPrice(plan: Plan): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(plan.priceCents / 100);
}

export function getPricePerDiagnosis(plan: Plan): number {
    return plan.priceCents / plan.diagnosesPerCycle;
}
