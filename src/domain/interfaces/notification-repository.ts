import { AdminNotification, NotificationType } from '@domain/entities/admin-notification';

export interface INotificationRepository {
    create(notification: AdminNotification): Promise<AdminNotification>;
    findById(id: string): Promise<AdminNotification | null>;
    findByRecipientId(recipientId: string, limit?: number): Promise<AdminNotification[]>;
    findUnreadByRecipientId(recipientId: string): Promise<AdminNotification[]>;
    markAsRead(id: string): Promise<AdminNotification>;
    countUnreadByRecipientId(recipientId: string): Promise<number>;
}
