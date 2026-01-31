import { Document, DocumentType, DocumentStatus } from '../entities/document';

export interface IDocumentRepository {
  create(document: Document): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findByTransactionId(transactionId: string): Promise<Document[]>;
  findByType(transactionId: string, type: DocumentType): Promise<Document | null>;
  updateStatus(id: string, status: DocumentStatus): Promise<Document>;
  updateExtractedData(id: string, data: Record<string, unknown>): Promise<Document>;
  delete(id: string): Promise<void>;
  findExpired(): Promise<Document[]>;
  deleteExpired(): Promise<number>;
}
