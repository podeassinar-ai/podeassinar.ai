import { INotificationRepository } from '@domain/interfaces/notification-repository';
import { AdminNotification, NotificationType } from '@domain/entities/admin-notification';
import { SupabaseClient } from '@supabase/supabase-js';

interface NotificationRow {
    id: string;
    type: string;
    recipient_id: string;
    payload: AdminNotification['payload'];
    read_at: string | null;
    created_at: string;
}

export class SupabaseNotificationRepository implements INotificationRepository {
    constructor(private supabase: SupabaseClient) { }

    private mapRowToEntity(row: NotificationRow): AdminNotification {
        return {
            id: row.id,
            type: row.type as NotificationType,
            recipientId: row.recipient_id,
            payload: row.payload,
            readAt: row.read_at ? new Date(row.read_at) : null,
            createdAt: new Date(row.created_at),
        };
    }

    async create(notification: AdminNotification): Promise<AdminNotification> {
        const { data, error } = await this.supabase
            .from('admin_notifications')
            .insert({
                id: notification.id,
                type: notification.type,
                recipient_id: notification.recipientId,
                payload: notification.payload,
                read_at: notification.readAt?.toISOString() ?? null,
                created_at: notification.createdAt.toISOString(),
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create notification: ${error.message}`);
        return this.mapRowToEntity(data);
    }

    async findById(id: string): Promise<AdminNotification | null> {
        const { data, error } = await this.supabase
            .from('admin_notifications')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return this.mapRowToEntity(data);
    }

    async findByRecipientId(recipientId: string, limit = 50): Promise<AdminNotification[]> {
        const { data, error } = await this.supabase
            .from('admin_notifications')
            .select('*')
            .eq('recipient_id', recipientId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];
        return data.map((row) => this.mapRowToEntity(row));
    }

    async findUnreadByRecipientId(recipientId: string): Promise<AdminNotification[]> {
        const { data, error } = await this.supabase
            .from('admin_notifications')
            .select('*')
            .eq('recipient_id', recipientId)
            .is('read_at', null)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data.map((row) => this.mapRowToEntity(row));
    }

    async markAsRead(id: string): Promise<AdminNotification> {
        const { data, error } = await this.supabase
            .from('admin_notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
        return this.mapRowToEntity(data);
    }

    async countUnreadByRecipientId(recipientId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('admin_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', recipientId)
            .is('read_at', null);

        if (error) throw new Error(`Failed to count unread notifications: ${error.message}`);
        return count ?? 0;
    }
}
