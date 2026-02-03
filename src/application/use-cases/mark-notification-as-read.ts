import { AdminNotification } from '@domain/entities/admin-notification';
import { INotificationRepository } from '@domain/interfaces/notification-repository';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface MarkNotificationAsReadInput {
    notificationId: string;
    userId: string;
}

export class MarkNotificationAsReadUseCase {
    constructor(
        private notificationRepository: INotificationRepository,
        private auditService: IAuditService
    ) { }

    async execute(input: MarkNotificationAsReadInput): Promise<AdminNotification> {
        const notification = await this.notificationRepository.findById(input.notificationId);

        if (!notification) {
            throw new Error('Notification not found');
        }

        if (notification.recipientId !== input.userId) {
            throw new Error('Unauthorized: Cannot mark another user\'s notification as read');
        }

        if (notification.readAt !== null) {
            return notification; // Already read
        }

        const updated = await this.notificationRepository.markAsRead(input.notificationId);

        await this.auditService.log({
            userId: input.userId,
            action: 'UPDATE',
            resource: 'ADMIN_NOTIFICATION',
            resourceId: input.notificationId,
            metadata: { action: 'marked_as_read' },
        });

        return updated;
    }
}
