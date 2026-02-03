/**
 * Interface for document text extraction.
 * Implementations should use deterministic libraries (OCR, PDF parsers)
 * to extract text content from various file formats.
 */

export interface ExtractionMetadata {
    /** Number of pages extracted (for PDFs) */
    pageCount?: number;
    /** Whether OCR was used for extraction */
    usedOcr: boolean;
    /** Original file mime type */
    mimeType: string;
    /** Extraction timestamp */
    extractedAt: Date;
    /** Confidence score for OCR-based extractions (0-1) */
    ocrConfidence?: number;
    /** Any warnings encountered during extraction */
    warnings?: string[];
}

export interface ExtractionResult {
    /** Extracted text content, normalized to Markdown format */
    text: string;
    /** Structured tables extracted from the document */
    tables: Array<{
        /** Table title or header if identifiable */
        title?: string;
        /** Table data as 2D array of strings */
        data: string[][];
    }>;
    /** Metadata about the extraction process */
    metadata: ExtractionMetadata;
    /** Whether extraction was successful */
    success: boolean;
    /** Error message if extraction failed */
    error?: string;
}

export interface IDocumentExtractor {
    /**
     * Extract text and tables from a document.
     * @param content - The raw file content as a Buffer
     * @param mimeType - The MIME type of the file (e.g., 'application/pdf', 'image/png')
     * @returns ExtractionResult containing text, tables, and metadata
     */
    extract(content: Buffer, mimeType: string): Promise<ExtractionResult>;

    /**
     * Check if a given MIME type is supported by this extractor.
     * @param mimeType - The MIME type to check
     * @returns true if the format is supported
     */
    isSupported(mimeType: string): boolean;

    /**
     * Get the list of supported MIME types.
     * @returns Array of supported MIME type strings
     */
    getSupportedMimeTypes(): string[];
}
