import { MainContainer } from '@ui/components/layout/main-container';
import { PageLoadingState } from '@ui/components/common';

export default function Loading() {
  return (
    <MainContainer
      title="Minhas Análises"
      subtitle="Carregando histórico..."
      breadcrumbs={[
        { label: 'Início', href: '/' },
        { label: 'Minhas Análises' },
      ]}
    >
      <PageLoadingState title="Minhas Análises" subtitle="Carregando histórico..." />
    </MainContainer>
  );
}
