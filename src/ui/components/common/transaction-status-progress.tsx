import React from 'react';
import type { TransactionStatus } from '@domain/entities/transaction';

const progressSteps: Array<{ key: TransactionStatus; label: string }> = [
  { key: 'PENDING_PAYMENT', label: 'Pagamento' },
  { key: 'PROCESSING', label: 'Análise IA' },
  { key: 'PENDING_REVIEW', label: 'Revisão Humana' },
  { key: 'COMPLETED', label: 'Concluído' },
];

const progressIndex: Partial<Record<TransactionStatus, number>> = {
  PENDING_QUESTIONNAIRE: 0,
  PENDING_DOCUMENTS: 0,
  PENDING_PAYMENT: 0,
  PROCESSING: 1,
  PENDING_REVIEW: 2,
  COMPLETED: 3,
};

interface TransactionStatusProgressProps {
  status: TransactionStatus;
  compact?: boolean;
}

export function TransactionStatusProgress({
  status,
  compact = false,
}: TransactionStatusProgressProps) {
  if (status === 'CANCELLED' || status === 'ERROR') {
    return null;
  }

  const currentIndex = progressIndex[status] ?? 0;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {progressSteps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono transition-colors',
                  isCompleted ? 'bg-green-500 text-white' : '',
                  isCurrent ? 'bg-primary text-white' : '',
                  !isCompleted && !isCurrent ? 'bg-gray-100 text-gray-500' : '',
                ].join(' ')}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className={isCurrent ? 'text-primary font-semibold' : 'text-text-muted'}>
                {step.label}
              </span>
            </div>
            {index < progressSteps.length - 1 && (
              <div className={`h-px flex-1 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
