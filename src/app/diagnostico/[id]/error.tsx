'use client';

import { useEffect } from 'react';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import Link from 'next/link';

export default function DiagnosisReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Diagnosis report route error:', error);
  }, [error]);

  return (
    <>
      <Topbar />
      <MainContainer title="Erro ao carregar relatório" subtitle="">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-7.938 4h15.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Não foi possível abrir este relatório</h3>
          <p className="text-text-secondary mb-6">
            Ocorreu um erro inesperado ao carregar os dados. Tente novamente ou volte para sua lista de diagnósticos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="primary" onClick={reset}>
              Tentar novamente
            </Button>
            <Link href="/meus-diagnosticos">
              <Button variant="secondary">Voltar para Meus Diagnósticos</Button>
            </Link>
          </div>
        </div>
      </MainContainer>
    </>
  );
}
