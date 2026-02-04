import { inngest } from './client';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';
import {
  SupabaseDiagnosisRepository,
  SupabaseTransactionRepository,
  SupabaseUserRepository,
  SupabaseNotificationRepository,
} from '@infrastructure/repositories';
import { SupabaseDocumentRepository } from '@infrastructure/repositories/supabase-document-repository';
import { OpenAIService } from '@infrastructure/services/openai-service';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabaseStorageService } from '@infrastructure/services/supabase-storage-service';
import { ResendEmailService } from '@infrastructure/services/email-service';
import { PythonDocumentExtractor } from '@infrastructure/services/extraction';
import { GenerateAIDiagnosisUseCase } from '@application/use-cases/generate-ai-diagnosis';
import { ExtractDocumentTextUseCase } from '@application/use-cases/extract-document-text';
import { NotificationDispatcher } from '@application/services/notification-dispatcher';

class QuestionnaireRepository {
  constructor(private supabase: ReturnType<typeof getSupabaseServiceClient>) { }

  async findByTransactionId(transactionId: string) {
    const { data, error } = await this.supabase
      .from('questionnaires')
      .select()
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find questionnaire: ${error.message}`);
    }
    return {
      id: data.id,
      transactionId: data.transaction_id,
      answers: data.answers ?? [],
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const extractDocumentText = inngest.createFunction(
  {
    id: 'extract-document-text',
    retries: 2,
  },
  { event: 'document/extraction-requested' },
  async ({ event, step }) => {
    const { documentId, userId } = event.data;

    const result = await step.run('extract-text', async () => {
      const supabase = getSupabaseServiceClient();

      const documentRepo = new SupabaseDocumentRepository(supabase);
      const storageService = new SupabaseStorageService();
      const documentExtractor = new PythonDocumentExtractor();
      const auditService = new SupabaseAuditService();

      const useCase = new ExtractDocumentTextUseCase(
        documentRepo,
        storageService,
        documentExtractor,
        auditService
      );

      const extractionResult = await useCase.execute({ documentId, userId });
      return {
        documentId: extractionResult.document.id,
        success: extractionResult.success,
        textLength: extractionResult.extractedText.length,
        error: extractionResult.error,
      };
    });

    return result;
  }
);

export const extractAllDocuments = inngest.createFunction(
  {
    id: 'extract-all-documents',
    retries: 1,
  },
  { event: 'documents/extraction-batch-requested' },
  async ({ event, step }) => {
    const { transactionId, userId } = event.data;

    // Step 1: Get all documents for this transaction
    const documents = await step.run('fetch-documents', async () => {
      const supabase = getSupabaseServiceClient();
      const documentRepo = new SupabaseDocumentRepository(supabase);
      return documentRepo.findByTransactionId(transactionId);
    });

    // Step 2: Extract each document (sequentially to avoid overwhelming resources)
    const results: Array<{ documentId: string; success: boolean; error?: string }> = [];

    for (const doc of documents) {
      // Skip if already extracted
      if (doc.extractedData && typeof doc.extractedData.text === 'string') {
        results.push({ documentId: doc.id, success: true });
        continue;
      }

      const extractionResult = await step.run(`extract-doc-${doc.id}`, async () => {
        const supabase = getSupabaseServiceClient();
        const documentRepo = new SupabaseDocumentRepository(supabase);
        const storageService = new SupabaseStorageService();
        const documentExtractor = new PythonDocumentExtractor();
        const auditService = new SupabaseAuditService();

        const useCase = new ExtractDocumentTextUseCase(
          documentRepo,
          storageService,
          documentExtractor,
          auditService
        );

        try {
          const result = await useCase.execute({ documentId: doc.id, userId });
          return { documentId: doc.id, success: result.success, error: result.error };
        } catch (err: any) {
          return { documentId: doc.id, success: false, error: err.message };
        }
      });

      results.push(extractionResult);
    }

    // Step 3: Trigger the AI diagnosis generation
    await step.sendEvent('trigger-diagnosis', {
      name: 'diagnosis/generate-requested',
      data: {
        userId,
        transactionId,
      },
    });

    return {
      transactionId,
      documentsProcessed: results.length,
      results,
    };
  }
);

export const generateDiagnosis = inngest.createFunction(
  {
    id: 'generate-ai-diagnosis',
    retries: 3,
  },
  { event: 'diagnosis/generate-requested' },
  async ({ event, step }) => {
    const { userId, transactionId } = event.data;

    const result = await step.run('process-diagnosis', async () => {
      const supabase = getSupabaseServiceClient();

      const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
      const questionnaireRepo = new QuestionnaireRepository(supabase);
      const documentRepo = new SupabaseDocumentRepository(supabase);
      const transactionRepo = new SupabaseTransactionRepository(supabase);
      const aiService = new OpenAIService();
      const storageService = new SupabaseStorageService();
      const auditService = new SupabaseAuditService();

      const useCase = new GenerateAIDiagnosisUseCase(
        diagnosisRepo,
        questionnaireRepo as any,
        documentRepo,
        transactionRepo,
        aiService,
        storageService,
        auditService,
        {
          maxRetries: 3,
          retryDelayMs: 2000,
          maxRetryDelayMs: 30000,
        }
      );

      const diagnosis = await useCase.execute({ userId, transactionId });
      return { diagnosisId: diagnosis.id, status: diagnosis.status };
    });

    // Step 2: Notify admins/lawyers that a new diagnosis is ready for review
    await step.run('notify-admins', async () => {
      const supabase = getSupabaseServiceClient();
      const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
      const transactionRepo = new SupabaseTransactionRepository(supabase);
      const userRepo = new SupabaseUserRepository(supabase);
      const notificationRepo = new SupabaseNotificationRepository(supabase);
      const emailService = new ResendEmailService();
      const auditService = new SupabaseAuditService();

      const diagnosis = await diagnosisRepo.findByTransactionId(transactionId);
      const transaction = await transactionRepo.findById(transactionId);
      const customer = await userRepo.findById(userId);

      if (diagnosis && transaction && customer) {
        const dispatcher = new NotificationDispatcher(
          notificationRepo,
          userRepo,
          emailService,
          auditService
        );

        await dispatcher.onDiagnosisGenerated(diagnosis, transaction, customer);
      }
    });

    return result;
  }
);

export const inngestFunctions = [extractDocumentText, extractAllDocuments, generateDiagnosis];


