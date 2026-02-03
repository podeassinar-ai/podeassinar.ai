import { spawn } from 'child_process';
import path from 'path';
import {
    IDocumentExtractor,
    ExtractionResult,
    ExtractionMetadata,
} from '@domain/interfaces/document-extractor';

const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/tiff',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
];

interface PythonExtractionResult {
    success: boolean;
    text: string;
    tables: Array<{ title?: string; data: string[][] }>;
    metadata: {
        pageCount?: number;
        usedOcr: boolean;
        mimeType: string;
        extractedAt: string;
        ocrConfidence?: number;
        warnings?: string[];
    };
    error?: string;
}

export class PythonDocumentExtractor implements IDocumentExtractor {
    private scriptPath: string;
    private pythonPath: string;
    private timeoutMs: number;

    constructor(options?: { pythonPath?: string; timeoutMs?: number }) {
        this.scriptPath = path.resolve(
            __dirname,
            'scripts',
            'extractor.py'
        );
        this.pythonPath = options?.pythonPath ?? 'python3';
        this.timeoutMs = options?.timeoutMs ?? 60000; // 60 seconds default
    }

    async extract(content: Buffer, mimeType: string): Promise<ExtractionResult> {
        if (!this.isSupported(mimeType)) {
            return {
                success: false,
                error: `Unsupported MIME type: ${mimeType}`,
                text: '',
                tables: [],
                metadata: {
                    usedOcr: false,
                    mimeType,
                    extractedAt: new Date(),
                },
            };
        }

        const base64Content = content.toString('base64');

        return new Promise((resolve) => {
            const args = [
                this.scriptPath,
                '--input',
                base64Content,
                '--mime-type',
                mimeType,
            ];

            const child = spawn(this.pythonPath, args, {
                timeout: this.timeoutMs,
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python extractor stderr:', stderr);
                    resolve({
                        success: false,
                        error: `Extraction process exited with code ${code}: ${stderr}`,
                        text: '',
                        tables: [],
                        metadata: {
                            usedOcr: false,
                            mimeType,
                            extractedAt: new Date(),
                        },
                    });
                    return;
                }

                try {
                    const result: PythonExtractionResult = JSON.parse(stdout);

                    const metadata: ExtractionMetadata = {
                        pageCount: result.metadata.pageCount,
                        usedOcr: result.metadata.usedOcr,
                        mimeType: result.metadata.mimeType,
                        extractedAt: new Date(result.metadata.extractedAt),
                        ocrConfidence: result.metadata.ocrConfidence,
                        warnings: result.metadata.warnings,
                    };

                    resolve({
                        success: result.success,
                        text: result.text,
                        tables: result.tables,
                        metadata,
                        error: result.error,
                    });
                } catch (parseError: any) {
                    console.error('Failed to parse Python output:', stdout);
                    resolve({
                        success: false,
                        error: `Failed to parse extraction result: ${parseError.message}`,
                        text: '',
                        tables: [],
                        metadata: {
                            usedOcr: false,
                            mimeType,
                            extractedAt: new Date(),
                        },
                    });
                }
            });

            child.on('error', (err) => {
                console.error('Python process error:', err);
                resolve({
                    success: false,
                    error: `Python process error: ${err.message}`,
                    text: '',
                    tables: [],
                    metadata: {
                        usedOcr: false,
                        mimeType,
                        extractedAt: new Date(),
                    },
                });
            });
        });
    }

    isSupported(mimeType: string): boolean {
        return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
    }

    getSupportedMimeTypes(): string[] {
        return [...SUPPORTED_MIME_TYPES];
    }
}
