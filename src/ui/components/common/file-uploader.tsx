'use client';

import { useCallback, useState } from 'react';
import { Button } from './button';
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
    [disabled, multiple, validateFiles]
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
    [validateFiles]
  );

  const simulateUpload = (files: File[]) => {
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
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary-light/30' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
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
        
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-sm text-text-primary">
              Arraste arquivos aqui ou <span className="text-primary font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              {accept.replace(/\./g, '').toUpperCase().split(',').join(', ')} (máx. {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        </div>
      </div>

      {uploadProgress !== null && (
        <Progress value={uploadProgress} showLabel />
      )}

      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}
