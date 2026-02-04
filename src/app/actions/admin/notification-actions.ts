'use server';

import { verifyAdminAccess } from './auth-helpers';
import { SupabaseNotificationRepository } from '@infrastructure/repositories';
import { AdminNotification } from '@domain/entities/admin-notification';

export async function getAdminNotifications(limit = 20): Promise<AdminNotification[]> {
    const { user, supabase } = await verifyAdminAccess();

    const notificationRepo = new SupabaseNotificationRepository(supabase);
    return notificationRepo.findByRecipientId(user.id, limit);
}

export async function getUnreadNotificationCount(): Promise<number> {
    const { user, supabase } = await verifyAdminAccess();

    const notificationRepo = new SupabaseNotificationRepository(supabase);
    return notificationRepo.countUnreadByRecipientId(user.id);
}

export async function markNotificationAsRead(notificationId: string): Promise<AdminNotification> {
    const { user, supabase } = await verifyAdminAccess();

    const notificationRepo = new SupabaseNotificationRepository(supabase);
    const notification = await notificationRepo.findById(notificationId);

    if (!notification) {
        throw new Error('Notification not found');
    }

    if (notification.recipientId !== user.id) {
        throw new Error('Unauthorized');
    }

    return notificationRepo.markAsRead(notificationId);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    const { user, supabase } = await verifyAdminAccess();

    const notificationRepo = new SupabaseNotificationRepository(supabase);
    const unread = await notificationRepo.findUnreadByRecipientId(user.id);

    for (const notification of unread) {
        await notificationRepo.markAsRead(notification.id);
    }
}
