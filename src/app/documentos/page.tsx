import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button, Alert } from '@ui/components/common';

const mockDocuments = [
  {
    id: '1',
    name: 'Certidão de Matrícula - Rua das Flores.pdf',
    type: 'MATRICULA',
    transactionAddress: 'Rua das Flores, 123 - São Paulo, SP',
    uploadedAt: '2025-01-28',
    expiresAt: '2025-02-27',
    status: 'VALIDATED',
  },
  {
    id: '2',
    name: 'IPTU 2025 - Av Brasil.pdf',
    type: 'IPTU',
    transactionAddress: 'Av. Brasil, 456 - Rio de Janeiro, RJ',
    uploadedAt: '2025-01-30',
    expiresAt: '2025-04-30',
    status: 'PROCESSING',
  },
];

const typeLabels: Record<string, string> = {
  MATRICULA: 'Certidão de Matrícula',
  MATRICULA_ANTIGA: 'Matrícula (antiga)',
  IPTU: 'IPTU',
  RG_CPF: 'RG/CPF',
  CONTRATO: 'Contrato',
  OUTROS: 'Outros',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  UPLOADED: { label: 'Enviado', color: 'text-text-muted' },
  PROCESSING: { label: 'Processando', color: 'text-blue-500' },
  VALIDATED: { label: 'Validado', color: 'text-success' },
  REJECTED: { label: 'Rejeitado', color: 'text-error' },
  EXPIRED: { label: 'Expirado', color: 'text-warning' },
};

export default function DocumentosPage() {
  return (
    <>
      <Sidebar />
      <MainContainer
        title="Documentos"
        subtitle="Gerencie os documentos enviados para seus diagnósticos"
      >
        <Alert variant="info" className="mb-6">
          <strong>Política de retenção:</strong> Seus documentos são armazenados de forma segura
          e excluídos automaticamente após 30-90 dias conforme a LGPD. Certidões de matrícula
          são mantidas por até 30 dias.
        </Alert>

        {mockDocuments.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Nenhum documento enviado
            </h3>
            <p className="text-text-secondary">
              Os documentos enviados nos seus diagnósticos aparecerão aqui.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockDocuments.map((doc) => {
              const status = statusLabels[doc.status];
              const isExpiringSoon = new Date(doc.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <Card key={doc.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded">
                            {typeLabels[doc.type]}
                          </span>
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-text-primary">{doc.name}</h3>
                        <p className="text-sm text-text-muted mt-1">
                          {doc.transactionAddress}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                          <span>Enviado: {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                          <span className={isExpiringSoon ? 'text-warning' : ''}>
                            Expira: {new Date(doc.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
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
