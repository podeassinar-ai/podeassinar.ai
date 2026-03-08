import { MainContainer } from '@ui/components/layout/main-container';
import { PageLoadingState } from '@ui/components/common';

export default function Loading() {
  return (
    <MainContainer
      title="Documentos"
      subtitle="Carregando documentos..."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Documentos' },
      ]}
    >
      <PageLoadingState title="Documentos" subtitle="Carregando documentos..." items={4} />
    </MainContainer>
  );
}
