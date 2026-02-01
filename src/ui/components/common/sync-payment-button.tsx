'use client';

import { useState, useTransition } from 'react';
import { Button } from './button';
import { syncPaymentByTransactionAction } from '@/app/actions/payment-actions';

interface SyncPaymentButtonProps {
  transactionId: string;
  status: string;
}

export function SyncPaymentButton({ transactionId, status }: SyncPaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (status !== 'PENDING_PAYMENT') {
    return null;
  }

  const handleSync = () => {
    setSyncResult(null);
    startTransition(async () => {
      try {
        const result = await syncPaymentByTransactionAction(transactionId);
        if (result.synced) {
          setSyncResult('Status atualizado!');
        } else {
          setSyncResult('Nenhuma mudança detectada');
        }
      } catch (error: any) {
        setSyncResult('Erro ao sincronizar');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSync}
        disabled={isPending}
        className="text-xs"
      >
        {isPending ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verificando...
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </span>
        )}
      </Button>
      {syncResult && (
        <span className="text-xs text-text-muted">{syncResult}</span>
      )}
    </div>
  );
}
