import { Card, Alert, FileUploader } from '@ui/components/common';
import type { FailedFile } from '../types';

interface StepFileUploadProps {
    uploadedFiles: File[];
    failedFiles: FailedFile[];
    handleFilesUpload: (files: File[], documentType?: string) => Promise<void>;
    removeFile: (index: number) => void;
    onRetry: (index: number) => Promise<void>;
    onDismiss: (index: number) => void;
}

export function StepFileUpload({
    uploadedFiles,
    failedFiles,
    handleFilesUpload,
    removeFile,
    onRetry,
    onDismiss,
}: StepFileUploadProps) {
    return (
        <Card title="Upload de Documentos" description="Ambiente seguro e criptografado">
            <div className="space-y-6">
                <Alert variant="info">
                    Seus documentos são protegidos por criptografia ponta-a-ponta e processados pela nossa IA de forma confidencial.
                </Alert>

                <div className="grid gap-6">
                    <FileUploader
                        label="Certidão de Matrícula"
                        onUpload={(files) => handleFilesUpload(files, 'MATRICULA')}
                        accept=".pdf,.jpg,.jpeg,.png"
                        hint="Envie o PDF ou fotos legíveis de todas as páginas"
                    />

                    <FileUploader
                        label="IPTU (Opcional)"
                        onUpload={(files) => handleFilesUpload(files, 'IPTU')}
                        accept=".pdf,.jpg,.jpeg,.png"
                        hint="Capa do carnê ou certidão negativa de débitos"
                    />

                    <FileUploader
                        label="Outros Documentos"
                        onUpload={(files) => handleFilesUpload(files, 'OUTROS')}
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        hint="Contratos, escrituras anteriores, etc."
                    />
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="bg-gray-50 rounded border border-border p-4">
                        <h4 className="text-sm font-medium text-text-primary mb-3 font-mono uppercase">Arquivos Selecionados</h4>
                        <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary truncate max-w-[200px] font-mono text-xs">{file.name}</p>
                                            <p className="text-[10px] text-text-muted font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        aria-label={`Remover arquivo ${file.name}`}
                                        className="p-1 text-gray-400 hover:text-error transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {failedFiles.length > 0 && (
                    <div className="bg-red-50 rounded border border-red-200 p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-3 font-mono uppercase">Falhas no Envio</h4>
                        <div className="space-y-2">
                            {failedFiles.map((failedFile, index) => (
                                <div
                                    key={`${failedFile.file.name}-${index}`}
                                    className="flex flex-col gap-3 rounded border border-red-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-red-700">{failedFile.file.name}</p>
                                        <p className="text-xs text-red-600 mt-1">{failedFile.error}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onRetry(index)}
                                            aria-label={`Tentar novamente o arquivo ${failedFile.file.name}`}
                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-700 hover:bg-red-100 transition-colors"
                                        >
                                            Tentar novamente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDismiss(index)}
                                            className="px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-100 transition-colors"
                                            aria-label={`Descartar falha de ${failedFile.file.name}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
