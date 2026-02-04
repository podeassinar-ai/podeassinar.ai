'use server';

import { verifyAdminAccess } from './auth-helpers';
import {
    SupabaseFulfillmentRepository,
    SupabaseUserRepository,
} from '@infrastructure/repositories';
import { FulfillmentRequest } from '@domain/entities/fulfillment-request';

export async function getPendingFulfillments(): Promise<(FulfillmentRequest & { userName: string; userEmail: string })[]> {
    const { supabase } = await verifyAdminAccess();

    const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
    const userRepo = new SupabaseUserRepository(supabase);

    const pending = await fulfillmentRepo.findPending();
    const results = [];

    for (const request of pending) {
        const user = await userRepo.findById(request.userId);
        results.push({
            ...request,
            userName: user?.name ?? 'Usuário desconhecido',
            userEmail: user?.email ?? '',
        });
    }

    return results;
}

export async function assignFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
    const { user, supabase } = await verifyAdminAccess();

    const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
    return fulfillmentRepo.assign(fulfillmentId, user.id);
}

export async function completeFulfillment(fulfillmentId: string): Promise<FulfillmentRequest> {
    const { supabase } = await verifyAdminAccess();

    const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
    return fulfillmentRepo.markCompleted(fulfillmentId);
}

export async function addFulfillmentNotes(fulfillmentId: string, notes: string): Promise<FulfillmentRequest> {
    const { supabase } = await verifyAdminAccess();

    const fulfillmentRepo = new SupabaseFulfillmentRepository(supabase);
    return fulfillmentRepo.addNotes(fulfillmentId, notes);
}
