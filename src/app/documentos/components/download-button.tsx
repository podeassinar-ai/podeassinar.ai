'use client';

import { useState } from 'react';
import { getDocumentDownloadUrlAction } from '@app/actions/document-actions';

interface DownloadButtonProps {
    documentId: string;
}

export function DownloadButton({ documentId }: DownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const { url, fileName } = await getDocumentDownloadUrlAction(documentId);

            // Create a temporary link and click it to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Falha ao baixar o documento. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="text-primary hover:text-primary-hover disabled:opacity-50 disabled:cursor-wait"
        >
            {isLoading ? 'Baixando...' : 'Download'}
        </button>
    );
}
