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

const statusStyles: Record<string, { label: string; className: string }> = {
  PENDING_QUESTIONNAIRE: { label: 'Aguardando Informações', className: 'text-yellow-700 bg-yellow-50' },
  PENDING_DOCUMENTS: { label: 'Aguardando Documentos', className: 'text-yellow-700 bg-yellow-50' },
  PENDING_PAYMENT: { label: 'Aguardando Pagamento', className: 'text-yellow-700 bg-yellow-50' },
  PROCESSING: { label: 'Em Análise', className: 'text-blue-700 bg-blue-50' },
  PENDING_REVIEW: { label: 'Em Revisão Jurídica', className: 'text-purple-700 bg-purple-50' },
  COMPLETED: { label: 'Concluído', className: 'text-emerald-700 bg-emerald-50' },
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
        subtitle="Acompanhe o andamento das suas análises jurídicas"
        action={
           <Link href="/diagnostico">
              <Button variant="primary">
                + Novo Diagnóstico
              </Button>
            </Link>
        }
      >
        {mockDiagnosticos.length === 0 ? (
          <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Nenhum diagnóstico encontrado
            </h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">
              Você ainda não solicitou nenhuma análise. Inicie um novo diagnóstico para garantir a segurança do seu negócio.
            </p>
            <Link href="/diagnostico">
              <Button variant="primary">Iniciar Novo Diagnóstico</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockDiagnosticos.map((diag) => {
              const status = statusStyles[diag.status] || { label: diag.status, className: 'bg-gray-100 text-gray-600' };
              
              return (
                <div key={diag.id} className="group bg-white border border-border rounded hover:border-primary/30 hover:shadow-md transition-all duration-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {typeLabels[diag.type]}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-text-primary group-hover:text-primary transition-colors">{diag.address}</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Solicitado em {new Date(diag.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-text-secondary">Valor</p>
                      <p className="font-semibold text-text-primary">
                        R$ {diag.price.toFixed(2)}
                      </p>
                    </div>
                    <Link href={`/diagnostico/${diag.id}`}>
                      <Button variant="secondary" size="sm" className="border-gray-300">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MainContainer>
    </>
  );
}