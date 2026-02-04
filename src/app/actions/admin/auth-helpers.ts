'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import { SupabaseUserRepository } from '@infrastructure/repositories';

/**
 * Verify that the current user has admin access (SYSTEM_ADMIN, ADMIN, or LAWYER role).
 */
export async function verifyAdminAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const userRepo = new SupabaseUserRepository(supabase);
    const dbUser = await userRepo.findById(user.id);

    if (!dbUser || !['SYSTEM_ADMIN', 'ADMIN', 'LAWYER'].includes(dbUser.role)) {
        throw new Error('Access denied: Admin or Lawyer role required');
    }

    return { user, supabase, dbUser };
}

/**
 * Verify that the current user has System Admin access.
 */
export async function verifySystemAdminAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const userRepo = new SupabaseUserRepository(supabase);
    const dbUser = await userRepo.findById(user.id);

    if (!dbUser || dbUser.role !== 'SYSTEM_ADMIN') {
        throw new Error('Access denied: System Admin role required');
    }

    return { user, supabase, dbUser };
}
