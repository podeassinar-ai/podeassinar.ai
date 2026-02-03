import { Card, Alert, FileUploader } from '@ui/components/common';

interface StepFileUploadProps {
    uploadedFiles: File[];
    handleFilesUpload: (files: File[]) => Promise<void>;
    removeFile: (index: number) => void;
}

export function StepFileUpload({ uploadedFiles, handleFilesUpload, removeFile }: StepFileUploadProps) {
    return (
        <Card title="Upload de Documentos" description="Ambiente seguro e criptografado">
            <div className="space-y-6">
                <Alert variant="info">
                    Seus documentos são protegidos por criptografia ponta-a-ponta e processados pela nossa IA de forma confidencial.
                </Alert>

                <div className="grid gap-6">
                    <FileUploader
                        label="Certidão de Matrícula"
                        onUpload={handleFilesUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        hint="Envie o PDF ou fotos legíveis de todas as páginas"
                    />

                    <FileUploader
                        label="IPTU (Opcional)"
                        onUpload={handleFilesUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        hint="Capa do carnê ou certidão negativa de débitos"
                    />

                    <FileUploader
                        label="Outros Documentos"
                        onUpload={handleFilesUpload}
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
            </div>
        </Card>
    );
}
