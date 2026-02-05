'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import { SupabaseDocumentRepository } from '@infrastructure/repositories';
import { createDocument } from '@domain/entities/document';
import { v4 as uuidv4 } from 'uuid';

export async function saveDocumentRecordAction(transactionId: string, fileData: {
  name: string;
  size: number;
  type: string;
  path: string;
}) {
  const supabase = await createClient();
  const repo = new SupabaseDocumentRepository(supabase);

  const document = createDocument({
    id: uuidv4(),
    transactionId,
    type: 'OUTROS', // Default, needs refinement in UI
    fileName: fileData.name,
    mimeType: fileData.type,
    fileSize: fileData.size,
    storageRef: fileData.path,
    legalBasis: 'CONTRACT_EXECUTION', // Corrected default legal basis
  });

  await repo.create(document);
  return document;
}

export async function getUserDocumentsAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // RLS ensures we only see our own documents (via transaction ownership)
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      transactions (
        property_address
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }

  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.file_name,
    type: doc.type,
    storageRef: doc.storage_ref,
    transactionAddress: doc.transactions?.property_address || 'Endereço não encontrado',
    uploadedAt: doc.created_at,
    expiresAt: doc.expires_at,
    status: doc.status,
  }));
}

export async function getDocumentDownloadUrlAction(documentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch the document (RLS ensures ownership through transaction)
  const { data: doc, error } = await supabase
    .from('documents')
    .select('storage_ref, file_name')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    throw new Error('Document not found or access denied');
  }

  // Generate signed URL (1 hour expiry)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_ref, 3600);

  if (urlError || !urlData) {
    throw new Error('Failed to generate download URL');
  }

  return {
    url: urlData.signedUrl,
    fileName: doc.file_name,
  };
}