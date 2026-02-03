import { Document } from '@domain/entities/document';
import { IDocumentRepository } from '@domain/interfaces/document-repository';
import { IStorageService } from '@domain/interfaces/storage-service';
import { IDocumentExtractor } from '@domain/interfaces/document-extractor';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface ExtractDocumentTextInput {
    documentId: string;
    userId: string;
}

export interface ExtractDocumentTextOutput {
    document: Document;
    extractedText: string;
    success: boolean;
    error?: string;
}

export class ExtractDocumentTextUseCase {
    constructor(
        private documentRepository: IDocumentRepository,
        private storageService: IStorageService,
        private documentExtractor: IDocumentExtractor,
        private auditService: IAuditService
    ) { }

    async execute(input: ExtractDocumentTextInput): Promise<ExtractDocumentTextOutput> {
        const document = await this.documentRepository.findById(input.documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        // Update status to processing
        await this.documentRepository.updateStatus(input.documentId, 'PROCESSING');

        await this.auditService.log({
            userId: input.userId,
            action: 'UPDATE',
            resource: 'DOCUMENT',
            resourceId: input.documentId,
            metadata: { action: 'extraction_started' },
        });

        try {
            // Download file content from storage
            const fileContent = await this.storageService.download(document.storageRef);

            // Check if MIME type is supported
            if (!this.documentExtractor.isSupported(document.mimeType)) {
                await this.auditService.log({
                    userId: input.userId,
                    action: 'UPDATE',
                    resource: 'DOCUMENT',
                    resourceId: input.documentId,
                    metadata: {
                        action: 'extraction_skipped',
                        reason: 'unsupported_mime_type',
                        mimeType: document.mimeType
                    },
                });

                return {
                    document,
                    extractedText: '',
                    success: false,
                    error: `Unsupported file type: ${document.mimeType}`,
                };
            }

            // Extract text using the deterministic extractor
            const extractionResult = await this.documentExtractor.extract(
                fileContent,
                document.mimeType
            );

            if (!extractionResult.success) {
                await this.auditService.log({
                    userId: input.userId,
                    action: 'UPDATE',
                    resource: 'DOCUMENT',
                    resourceId: input.documentId,
                    metadata: {
                        action: 'extraction_failed',
                        error: extractionResult.error
                    },
                });

                return {
                    document,
                    extractedText: '',
                    success: false,
                    error: extractionResult.error,
                };
            }

            // Prepare extracted data for storage
            const extractedData: Record<string, unknown> = {
                text: extractionResult.text,
                tables: extractionResult.tables,
                metadata: extractionResult.metadata,
            };

            // Update document with extracted data
            const updatedDocument = await this.documentRepository.updateExtractedData(
                input.documentId,
                extractedData
            );

            // Mark as validated
            await this.documentRepository.updateStatus(input.documentId, 'VALIDATED');

            await this.auditService.log({
                userId: input.userId,
                action: 'UPDATE',
                resource: 'DOCUMENT',
                resourceId: input.documentId,
                metadata: {
                    action: 'extraction_completed',
                    usedOcr: extractionResult.metadata.usedOcr,
                    textLength: extractionResult.text.length,
                    tableCount: extractionResult.tables.length,
                },
            });

            return {
                document: updatedDocument,
                extractedText: extractionResult.text,
                success: true,
            };
        } catch (error: any) {
            // Revert status on error
            await this.documentRepository.updateStatus(input.documentId, 'UPLOADED');

            await this.auditService.log({
                userId: input.userId,
                action: 'UPDATE',
                resource: 'DOCUMENT',
                resourceId: input.documentId,
                metadata: {
                    action: 'extraction_error',
                    error: error.message
                },
            });

            throw error;
        }
    }
}
