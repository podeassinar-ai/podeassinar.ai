import { LegalDiagnosis } from '@domain/entities/diagnosis';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { IQuestionnaireRepository } from '@domain/interfaces/questionnaire-repository';
import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IAIService, AIAnalysisInput } from '@domain/interfaces/ai-service';
import { IStorageService } from '@domain/interfaces/storage-service';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface GenerateAIDiagnosisInput {
  transactionId: string;
}

export class GenerateAIDiagnosisUseCase {
  constructor(
    private diagnosisRepository: IDiagnosisRepository,
    private questionnaireRepository: IQuestionnaireRepository,
    private documentRepository: IDocumentRepository,
    private transactionRepository: ITransactionRepository,
    private aiService: IAIService,
    private storageService: IStorageService,
    private auditService: IAuditService
  ) {}

  async execute(input: GenerateAIDiagnosisInput): Promise<LegalDiagnosis> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PROCESSING') {
      throw new Error('Transaction is not ready for AI processing');
    }

    const diagnosis = await this.diagnosisRepository.findByTransactionId(input.transactionId);
    if (!diagnosis) {
      throw new Error('Diagnosis not found');
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

    const aiResult = await this.aiService.analyzeForDiagnosis({
      questionnaire,
      documents,
      documentContents,
    });

    const updatedDiagnosis = await this.diagnosisRepository.updateContent(diagnosis.id, {
      propertyStatus: aiResult.propertyStatus,
      risks: aiResult.risks,
      pathways: aiResult.pathways,
      summary: aiResult.summary,
    });

    await this.diagnosisRepository.updateStatus(diagnosis.id, 'AI_GENERATED');
    await this.transactionRepository.updateStatus(input.transactionId, 'PENDING_REVIEW');

    await this.auditService.log({
      userId: transaction.userId,
      action: 'UPDATE',
      resource: 'DIAGNOSIS',
      resourceId: diagnosis.id,
      metadata: { action: 'ai_generated', confidence: aiResult.confidence },
    });

    return updatedDiagnosis;
  }
}
