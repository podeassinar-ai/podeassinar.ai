import { inngest } from './client';
import { getSupabaseServiceClient } from '@infrastructure/database/supabase-client';
import {
  SupabaseDiagnosisRepository,
  SupabaseTransactionRepository,
} from '@infrastructure/repositories';
import { SupabaseDocumentRepository } from '@infrastructure/repositories/supabase-document-repository';
import { OpenAIService } from '@infrastructure/services/openai-service';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabaseStorageService } from '@infrastructure/services/supabase-storage-service';
import { PythonDocumentExtractor } from '@infrastructure/services/extraction';
import { GenerateAIDiagnosisUseCase } from '@application/use-cases/generate-ai-diagnosis';
import { ExtractDocumentTextUseCase } from '@application/use-cases/extract-document-text';

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

    return result;
  }
);

export const inngestFunctions = [extractDocumentText, generateDiagnosis];

