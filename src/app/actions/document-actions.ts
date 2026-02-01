'use server';

import { getSupabaseClient } from '@infrastructure/database/supabase-client';
import { SupabaseDocumentRepository } from '@infrastructure/repositories';
import { createDocument } from '@domain/entities/document';
import { v4 as uuidv4 } from 'uuid';

export async function saveDocumentRecordAction(transactionId: string, fileData: {
  name: string;
  size: number;
  type: string;
  path: string;
}) {
  const supabase = getSupabaseClient();
  const repo = new SupabaseDocumentRepository(supabase);

  const document = createDocument({
    id: uuidv4(),
    transactionId,
    type: 'OUTROS', // Default, needs refinement in UI
    fileName: fileData.name,
    mimeType: fileData.type,
    fileSize: fileData.size,
    storageRef: fileData.path,
  });

  await repo.create(document);
  return document;
}