import { v4 as uuidv4 } from 'uuid';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { createDiagnosis } from '@domain/entities/diagnosis';

export interface PostPaymentProcessingInput {
  transactionId: string;
  userId: string;
}

export interface PostPaymentProcessingResult {
  enqueued: boolean;
}

type SendDocumentsExtractionRequested = (
  input: PostPaymentProcessingInput
) => Promise<void>;

export class PostPaymentProcessingService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private diagnosisRepository: IDiagnosisRepository,
    private sendDocumentsExtractionRequested: SendDocumentsExtractionRequested
  ) {}

  async execute(input: PostPaymentProcessingInput): Promise<PostPaymentProcessingResult> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== input.userId) {
      throw new Error('Unauthorized access to transaction');
    }

    if (['PROCESSING', 'PENDING_REVIEW', 'COMPLETED'].includes(transaction.status)) {
      return { enqueued: false };
    }

    const diagnosis = await this.diagnosisRepository.findByTransactionId(input.transactionId);
    if (!diagnosis) {
      await this.diagnosisRepository.create(
        createDiagnosis({
          id: uuidv4(),
          transactionId: input.transactionId,
        })
      );
    }

    await this.transactionRepository.updateStatus(input.transactionId, 'PROCESSING');
    await this.sendDocumentsExtractionRequested(input);

    return { enqueued: true };
  }
}
