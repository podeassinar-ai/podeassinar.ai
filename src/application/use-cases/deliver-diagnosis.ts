import { LegalDiagnosis, canBeDelivered } from '@domain/entities/diagnosis';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface DeliverDiagnosisInput {
  transactionId: string;
  userId: string;
}

export class DeliverDiagnosisUseCase {
  constructor(
    private diagnosisRepository: IDiagnosisRepository,
    private transactionRepository: ITransactionRepository,
    private auditService: IAuditService
  ) {}

  async execute(input: DeliverDiagnosisInput): Promise<LegalDiagnosis> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== input.userId) {
      throw new Error('Unauthorized access to transaction');
    }

    const diagnosis = await this.diagnosisRepository.findByTransactionId(input.transactionId);
    if (!diagnosis) {
      throw new Error('Diagnosis not found');
    }

    if (!canBeDelivered(diagnosis)) {
      throw new Error('Diagnosis is not ready for delivery');
    }

    await this.diagnosisRepository.markDelivered(diagnosis.id);
    await this.transactionRepository.updateStatus(input.transactionId, 'COMPLETED');

    await this.auditService.log({
      userId: input.userId,
      action: 'READ',
      resource: 'DIAGNOSIS',
      resourceId: diagnosis.id,
      metadata: { action: 'delivered' },
    });

    const deliveredDiagnosis = await this.diagnosisRepository.findById(diagnosis.id);
    return deliveredDiagnosis!;
  }
}
