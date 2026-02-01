'use client';

import { useTransactionStatus, useDiagnosisStatus } from '@ui/hooks/use-realtime';
import { TransactionStatus } from '@domain/entities/transaction';
import { DiagnosisStatus } from '@domain/entities/diagnosis';

const transactionStatusConfig: Record<TransactionStatus, { label: string; class: string }> = {
  PENDING_QUESTIONNAIRE: { label: 'Questionário Pendente', class: 'bg-gray-100 text-gray-800' },
  PENDING_DOCUMENTS: { label: 'Documentos Pendentes', class: 'bg-yellow-100 text-yellow-800' },
  PENDING_PAYMENT: { label: 'Aguardando Pagamento', class: 'bg-orange-100 text-orange-800' },
  PROCESSING: { label: 'Processando IA', class: 'bg-blue-100 text-blue-800 animate-pulse' },
  PENDING_REVIEW: { label: 'Em Revisão Humana', class: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
  ERROR: { label: 'Erro no Processamento', class: 'bg-red-100 text-red-800 border border-red-300' },
};

const diagnosisStatusConfig: Record<DiagnosisStatus, { label: string; class: string }> = {
  DRAFT: { label: 'Rascunho', class: 'bg-gray-100 text-gray-800' },
  AI_GENERATED: { label: 'Gerado pela IA', class: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'Em Revisão', class: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprovado', class: 'bg-green-100 text-green-800' },
  DELIVERED: { label: 'Entregue', class: 'bg-emerald-100 text-emerald-800' },
};

interface RealtimeStatusBadgeProps {
  transactionId: string;
  showDiagnosis?: boolean;
  size?: 'sm' | 'md';
}

export function RealtimeStatusBadge({ 
  transactionId, 
  showDiagnosis = false,
  size = 'md' 
}: RealtimeStatusBadgeProps) {
  const { status: txStatus, loading: txLoading } = useTransactionStatus(transactionId);
  const { diagnosis, loading: diagLoading } = useDiagnosisStatus(transactionId);

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  if (txLoading) {
    return (
      <span className={`inline-flex items-center rounded-full ${sizeClass} bg-gray-100 text-gray-500`}>
        <span className="animate-pulse">Carregando...</span>
      </span>
    );
  }

  if (!txStatus) {
    return null;
  }

  const txConfig = transactionStatusConfig[txStatus];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${txConfig.class}`}>
        {txConfig.label}
      </span>
      
      {showDiagnosis && !diagLoading && diagnosis && (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${diagnosisStatusConfig[diagnosis.status].class}`}>
          {diagnosisStatusConfig[diagnosis.status].label}
        </span>
      )}
    </div>
  );
}

interface StatusProgressProps {
  transactionId: string;
}

const progressSteps: { status: TransactionStatus; label: string }[] = [
  { status: 'PENDING_QUESTIONNAIRE', label: 'Questionário' },
  { status: 'PENDING_DOCUMENTS', label: 'Documentos' },
  { status: 'PENDING_PAYMENT', label: 'Pagamento' },
  { status: 'PROCESSING', label: 'Análise IA' },
  { status: 'PENDING_REVIEW', label: 'Revisão' },
  { status: 'COMPLETED', label: 'Concluído' },
];

const statusOrder: Record<TransactionStatus, number> = {
  PENDING_QUESTIONNAIRE: 0,
  PENDING_DOCUMENTS: 1,
  PENDING_PAYMENT: 2,
  PROCESSING: 3,
  PENDING_REVIEW: 4,
  COMPLETED: 5,
  CANCELLED: -1,
  ERROR: -2,
};

export function StatusProgress({ transactionId }: StatusProgressProps) {
  const { status, loading } = useTransactionStatus(transactionId);

  if (loading || !status) {
    return (
      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <div className="text-center py-2 text-red-600 font-medium">
        Transação Cancelada
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
        <svg className="mx-auto h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 font-medium">Erro no Processamento</p>
        <p className="text-red-500 text-sm mt-1">Nossa equipe foi notificada e está analisando o problema.</p>
      </div>
    );
  }

  const currentIndex = statusOrder[status];

  return (
    <div className="flex items-center justify-between">
      {progressSteps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < progressSteps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
