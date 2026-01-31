import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  TransactionType,
  createTransaction,
} from '@domain/entities/transaction';
import {
  DiagnosticQuestionnaire,
  createQuestionnaire,
} from '@domain/entities/questionnaire';
import {
  LegalDiagnosis,
  createDiagnosis,
} from '@domain/entities/diagnosis';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IQuestionnaireRepository } from '@domain/interfaces/questionnaire-repository';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface CreateDiagnosticInput {
  userId: string;
  type: TransactionType;
  propertyAddress?: string;
  registryNumber?: string;
  registryOffice?: string;
}

export interface CreateDiagnosticOutput {
  transaction: Transaction;
  questionnaire: DiagnosticQuestionnaire;
  diagnosis: LegalDiagnosis;
}

export class CreateDiagnosticTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private questionnaireRepository: IQuestionnaireRepository,
    private diagnosisRepository: IDiagnosisRepository,
    private auditService: IAuditService
  ) {}

  async execute(input: CreateDiagnosticInput): Promise<CreateDiagnosticOutput> {
    const transactionId = uuidv4();
    const questionnaireId = uuidv4();
    const diagnosisId = uuidv4();

    const transaction = createTransaction({
      id: transactionId,
      userId: input.userId,
      type: input.type,
      propertyAddress: input.propertyAddress,
      registryNumber: input.registryNumber,
      registryOffice: input.registryOffice,
    });

    const questionnaire = createQuestionnaire({
      id: questionnaireId,
      transactionId,
    });

    const diagnosis = createDiagnosis({
      id: diagnosisId,
      transactionId,
    });

    const [savedTransaction, savedQuestionnaire, savedDiagnosis] = await Promise.all([
      this.transactionRepository.create(transaction),
      this.questionnaireRepository.create(questionnaire),
      this.diagnosisRepository.create(diagnosis),
    ]);

    await this.auditService.log({
      userId: input.userId,
      action: 'CREATE',
      resource: 'TRANSACTION',
      resourceId: transactionId,
      metadata: { type: input.type },
    });

    return {
      transaction: savedTransaction,
      questionnaire: savedQuestionnaire,
      diagnosis: savedDiagnosis,
    };
  }
}
