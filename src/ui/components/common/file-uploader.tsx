'use client';

import { useCallback, useState } from 'react';
import { Progress } from './progress';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUploader({
  onUpload,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  label = 'Enviar documento',
  hint,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);
      const validFiles: File[] = [];

      for (const file of files) {
        if (file.size > maxSize) {
          setError(`Arquivo ${file.name} excede o tamanho máximo de ${Math.round(maxSize / 1024 / 1024)}MB`);
          continue;
        }
        validFiles.push(file);
      }

      return validFiles;
    },
    [maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateUpload = useCallback(
    (files: File[]) => {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 0;
          if (prev >= 100) {
            clearInterval(interval);
            onUpload(files);
            setTimeout(() => setUploadProgress(null), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(multiple ? files : files.slice(0, 1));
      if (validFiles.length > 0) {
        simulateUpload(validFiles);
      }
    },
    [disabled, multiple, validateFiles, simulateUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        simulateUpload(validFiles);
      }
      e.target.value = '';
    },
    [validateFiles, simulateUpload]
  );

  return (
    <div className="space-y-2">
      {label && <p className="input-label">{label}</p>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border border-dashed rounded p-10 text-center transition-all duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || uploadProgress !== null}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-white border border-gray-100 rounded shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              Clique para selecionar ou arraste aqui
            </p>
            <p className="text-xs text-text-muted mt-1">
              Arquivos suportados: {accept.replace(/\./g, '').toUpperCase().split(',').join(', ')}
            </p>
          </div>
        </div>
      </div>

      {uploadProgress !== null && (
        <Progress value={uploadProgress} showLabel />
      )}

      {hint && !error && (
        <p className="input-hint">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}