import { v4 as uuidv4 } from 'uuid';
import {
  Document,
  DocumentType,
  LegalBasis,
  createDocument,
} from '@domain/entities/document';
import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { ITransactionRepository } from '@domain/interfaces/transaction-repository';
import { IStorageService } from '@domain/interfaces/storage-service';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface UploadDocumentInput {
  userId: string;
  transactionId: string;
  type: DocumentType;
  file: Buffer;
  fileName: string;
  mimeType: string;
  legalBasis: LegalBasis;
}

export interface UploadDocumentOutput {
  document: Document;
  signedUrl: string;
}

export class UploadDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private transactionRepository: ITransactionRepository,
    private storageService: IStorageService,
    private auditService: IAuditService
  ) {}

  async execute(input: UploadDocumentInput): Promise<UploadDocumentOutput> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.userId !== input.userId) {
      throw new Error('Unauthorized access to transaction');
    }

    const existingDoc = await this.documentRepository.findByType(
      input.transactionId,
      input.type
    );
    if (existingDoc) {
      await this.storageService.delete(existingDoc.storageRef);
      await this.documentRepository.delete(existingDoc.id);
    }

    const folder = `transactions/${input.transactionId}/documents`;
    const uploadResult = await this.storageService.upload(
      input.file,
      input.fileName,
      input.mimeType,
      folder
    );

    const retentionDays = input.type === 'MATRICULA' || input.type === 'MATRICULA_ANTIGA' 
      ? 30 
      : 90;

    const document = createDocument({
      id: uuidv4(),
      transactionId: input.transactionId,
      type: input.type,
      storageRef: uploadResult.storageRef,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: uploadResult.fileSize,
      legalBasis: input.legalBasis,
      retentionDays,
    });

    const savedDocument = await this.documentRepository.create(document);

    const signedUrl = await this.storageService.getSignedUrl(uploadResult.storageRef);

    await this.auditService.log({
      userId: input.userId,
      action: 'CREATE',
      resource: 'DOCUMENT',
      resourceId: savedDocument.id,
      metadata: { type: input.type, transactionId: input.transactionId },
    });

    return {
      document: savedDocument,
      signedUrl,
    };
  }
}
