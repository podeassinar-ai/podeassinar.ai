import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import Link from 'next/link';
import { getDiagnosisReportState } from '@app/actions/diagnosis-actions';
import { determineOverallStatus, formatDate } from '@ui/components/diagnostico/report-config';
import { DiagnosisSummaryCard } from '@ui/components/diagnostico/DiagnosisSummaryCard';
import { RiskList } from '@ui/components/diagnostico/RiskList';
import { PathwayCard } from '@ui/components/diagnostico/PathwayCard';
import { PrintReportButton } from './PrintReportButton';

export default async function DiagnosisReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportState = await getDiagnosisReportState(id);

  if (reportState.status === 'not_found') {
    return (
      <>
        <Topbar />
        <MainContainer title="Relatório em Preparação" subtitle="">
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Diagnóstico não encontrado</h3>
            <p className="text-text-secondary mb-6">
              Não encontramos uma análise para esta referência. Verifique sua lista de diagnósticos e tente novamente.
            </p>
            <Link href="/meus-diagnosticos">
              <Button variant="secondary">Voltar para Meus Diagnósticos</Button>
            </Link>
          </div>
        </MainContainer>
      </>
    );
  }

  if (reportState.status === 'processing') {
    return (
      <>
        <Topbar />
        <MainContainer title="Relatório em Preparação" subtitle="">
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Sua análise ainda está sendo processada</h3>
            <p className="text-text-secondary mb-6">
              O diagnóstico jurídico será gerado assim que o pagamento for confirmado e os dados processados pela nossa IA.
            </p>
            <Link href="/meus-diagnosticos">
              <Button variant="secondary">Voltar para Meus Diagnósticos</Button>
            </Link>
          </div>
        </MainContainer>
      </>
    );
  }

  const { diagnosis, transaction } = reportState.data;
  const overallStatus = determineOverallStatus(diagnosis.risks);

  return (
    <>
      <Topbar />
      <MainContainer
        title="Relatório de Análise Jurídica"
        subtitle={`Referência: ${diagnosis.id.slice(0, 8)} • Emitido em ${formatDate(diagnosis.updatedAt)}`}
        action={<PrintReportButton />}
      >
        <DiagnosisSummaryCard
          diagnosis={diagnosis}
          transaction={transaction}
          overallStatus={overallStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-text-primary">Pontos de Atenção e Riscos</h3>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {diagnosis.risks.length} encontrados
              </span>
            </div>
            <RiskList risks={diagnosis.risks} />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary">Plano de Regularização</h3>
            <PathwayCard pathways={diagnosis.pathways} />
          </div>
        </div>
      </MainContainer>
    </>
  );
}
