import { v4 as uuidv4 } from 'uuid';
import { AdminNotification, NotificationType, createAdminNotification } from '@domain/entities/admin-notification';
import { INotificationRepository } from '@domain/interfaces/notification-repository';
import { IEmailService } from '@domain/interfaces/email-service';
import { IUserRepository } from '@domain/interfaces/user-repository';
import { IAuditService } from '@domain/interfaces/audit-service';
import { User } from '@domain/entities/user';

export interface DiagnosisGeneratedEventPayload {
    transactionId: string;
    diagnosisId: string;
    userId: string;
    customerName: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CreateAdminNotificationInput {
    type: NotificationType;
    payload: AdminNotification['payload'];
    recipientIds?: string[]; // If not provided, notify all admins/lawyers
}

export class CreateAdminNotificationUseCase {
    constructor(
        private notificationRepository: INotificationRepository,
        private userRepository: IUserRepository,
        private emailService: IEmailService,
        private auditService: IAuditService
    ) { }

    async execute(input: CreateAdminNotificationInput): Promise<AdminNotification[]> {
        let recipients: User[];

        if (input.recipientIds && input.recipientIds.length > 0) {
            const users = await Promise.all(
                input.recipientIds.map((id) => this.userRepository.findById(id))
            );
            recipients = users.filter((u): u is User => u !== null);
        } else {
            const admins = await this.userRepository.findByRole('ADMIN');
            const lawyers = await this.userRepository.findByRole('LAWYER');
            recipients = [...admins, ...lawyers];
        }

        const notifications: AdminNotification[] = [];

        for (const recipient of recipients) {
            const notification = createAdminNotification({
                id: uuidv4(),
                type: input.type,
                recipientId: recipient.id,
                payload: input.payload,
            });

            const saved = await this.notificationRepository.create(notification);
            notifications.push(saved);

            await this.auditService.log({
                userId: recipient.id,
                action: 'CREATE',
                resource: 'ADMIN_NOTIFICATION',
                resourceId: saved.id,
                metadata: { type: input.type },
            });

            // Send email notification
            try {
                await this.emailService.send({
                    to: [{ email: recipient.email, name: recipient.name }],
                    subject: this.getEmailSubject(input.type),
                    htmlBody: this.getEmailBody(input.type, input.payload),
                    textBody: input.payload.message,
                });

                await this.auditService.log({
                    userId: recipient.id,
                    action: 'CREATE',
                    resource: 'EMAIL_NOTIFICATION',
                    resourceId: saved.id,
                    metadata: { type: input.type, sent: true },
                });
            } catch (error) {
                console.error(`Failed to send email to ${recipient.email}:`, error);
                await this.auditService.log({
                    userId: recipient.id,
                    action: 'CREATE',
                    resource: 'EMAIL_NOTIFICATION',
                    resourceId: saved.id,
                    metadata: { type: input.type, sent: false, error: String(error) },
                });
            }
        }

        return notifications;
    }

    private getEmailSubject(type: NotificationType): string {
        switch (type) {
            case 'DIAGNOSIS_PENDING_REVIEW':
                return '[PodeAssinar] Novo diagnóstico aguardando revisão';
            case 'FULFILLMENT_REQUEST_CREATED':
                return '[PodeAssinar] Nova solicitação de certidão';
            case 'TRANSACTION_ESCALATED':
                return '[PodeAssinar] Transação escalada - atenção necessária';
            default:
                return '[PodeAssinar] Nova notificação';
        }
    }

    private getEmailBody(type: NotificationType, payload: AdminNotification['payload']): string {
        return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">PodeAssinar.ai</h2>
        <p>${payload.message}</p>
        ${payload.customerName ? `<p><strong>Cliente:</strong> ${payload.customerName}</p>` : ''}
        ${payload.transactionId ? `<p><strong>Transação:</strong> ${payload.transactionId}</p>` : ''}
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://podeassinar.ai'}/admin" 
             style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Acessar Painel Admin
          </a>
        </p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Este é um email automático do sistema PodeAssinar.ai
        </p>
      </body>
      </html>
    `;
    }
}
