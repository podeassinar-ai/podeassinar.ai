export type NotificationType =
    | 'DIAGNOSIS_PENDING_REVIEW'
    | 'FULFILLMENT_REQUEST_CREATED'
    | 'TRANSACTION_ESCALATED';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AdminNotification {
    id: string;
    type: NotificationType;
    recipientId: string;
    payload: {
        transactionId?: string;
        diagnosisId?: string;
        customerName?: string;
        message: string;
        priority: NotificationPriority;
    };
    readAt: Date | null;
    createdAt: Date;
}

export function createAdminNotification(params: {
    id: string;
    type: NotificationType;
    recipientId: string;
    payload: AdminNotification['payload'];
}): AdminNotification {
    return {
        id: params.id,
        type: params.type,
        recipientId: params.recipientId,
        payload: params.payload,
        readAt: null,
        createdAt: new Date(),
    };
}

export function isUnread(notification: AdminNotification): boolean {
    return notification.readAt === null;
}

export function markAsRead(notification: AdminNotification): AdminNotification {
    return {
        ...notification,
        readAt: new Date(),
    };
}
