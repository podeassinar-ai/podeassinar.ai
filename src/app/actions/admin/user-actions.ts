'use server';

import { verifySystemAdminAccess } from './auth-helpers';
import { SupabaseUserRepository } from '@infrastructure/repositories';
import { User, UserRole, getRoleLabel } from '@domain/entities/user';

export interface UserListItem {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    roleLabel: string;
    isActive: boolean;
    createdAt: Date;
}

export async function getAllUsers(): Promise<UserListItem[]> {
    const { supabase } = await verifySystemAdminAccess();

    const userRepo = new SupabaseUserRepository(supabase);
    const users = await userRepo.findAll(200);

    return users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        roleLabel: getRoleLabel(u.role),
        isActive: u.isActive,
        createdAt: u.createdAt,
    }));
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const { dbUser, supabase } = await verifySystemAdminAccess();

    // Prevent self-demotion
    if (dbUser.id === userId && newRole !== 'SYSTEM_ADMIN') {
        throw new Error('Cannot demote yourself');
    }

    const userRepo = new SupabaseUserRepository(supabase);
    return userRepo.updateRole(userId, newRole);
}

export async function deactivateUser(userId: string): Promise<void> {
    const { dbUser, supabase } = await verifySystemAdminAccess();

    // Prevent self-deactivation
    if (dbUser.id === userId) {
        throw new Error('Cannot deactivate yourself');
    }

    const userRepo = new SupabaseUserRepository(supabase);
    await userRepo.deactivate(userId);
}
