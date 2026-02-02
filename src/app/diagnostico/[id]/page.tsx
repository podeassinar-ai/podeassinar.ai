'use client';

import { Suspense, useEffect, useState } from 'react';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button } from '@ui/components/common';
import { useParams, useRouter } from 'next/navigation';
import { getDiagnosisByTransactionId, DiagnosisReportData } from '@app/actions/diagnosis-actions';
import { RiskLevel, LegalPathway, RiskItem } from '@domain/entities/diagnosis';

type ReportStatus = 'SAFE' | 'CAUTION' | 'CRITICAL';

const statusConfig = {
  SAFE: { label: 'Compra Segura', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'shield-check' },
  CAUTION: { label: 'Aprovado com Ressalvas', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'exclamation' },
  CRITICAL: { label: 'Alto Risco', color: 'bg-red-100 text-red-800 border-red-200', icon: 'hand' },
};

const riskLevelConfig: Record<RiskLevel, { label: string; class: string; borderClass: string }> = {
  LOW: { label: 'Baixo', class: 'bg-blue-100 text-blue-800', borderClass: 'border-l-blue-400' },
  MEDIUM: { label: 'Médio', class: 'bg-yellow-100 text-yellow-800', borderClass: 'border-l-yellow-400' },
  HIGH: { label: 'Alto', class: 'bg-orange-100 text-orange-800', borderClass: 'border-l-orange-400' },
  CRITICAL: { label: 'Crítico', class: 'bg-red-100 text-red-800', borderClass: 'border-l-red-400' },
};

function determineOverallStatus(risks: RiskItem[]): ReportStatus {
  if (risks.some(r => r.level === 'CRITICAL')) return 'CRITICAL';
  if (risks.some(r => r.level === 'HIGH' || r.level === 'MEDIUM')) return 'CAUTION';
  return 'SAFE';
}

function calculateTotalCost(pathways: LegalPathway[]): { min: number; max: number } {
  return pathways.reduce(
    (acc, p) => ({
      min: acc.min + (p.estimatedCost?.min ?? 0),
      max: acc.max + (p.estimatedCost?.max ?? 0),
    }),
    { min: 0, max: 0 }
  );
}

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
  const status = statusConfig[overallStatus];
  const totalCost = calculateTotalCost(diagnosis.pathways);
  const primaryPathway = diagnosis.pathways[0];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

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
      <div className="bg-white rounded border border-border overflow-hidden mb-8 shadow-sm">
        <div className={`p-6 border-b border-border flex items-start gap-4 ${status.color.replace('text-', 'bg-opacity-10 ')}`}>
          <div className={`p-3 rounded-full bg-white bg-opacity-60 border ${status.color.split(' ')[2]}`}>
            {status.icon === 'shield-check' && (
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {status.icon === 'exclamation' && (
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {status.icon === 'hand' && (
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{status.label}</h2>
            <p className="text-gray-700 leading-relaxed">{diagnosis.summary || diagnosis.propertyStatus}</p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Transação</p>
            <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
            {transaction.propertyAddress && (
              <p className="text-xs text-gray-600">{transaction.propertyAddress}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matrícula</p>
            <p className="text-sm font-medium text-gray-900">
              {transaction.registryNumber || 'Não informada'}
            </p>
            {transaction.registryOffice && (
              <p className="text-xs text-gray-600">{transaction.registryOffice}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-medium text-gray-900">{diagnosis.status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Criado em</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(diagnosis.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-text-primary">Pontos de Atenção e Riscos</h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {diagnosis.risks.length} encontrados
            </span>
          </div>

          {diagnosis.risks.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-4">Nenhum risco identificado.</p>
            </Card>
          ) : (
            diagnosis.risks.map((risk: RiskItem, idx: number) => {
              const riskConfig = riskLevelConfig[risk.level];
              return (
                <Card key={risk.id || idx} className={`border-l-4 ${riskConfig.borderClass}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${riskConfig.class}`}>
                      Risco {riskConfig.label}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{risk.category}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{risk.description}</h4>

                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <p className="text-xs font-bold text-gray-700 mb-1 uppercase">Recomendação Jurídica</p>
                    <p className="text-sm text-gray-800">{risk.recommendation}</p>
                  </div>

                  {risk.estimatedCost && (
                    <p className="text-xs text-gray-500 mt-2">
                      Custo estimado: R$ {risk.estimatedCost.min.toLocaleString('pt-BR')} - R$ {risk.estimatedCost.max.toLocaleString('pt-BR')}
                    </p>
                  )}
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-text-primary">Plano de Regularização</h3>

          <div className="bg-white border border-border rounded p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">Estimativa de Custo Total</p>
              <p className="text-2xl font-bold text-primary">
                R$ {totalCost.min.toLocaleString('pt-BR')} - R$ {totalCost.max.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500">Taxas e emolumentos aproximados</p>
            </div>

            {primaryPathway && (
              <>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900 mb-1">Tempo Estimado</p>
                  <p className="text-lg font-semibold text-gray-700">{primaryPathway.estimatedDuration}</p>
                </div>

                <div className="space-y-6 relative pl-2">
                  <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                  {primaryPathway.steps.map((step: string, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full z-10"></div>
                      <p className="text-sm text-gray-700 leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {diagnosis.pathways.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum plano de regularização definido ainda.</p>
            )}

            <Button variant="primary" className="w-full mt-8">
              Iniciar Regularização
            </Button>
          </div>
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
