'use server';

import { getSupabaseClient } from '@infrastructure/database/supabase-client';
import { SupabaseTransactionRepository } from '@infrastructure/repositories';
import { createTransaction } from '@domain/entities/transaction';
import { v4 as uuidv4 } from 'uuid';

export async function createTransactionAction(type: string, data: any) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const repo = new SupabaseTransactionRepository(supabase);
  
  const transaction = createTransaction({
    id: uuidv4(),
    userId: user.id,
    type: type as any,
  });

  // Update with initial data
  if (data.propertyAddress) transaction.propertyAddress = data.propertyAddress;
  if (data.registryNumber) transaction.registryNumber = data.registryNumber;
  if (data.registryOffice) transaction.registryOffice = data.registryOffice;

  await repo.create(transaction);
  return transaction;
}

export async function updateTransactionAction(id: string, data: any) {
  const supabase = getSupabaseClient();
  const repo = new SupabaseTransactionRepository(supabase);
  
  const transaction = await repo.findById(id);
  if (!transaction) throw new Error('Transaction not found');

  // Update fields
  if (data.propertyAddress) transaction.propertyAddress = data.propertyAddress;
  // ... map other fields

  await repo.update(transaction);
  return transaction;
}