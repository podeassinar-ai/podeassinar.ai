'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import {
  SupabaseTransactionRepository,
  SupabaseDiagnosisRepository,
  SupabaseQuestionnaireRepository
} from '@infrastructure/repositories';
import { CreateDiagnosticTransactionUseCase } from '@application/use-cases/create-diagnostic-transaction';
import { SupabaseAuditService } from '@infrastructure/services/supabase-audit-service';
import { TransactionType } from '@domain/entities/transaction';

export async function createTransactionAction(type: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const transactionRepo = new SupabaseTransactionRepository(supabase);
  const questionnaireRepo = new SupabaseQuestionnaireRepository(supabase);
  const diagnosisRepo = new SupabaseDiagnosisRepository(supabase);
  const auditService = new SupabaseAuditService();

  const useCase = new CreateDiagnosticTransactionUseCase(
    transactionRepo,
    questionnaireRepo,
    diagnosisRepo,
    auditService
  );

  const result = await useCase.execute({
    userId: user.id,
    type: type as TransactionType,
    propertyAddress: data.propertyAddress,
    registryNumber: data.registryNumber,
    registryOffice: data.registryOffice,
  });

  return result.transaction;
}

export async function updateTransactionAction(id: string, data: any) {
  const supabase = await createClient();
  const repo = new SupabaseTransactionRepository(supabase);

  const transaction = await repo.findById(id);
  if (!transaction) throw new Error('Transaction not found');

  // Update all fields from form data
  if (data.propertyAddress !== undefined) transaction.propertyAddress = data.propertyAddress;
  if (data.registryNumber !== undefined) transaction.registryNumber = data.registryNumber;
  if (data.registryOffice !== undefined) transaction.registryOffice = data.registryOffice;
  if (data.propertyType !== undefined) transaction.propertyType = data.propertyType;
  if (data.propertyValue !== undefined) transaction.propertyValue = data.propertyValue;
  if (data.hasMatricula !== undefined) transaction.hasMatricula = data.hasMatricula;
  if (data.matriculaOption !== undefined) transaction.matriculaOption = data.matriculaOption;
  if (data.additionalInfo !== undefined) transaction.additionalInfo = data.additionalInfo;

  await repo.update(transaction);
  return transaction;
}