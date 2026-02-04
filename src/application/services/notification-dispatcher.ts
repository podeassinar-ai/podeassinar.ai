import { INotificationRepository } from '@domain/interfaces/notification-repository';
import { IEmailService } from '@domain/interfaces/email-service';
import { IUserRepository } from '@domain/interfaces/user-repository';
import { IAuditService } from '@domain/interfaces/audit-service';
import { CreateAdminNotificationUseCase } from '@application/use-cases/create-admin-notification';
import { LegalDiagnosis, hasHighRisks } from '@domain/entities/diagnosis';
import { Transaction } from '@domain/entities/transaction';
import { User } from '@domain/entities/user';

/**
 * NotificationDispatcher orchestrates notification delivery.
 * It listens for domain events and creates appropriate notifications.
 */
export class NotificationDispatcher {
    private createNotificationUseCase: CreateAdminNotificationUseCase;

    constructor(
        private notificationRepository: INotificationRepository,
        private userRepository: IUserRepository,
        private emailService: IEmailService,
        private auditService: IAuditService
    ) {
        this.createNotificationUseCase = new CreateAdminNotificationUseCase(
            notificationRepository,
            userRepository,
            emailService,
            auditService
        );
    }

    /**
     * Called when a diagnosis is generated and ready for review.
     */
    async onDiagnosisGenerated(
        diagnosis: LegalDiagnosis,
        transaction: Transaction,
        customer: User
    ): Promise<void> {
        const priority = hasHighRisks(diagnosis) ? 'HIGH' : 'MEDIUM';

        await this.createNotificationUseCase.execute({
            type: 'DIAGNOSIS_PENDING_REVIEW',
            payload: {
                transactionId: transaction.id,
                diagnosisId: diagnosis.id,
                customerName: customer.name,
                priority,
                message: `Novo diagnóstico de ${customer.name} aguardando revisão.${priority === 'HIGH' ? ' (Riscos altos detectados)' : ''}`,
            },
        });
    }

    /**
     * Called when a diagnosis is approved and delivered to the customer.
     */
    async onDiagnosisApproved(
        diagnosis: LegalDiagnosis,
        transaction: Transaction,
        customer: User
    ): Promise<void> {
        try {
            await this.emailService.send({
                to: [{ email: customer.email, name: customer.name }],
                subject: '[PodeAssinar] Sua análise jurídica está pronta!',
                htmlBody: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">PodeAssinar.ai</h2>
            <p>Olá <strong>${customer.name}</strong>,</p>
            <p>Temos boas notícias! Sua análise jurídica para o imóvel em <strong>${transaction.propertyAddress || 'endereço informado'}</strong> foi finalizada e revisada por nossos especialistas.</p>
            <p>Você já pode acessar o relatório detalhado em seu painel.</p>
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://podeassinar.ai'}/diagnostico/${transaction.id}" 
                 style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Ver Meu Diagnóstico
              </a>
            </p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 12px;">
              Este é um email automático do sistema PodeAssinar.ai
            </p>
          </body>
          </html>
        `,
                textBody: `Olá ${customer.name}, sua análise jurídica está pronta! Acesse em: ${process.env.NEXT_PUBLIC_APP_URL || 'https://podeassinar.ai'}/diagnostico/${transaction.id}`,
            });

            await this.auditService.log({
                userId: customer.id,
                action: 'UPDATE',
                resource: 'EMAIL_NOTIFICATION',
                resourceId: diagnosis.id,
                metadata: { type: 'DIAGNOSIS_DELIVERED', sent: true },
            });
        } catch (error) {
            console.error(`Failed to send delivery email to ${customer.email}:`, error);
        }
    }

    /**
     * Called when a fulfillment request is created (certificate request).
     */
    async onFulfillmentRequestCreated(
        fulfillmentId: string,
        transaction: Transaction,
        customer: User
    ): Promise<void> {
        await this.createNotificationUseCase.execute({
            type: 'FULFILLMENT_REQUEST_CREATED',
            payload: {
                transactionId: transaction.id,
                customerName: customer.name,
                priority: 'MEDIUM',
                message: `Nova solicitação de certidão de ${customer.name}.`,
            },
        });
    }
}
