import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button, Alert } from '@ui/components/common';
import Link from 'next/link';

const mockDiagnosticos = [
  {
    id: '1',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    type: 'PURCHASE',
    status: 'COMPLETED',
    createdAt: '2025-01-28',
    price: 300,
  },
  {
    id: '2',
    address: 'Av. Brasil, 456 - Rio de Janeiro, RJ',
    type: 'REGULARIZATION',
    status: 'PENDING_REVIEW',
    createdAt: '2025-01-30',
    price: 300,
  },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_QUESTIONNAIRE: { label: 'Aguardando questionário', color: 'text-warning' },
  PENDING_DOCUMENTS: { label: 'Aguardando documentos', color: 'text-warning' },
  PENDING_PAYMENT: { label: 'Aguardando pagamento', color: 'text-warning' },
  PROCESSING: { label: 'Em processamento', color: 'text-blue-500' },
  PENDING_REVIEW: { label: 'Em revisão', color: 'text-blue-500' },
  COMPLETED: { label: 'Concluído', color: 'text-success' },
};

const typeLabels: Record<string, string> = {
  PURCHASE: 'Compra',
  SALE: 'Venda',
  FINANCING: 'Financiamento',
  RENTAL: 'Locação',
  REGULARIZATION: 'Regularização',
};

export default function MeusDiagnosticosPage() {
  return (
    <>
      <Sidebar />
      <MainContainer
        title="Meus Diagnósticos"
        subtitle="Acompanhe o status dos seus diagnósticos jurídicos"
      >
        {mockDiagnosticos.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Nenhum diagnóstico ainda
            </h3>
            <p className="text-text-secondary mb-6">
              Comece solicitando seu primeiro diagnóstico jurídico imobiliário.
            </p>
            <Link href="/diagnostico">
              <Button variant="primary">Novo Diagnóstico</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockDiagnosticos.map((diag) => {
              const status = statusLabels[diag.status];
              return (
                <Card key={diag.id} className="hover:shadow-dropdown transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                          {typeLabels[diag.type]}
                        </span>
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-text-primary">{diag.address}</h3>
                      <p className="text-sm text-text-muted mt-1">
                        Solicitado em {new Date(diag.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-text-primary">
                        R$ {diag.price.toFixed(2)}
                      </p>
                      <Link href={`/diagnostico/${diag.id}`}>
                        <Button variant="ghost" size="sm" className="mt-2">
                          Ver detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </MainContainer>
    </>
  );
}
