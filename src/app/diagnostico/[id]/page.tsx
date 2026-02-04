'use client';

import { Suspense, useEffect, useState } from 'react';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import { useParams, useRouter } from 'next/navigation';
import { getDiagnosisByTransactionId, DiagnosisReportData } from '@app/actions/diagnosis-actions';

import { determineOverallStatus, formatDate } from '@ui/components/diagnostico/report-config';
import { DiagnosisSummaryCard } from '@ui/components/diagnostico/DiagnosisSummaryCard';
import { RiskList } from '@ui/components/diagnostico/RiskList';
import { PathwayCard } from '@ui/components/diagnostico/PathwayCard';

function ReportContent() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<DiagnosisReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const id = params.id as string;
        const result = await getDiagnosisByTransactionId(id);
        if (!result) {
          setError('Diagnóstico não encontrado');
          return;
        }
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar diagnóstico');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return <ReportLoading />;
  }

  if (error || !data) {
    const isNotFoundError = error?.includes('não encontrado') || !data;
    return (
      <MainContainer title={isNotFoundError ? 'Relatório em Preparação' : 'Erro'} subtitle="">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {isNotFoundError ? 'Sua análise ainda está sendo processada' : 'Ocorreu um erro'}
          </h3>
          <p className="text-text-secondary mb-6">
            {isNotFoundError
              ? 'O diagnóstico jurídico será gerado assim que o pagamento for confirmado e os dados processados pela nossa IA.'
              : error}
          </p>
          <Button variant="secondary" onClick={() => router.push('/meus-diagnosticos')}>
            Voltar para Meus Diagnósticos
          </Button>
        </div>
      </MainContainer>
    );
  }

  const { diagnosis, transaction } = data;
  const overallStatus = determineOverallStatus(diagnosis.risks);

  return (
    <MainContainer
      title="Relatório de Análise Jurídica"
      subtitle={`Referência: ${diagnosis.id.slice(0, 8)} • Emitido em ${formatDate(diagnosis.updatedAt)}`}
      action={
        <Button variant="secondary" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar PDF
        </Button>
      }
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
  );
}

function ReportLoading() {
  return (
    <MainContainer title="Carregando Relatório..." subtitle="">
      <div className="animate-pulse space-y-8">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </MainContainer>
  );
}

export default function DiagnosisReportPage() {
  return (
    <>
      <Topbar />
      <Suspense fallback={<ReportLoading />}>
        <ReportContent />
      </Suspense>
    </>
  );
}
