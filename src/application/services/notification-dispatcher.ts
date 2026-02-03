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
