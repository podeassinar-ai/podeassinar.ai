'use client';

import { Document } from '@domain/entities/document';

interface DocumentViewerProps {
    documents: (Document & { signedUrl: string })[];
    activeDoc: (Document & { signedUrl: string }) | null;
    setActiveDoc: (doc: Document & { signedUrl: string }) => void;
}

export function DocumentViewer({ documents, activeDoc, setActiveDoc }: DocumentViewerProps) {
    const getDocTypeLabel = (type: string) => type;

    return (
        <div className="w-1/2 flex flex-col bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
            <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-white overflow-x-auto">
                {documents.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc)}
                        className={`
              px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors
              ${activeDoc?.id === doc.id
                                ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }
            `}
                    >
                        {getDocTypeLabel(doc.type) || doc.fileName}
                    </button>
                ))}
                {documents.length === 0 && (
                    <span className="p-3 text-sm text-slate-500">Nenhum documento anexado.</span>
                )}
            </div>

            <div className="flex-1 bg-slate-200 relative flex items-center justify-center p-4">
                {activeDoc ? (
                    activeDoc.mimeType === 'application/pdf' ? (
                        <iframe
                            src={activeDoc.signedUrl}
                            className="w-full h-full border-0 rounded-lg shadow-sm bg-white"
                            title="Document Viewer"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-white rounded-lg shadow-sm overflow-hidden">
                            <img src={activeDoc.signedUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                        </div>
                    )
                ) : (
                    <div className="text-slate-500 font-medium">
                        Selecione um documento pare visualizar
                    </div>
                )}
            </div>
        </div>
    );
}
