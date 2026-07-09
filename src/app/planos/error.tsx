'use client';

import { useEffect } from 'react';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { ErrorState } from '@ui/components/common';

export default function PlanosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Planos route error:', error);
  }, [error]);

  return (
    <>
      <Topbar />
      <MainContainer title="Erro ao carregar planos" subtitle="">
        <ErrorState
          title="Não foi possível carregar os planos"
          message="Ocorreu um erro ao buscar os planos disponíveis. Isso é diferente de não haver planos — tente novamente em instantes."
          onRetry={reset}
          secondaryHref="/"
          secondaryLabel="Voltar ao início"
        />
      </MainContainer>
    </>
  );
}
