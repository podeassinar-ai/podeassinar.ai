import { Plan } from '@domain/entities/plan';

export interface IPlanRepository {
    findById(id: string): Promise<Plan | null>;
    findAll(): Promise<Plan[]>;
    findActive(): Promise<Plan[]>;
    create(plan: Plan): Promise<Plan>;
    update(plan: Plan): Promise<Plan>;
}
