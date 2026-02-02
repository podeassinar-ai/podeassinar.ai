'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import { SupabaseTransactionRepository } from '@infrastructure/repositories';
import { createTransaction } from '@domain/entities/transaction';
import { v4 as uuidv4 } from 'uuid';

export async function createTransactionAction(type: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const repo = new SupabaseTransactionRepository(supabase);

  const transaction = createTransaction({
    id: uuidv4(),
    userId: user.id,
    type: type as any,
    propertyAddress: data.propertyAddress,
    registryNumber: data.registryNumber,
    registryOffice: data.registryOffice,
    propertyType: data.propertyType,
    propertyValue: data.propertyValue,
    hasMatricula: data.hasMatricula,
    matriculaOption: data.matriculaOption,
    additionalInfo: data.additionalInfo,
  });

  await repo.create(transaction);
  return transaction;
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