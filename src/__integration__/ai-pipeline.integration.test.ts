/**
 * End-to-end integration test for the AI diagnosis pipeline against the LOCAL
 * Supabase stack and the LIVE OpenAI API.
 *
 * Gated behind RUN_INTEGRATION=1 so the normal (hermetic) `pnpm test` never
 * makes network calls. Requires:
 *   - `supabase start` running (local stack)
 *   - OPENAI_API_KEY in the environment / .env.local
 *
 * Run with:
 *   RUN_INTEGRATION=1 pnpm vitest run src/__integration__/ai-pipeline.integration.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { GenerateAIDiagnosisUseCase } from '@application/use-cases/generate-ai-diagnosis';
import { OpenAIService } from '@infrastructure/services/openai-service';
import {
  SupabaseDiagnosisRepository,
  SupabaseTransactionRepository,
  SupabaseDocumentRepository,
} from '@infrastructure/repositories';
import { SupabaseQuestionnaireRepository } from '@infrastructure/repositories/supabase-questionnaire-repository';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { SupabaseStorageService } from '@infrastructure/services/supabase-storage-service';
import { createDiagnosis } from '@domain/entities/diagnosis';
import { v4 as uuidv4 } from 'uuid';

const RUN = process.env.RUN_INTEGRATION === '1';

// Load .env.local so the test picks up local Supabase + OpenAI creds.
function loadEnvLocal() {
  try {
    const content = readFileSync(`${process.cwd()}/.env.local`, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* ignore */
  }
}

(RUN ? describe : describe.skip)('AI diagnosis pipeline (integration)', () => {
  let serviceClient: ReturnType<typeof createClient>;
  const CLIENT_EMAIL = 'client@pode.test';
  let userId: string;

  beforeAll(async () => {
    loadEnvLocal();
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await (serviceClient as any)
      .from('users')
      .select('id')
      .eq('email', CLIENT_EMAIL)
      .single();
    userId = (data as any)?.id;
    expect(userId, `seed user ${CLIENT_EMAIL} must exist (run scripts/bootstrap-local.sh)`).toBeTruthy();
  });

  it('generates and persists a real AI diagnosis from questionnaire + document text', async () => {
    const transactionRepo = new SupabaseTransactionRepository(serviceClient as any);
    const diagnosisRepo = new SupabaseDiagnosisRepository(serviceClient as any);
    const questionnaireRepo = new SupabaseQuestionnaireRepository(serviceClient as any);
    const documentRepo = new SupabaseDocumentRepository(serviceClient as any);

    // 1. Seed a transaction in PROCESSING (the state the pipeline expects).
    // The client is untyped (no generated Database types), so cast for inserts.
    const db = serviceClient as any;
    const txId = uuidv4();
    await db.from('transactions').insert({
      id: txId,
      user_id: userId,
      type: 'PURCHASE',
      status: 'PROCESSING',
      property_address: 'Av. Paulista 1000, São Paulo/SP',
      property_type: 'Apartamento',
      property_value: '850000',
      has_matricula: 'sim',
    });

    // 2. Seed a questionnaire + a document with already-extracted text.
    await db.from('questionnaires').insert({
      transaction_id: txId,
      answers: [
        { questionId: 'ownership', value: 'Vendedor é o único proprietário' },
        { questionId: 'debts', value: 'Existe um IPTU atrasado de 2023' },
      ],
      completed_at: new Date().toISOString(),
    });
    await db.from('documents').insert({
      id: uuidv4(),
      transaction_id: txId,
      type: 'MATRICULA',
      status: 'VALIDATED',
      storage_ref: `transactions/${txId}/matricula.pdf`,
      file_name: 'matricula.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
      legal_basis: 'CONSENT',
      expires_at: new Date(Date.now() + 30 * 864e5).toISOString(),
      extracted_data: {
        text:
          'MATRÍCULA 12345. Imóvel: Apartamento 101. Proprietário: João Silva. ' +
          'Ônus: hipoteca em favor do Banco XYZ registrada em 2020. ' +
          'Averbação: penhora judicial processo 001/2023.',
      },
    });

    // 3. Diagnosis row must exist before the use case runs (created post-payment).
    await diagnosisRepo.create(createDiagnosis({ id: uuidv4(), transactionId: txId }));

    // 4. Run the REAL use case with the LIVE OpenAI service.
    const useCase = new GenerateAIDiagnosisUseCase(
      diagnosisRepo,
      questionnaireRepo,
      documentRepo,
      transactionRepo,
      new OpenAIService(),
      new SupabaseStorageService(),
      new SupabaseAuditService(),
      { maxRetries: 2, retryDelayMs: 1000, maxRetryDelayMs: 5000 }
    );

    const diagnosis = await useCase.execute({ userId, transactionId: txId });

    // 5. Assert a real, structured diagnosis was produced and persisted.
    expect(diagnosis.status).toBe('AI_GENERATED');
    expect(diagnosis.summary.length).toBeGreaterThan(20);
    expect(Array.isArray(diagnosis.risks)).toBe(true);
    expect(diagnosis.risks.length).toBeGreaterThan(0);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(diagnosis.risks[0].level);
    expect(diagnosis.aiConfidence).toBeGreaterThan(0);

    // 6. Transaction advanced to PENDING_REVIEW (human-in-the-loop).
    const tx = await transactionRepo.findById(txId);
    expect(tx?.status).toBe('PENDING_REVIEW');

    // Cleanup.
    await db.from('transactions').delete().eq('id', txId);
  }, 60_000);
});
