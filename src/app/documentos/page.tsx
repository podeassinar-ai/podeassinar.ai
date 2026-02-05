import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Alert } from '@ui/components/common';
import { getUserDocumentsAction } from '../actions/document-actions';
import { DownloadButton } from './components/download-button';

const typeLabels: Record<string, string> = {
  MATRICULA: 'Certidão de Matrícula',
  MATRICULA_ANTIGA: 'Matrícula (antiga)',
  IPTU: 'IPTU',
  RG_CPF: 'RG/CPF',
  CONTRATO: 'Contrato',
  OUTROS: 'Outros',
};

const statusStyles: Record<string, { label: string; className: string }> = {
  UPLOADED: { label: 'Enviado', className: 'text-gray-600 bg-gray-50' },
  PROCESSING: { label: 'Em Análise', className: 'text-blue-700 bg-blue-50' },
  VALIDATED: { label: 'Validado', className: 'text-emerald-700 bg-emerald-50' },
  REJECTED: { label: 'Rejeitado', className: 'text-red-700 bg-red-50' },
  EXPIRED: { label: 'Expirado', className: 'text-orange-700 bg-orange-50' },
};

export default async function DocumentosPage() {
  const documents = await getUserDocumentsAction();

  return (
    <>
      <Topbar />
      <MainContainer
        title="Documentos"
        subtitle="Central de documentos e arquivos enviados"
      >
        <Alert variant="info" className="mb-8">
          <strong>Política de Segurança:</strong> Seus documentos são criptografados.
          Conforme a LGPD, certidões são retidas apenas pelo período necessário para a análise (máximo de 90 dias).
        </Alert>

        {documents.length === 0 ? (
          <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Nenhum documento
            </h3>
            <p className="text-text-secondary">
              Os documentos enviados nos seus diagnósticos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => {
                  const status = statusStyles[doc.status] || statusStyles['UPLOADED'];

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{doc.transactionAddress}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{typeLabels[doc.type] || doc.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DownloadButton documentId={doc.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </MainContainer>
    </>
  );
}