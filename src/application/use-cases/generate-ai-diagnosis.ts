import { LegalDiagnosis } from '@domain/entities/diagnosis';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { IQuestionnaireRepository } from '@domain/interfaces/questionnaire-repository';
import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IAIService, AIAnalysisInput } from '@domain/interfaces/ai-service';
import { IStorageService } from '@domain/interfaces/storage-service';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface GenerateAIDiagnosisInput {
  userId: string;
  transactionId: string;
}

export interface GenerateAIDiagnosisConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  maxRetryDelayMs?: number;
}

export class AIProcessingError extends Error {
  constructor(
    message: string,
    public readonly transactionId: string,
    public readonly attempts: number,
    public readonly isRetryable: boolean,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIProcessingError';
  }
}

export class GenerateAIDiagnosisUseCase {
  private maxRetries: number;
  private retryDelayMs: number;
  private maxRetryDelayMs: number;

  constructor(
    private diagnosisRepository: IDiagnosisRepository,
    private questionnaireRepository: IQuestionnaireRepository,
    private documentRepository: IDocumentRepository,
    private transactionRepository: ITransactionRepository,
    private aiService: IAIService,
    private storageService: IStorageService,
    private auditService: IAuditService,
    config?: GenerateAIDiagnosisConfig
  ) {
    this.maxRetries = config?.maxRetries ?? 3;
    this.retryDelayMs = config?.retryDelayMs ?? 2000;
    this.maxRetryDelayMs = config?.maxRetryDelayMs ?? 30000;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateBackoff(attempt: number): number {
    const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(delay + jitter, this.maxRetryDelayMs);
  }

  private isRetryableError(error: any): boolean {
    const retryableMessages = [
      'retryable', // explicit marker from downstream services (e.g. OpenAI parse failures)
      'rate limit',
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'socket hang up',
      '429',
      '500',
      '502',
      '503',
      '504',
    ];
    
    const errorMessage = (error.message || '').toLowerCase();
    return retryableMessages.some((msg) => errorMessage.includes(msg.toLowerCase()));
  }

  async execute(input: GenerateAIDiagnosisInput): Promise<LegalDiagnosis> {
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

    // Idempotency for Inngest re-runs: if a previous run already produced the
    // diagnosis (status moved off PROCESSING), don't throw or re-generate —
    // return the existing result. Only a genuinely-not-yet-processed transaction
    // (PROCESSING) proceeds to call the AI.
    if (transaction.status !== 'PROCESSING') {
      if (diagnosis.status === 'AI_GENERATED' || diagnosis.status === 'UNDER_REVIEW'
        || diagnosis.status === 'APPROVED' || diagnosis.status === 'DELIVERED') {
        return diagnosis;
      }
      throw new Error(`Transaction is not ready for AI processing (status=${transaction.status})`);
    }

    const questionnaire = await this.questionnaireRepository.findByTransactionId(input.transactionId);
    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const documents = await this.documentRepository.findByTransactionId(input.transactionId);

    const documentContents: AIAnalysisInput['documentContents'] = [];
    for (const doc of documents) {
      if (doc.extractedData && typeof doc.extractedData.text === 'string') {
        documentContents.push({
          documentId: doc.id,
          extractedText: doc.extractedData.text,
        });
      }
    }

    let lastError: Error | undefined;
    let attempts = 0;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      attempts = attempt;
      
      try {
        await this.auditService.log({
          userId: transaction.userId,
          action: 'UPDATE',
          resource: 'DIAGNOSIS',
          resourceId: diagnosis.id,
          metadata: { action: 'ai_processing_attempt', attempt },
        });

        const aiResult = await this.aiService.analyzeForDiagnosis({
          questionnaire,
          documents,
          documentContents,
          transactionContext: {
            type: transaction.type,
            propertyAddress: transaction.propertyAddress,
            propertyType: transaction.propertyType,
            propertyValue: transaction.propertyValue,
            hasMatricula: transaction.hasMatricula,
            matriculaOption: transaction.matriculaOption,
            additionalInfo: transaction.additionalInfo,
            registryNumber: transaction.registryNumber,
            registryOffice: transaction.registryOffice,
          },
        });

        await this.diagnosisRepository.updateContent(diagnosis.id, {
          propertyStatus: aiResult.propertyStatus,
          risks: aiResult.risks,
          pathways: aiResult.pathways,
          summary: aiResult.summary,
          aiConfidence: aiResult.confidence,
        });

        // updateStatus returns the row AFTER the status change, so the returned
        // diagnosis reflects the final AI_GENERATED state (updateContent alone
        // would return the pre-status-update row).
        const updatedDiagnosis = await this.diagnosisRepository.updateStatus(
          diagnosis.id,
          'AI_GENERATED'
        );
        await this.transactionRepository.updateStatus(input.transactionId, 'PENDING_REVIEW');

        await this.auditService.log({
          userId: transaction.userId,
          action: 'UPDATE',
          resource: 'DIAGNOSIS',
          resourceId: diagnosis.id,
          metadata: { 
            action: 'ai_generated', 
            confidence: aiResult.confidence,
            attempts,
          },
        });

        return updatedDiagnosis;
      } catch (error: any) {
        lastError = error;
        
        const isRetryable = this.isRetryableError(error);

        await this.auditService.log({
          userId: transaction.userId,
          action: 'UPDATE',
          resource: 'DIAGNOSIS',
          resourceId: diagnosis.id,
          metadata: { 
            action: 'ai_processing_error', 
            attempt,
            error: error.message,
            isRetryable,
          },
        });

        if (!isRetryable || attempt === this.maxRetries) {
          break;
        }

        const backoffMs = this.calculateBackoff(attempt);
        console.log(
          `AI processing attempt ${attempt} failed for transaction ${input.transactionId}. ` +
          `Retrying in ${backoffMs}ms...`
        );
        
        await this.sleep(backoffMs);
      }
    }

    await this.transactionRepository.updateStatus(input.transactionId, 'ERROR');
    
    await this.auditService.log({
      userId: transaction.userId,
      action: 'UPDATE',
      resource: 'TRANSACTION',
      resourceId: input.transactionId,
      metadata: { 
        action: 'ai_processing_failed', 
        totalAttempts: attempts,
        error: lastError?.message,
      },
    });

    throw new AIProcessingError(
      `AI processing failed after ${attempts} attempts: ${lastError?.message}`,
      input.transactionId,
      attempts,
      false,
      lastError
    );
  }
}
