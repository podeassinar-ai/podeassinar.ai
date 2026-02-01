import {
  Document,
  DocumentType,
  DocumentStatus,
  LegalBasis,
} from '@domain/entities/document';
import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface DocumentRow {
  id: string;
  transaction_id: string;
  type: DocumentType;
  status: DocumentStatus;
  storage_ref: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  legal_basis: LegalBasis;
  expires_at: string;
  extracted_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

function toEntity(row: DocumentRow): Document {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    type: row.type,
    status: row.status,
    storageRef: row.storage_ref,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    legalBasis: row.legal_basis,
    expiresAt: new Date(row.expires_at),
    extractedData: row.extracted_data ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(entity: Document): Omit<DocumentRow, 'created_at' | 'updated_at'> {
  return {
    id: entity.id,
    transaction_id: entity.transactionId,
    type: entity.type,
    status: entity.status,
    storage_ref: entity.storageRef,
    file_name: entity.fileName,
    mime_type: entity.mimeType,
    file_size: entity.fileSize,
    legal_basis: entity.legalBasis,
    expires_at: entity.expiresAt.toISOString(),
    extracted_data: entity.extractedData ?? null,
  };
}

export class SupabaseDocumentRepository implements IDocumentRepository {
  private tableName = 'documents';

  constructor(private supabase: SupabaseClient) {}

  async create(document: Document): Promise<Document> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(document))
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return toEntity(data);
  }

  async findById(id: string): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find document: ${error.message}`);
    }
    return toEntity(data);
  }

  async findByTransactionId(transactionId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('transaction_id', transactionId);

    if (error) throw new Error(`Failed to find documents: ${error.message}`);
    return data.map(toEntity);
  }

  async findByType(transactionId: string, type: DocumentType): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('transaction_id', transactionId)
      .eq('type', type)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find document by type: ${error.message}`);
    }
    return toEntity(data);
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<Document> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update document status: ${error.message}`);
    return toEntity(data);
  }

  async updateExtractedData(id: string, extractedData: Record<string, unknown>): Promise<Document> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ extracted_data: extractedData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update extracted data: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
  }

  async findExpired(): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .lt('expires_at', new Date().toISOString());

    if (error) throw new Error(`Failed to find expired documents: ${error.message}`);
    return data.map(toEntity);
  }

  async deleteExpired(): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) throw new Error(`Failed to delete expired documents: ${error.message}`);
    return data.length;
  }
}
