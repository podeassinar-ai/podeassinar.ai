import { QuestionnaireAnswer } from '@domain/entities/questionnaire';
import { IQuestionnaireRepository } from '@domain/interfaces/questionnaire-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface SubmitQuestionnaireInput {
  userId: string;
  transactionId: string;
  answers: QuestionnaireAnswer[];
}

export class SubmitQuestionnaireUseCase {
  constructor(
    private questionnaireRepository: IQuestionnaireRepository,
    private transactionRepository: ITransactionRepository,
    private auditService: IAuditService
  ) {}

  async execute(input: SubmitQuestionnaireInput): Promise<void> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== input.userId) {
      throw new Error('Unauthorized access to transaction');
    }

    if (transaction.status !== 'PENDING_QUESTIONNAIRE') {
      throw new Error('Transaction is not in questionnaire stage');
    }

    const questionnaire = await this.questionnaireRepository.findByTransactionId(input.transactionId);
    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    if (questionnaire.completedAt) {
      throw new Error('Questionnaire already completed');
    }

    for (const answer of input.answers) {
      await this.questionnaireRepository.addAnswer(questionnaire.id, answer);
    }

    await this.questionnaireRepository.markComplete(questionnaire.id);

    try {
      await this.transactionRepository.updateStatus(input.transactionId, 'PENDING_DOCUMENTS');
    } catch (statusError) {
      throw new Error(`Failed to update transaction status: ${statusError instanceof Error ? statusError.message : 'Unknown error'}`);
    }

    await this.auditService.log({
      userId: input.userId,
      action: 'UPDATE',
      resource: 'TRANSACTION',
      resourceId: input.transactionId,
      metadata: { action: 'questionnaire_completed' },
    });
  }
}
