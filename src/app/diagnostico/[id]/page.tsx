'use client';

import { Suspense } from 'react';
import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button } from '@ui/components/common';
import { useParams } from 'next/navigation';

// Mock Data for the Report
const mockReport = {
  id: '1',
  property: {
    address: 'Rua das Flores, 123 - São Paulo, SP',
    type: 'Apartamento',
    registry: '12345 - 1º RGI SP',
    value: 850000,
  },
  status: 'CAUTION', // SAFE, CAUTION, CRITICAL
  summary: 'O imóvel apresenta situação jurídica regular em sua maior parte, mas identificamos uma penhora antiga na matrícula que precisa de baixa formal. A compra é viável, desde que condicionada à apresentação da certidão de objeto e pé do processo extinto.',
  risks: [
    {
      level: 'MEDIUM',
      category: 'Processual',
      title: 'Penhora não baixada na matrícula',
      description: 'Consta averbação de penhora referente a processo trabalhista de 2015.',
      recommendation: 'Exigir apresentação de certidão de objeto e pé comprovando a extinção do processo e solicitar baixa na matrícula antes da escritura.',
    },
    {
      level: 'LOW',
      category: 'Fiscal',
      title: 'Débitos de IPTU 2024',
      description: 'Consta débito de R$ 1.200,00 referente ao exercício atual.',
      recommendation: 'Solicitar quitação ou descontar valor do preço de venda.',
    }
  ],
  pathway: {
    title: 'Regularização para Compra Segura',
    steps: [
      'Solicitar Certidão de Objeto e Pé do Processo 00123.2015',
      'Averbar baixa da penhora no Cartório de Registro de Imóveis',
      'Quitar débitos de IPTU',
      'Lavrar Escritura Pública de Compra e Venda',
      'Registrar Escritura na Matrícula'
    ],
    estimatedCost: 2500,
    estimatedTime: '20-30 dias'
  }
};

const statusConfig = {
  SAFE: { label: 'Compra Segura', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'shield-check' },
  CAUTION: { label: 'Aprovado com Ressalvas', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'exclamation' },
  CRITICAL: { label: 'Alto Risco', color: 'bg-red-100 text-red-800 border-red-200', icon: 'hand' },
};

function ReportContent() {
  const params = useParams();
  const report = mockReport; // In real app, fetch by params.id
  const status = statusConfig[report.status as keyof typeof statusConfig];

  return (
    <MainContainer
      title="Relatório de Análise Jurídica"
      subtitle={`Referência: ${report.id} • Emitido em 31/01/2026`}
      action={
        <Button variant="secondary" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar PDF
        </Button>
      }
    >
      {/* Executive Summary Card */}
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
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{status.label}</h2>
              <p className="text-gray-700 leading-relaxed">{report.summary}</p>
            </div>
         </div>
         
         <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Imóvel</p>
              <p className="text-sm font-medium text-gray-900">{report.property.type}</p>
              <p className="text-xs text-gray-600">{report.property.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matrícula</p>
              <p className="text-sm font-medium text-gray-900">{report.property.registry}</p>
            </div>
             <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Valor Declarado</p>
              <p className="text-sm font-medium text-gray-900">R$ {report.property.value.toLocaleString('pt-BR')}</p>
            </div>
            <div>
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Advogado Responsável</p>
               <p className="text-sm font-medium text-gray-900">Dr. Gabriel Silva</p>
               <p className="text-xs text-gray-600">OAB/SP 123.456</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risks Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <h3 className="text-lg font-bold text-text-primary">Pontos de Atenção e Riscos</h3>
             <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">{report.risks.length} encontrados</span>
          </div>

          {report.risks.map((risk, idx) => (
            <Card key={idx} className="border-l-4 border-l-yellow-400">
               <div className="flex justify-between items-start mb-2">
                 <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                   ${risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}
                 `}>
                   Risco {risk.level === 'MEDIUM' ? 'Médio' : 'Baixo'}
                 </span>
                 <span className="text-xs text-gray-500 font-medium">{risk.category}</span>
               </div>
               <h4 className="text-base font-bold text-gray-900 mb-2">{risk.title}</h4>
               <p className="text-sm text-gray-600 mb-4">{risk.description}</p>
               
               <div className="bg-gray-50 p-3 rounded border border-gray-100">
                 <p className="text-xs font-bold text-gray-700 mb-1 uppercase">Recomendação Jurídica</p>
                 <p className="text-sm text-gray-800">{risk.recommendation}</p>
               </div>
            </Card>
          ))}
        </div>

        {/* Action Plan / Pathway */}
        <div className="space-y-6">
           <h3 className="text-lg font-bold text-text-primary">Plano de Regularização</h3>
           
           <div className="bg-white border border-border rounded p-6 shadow-sm">
             <div className="mb-6">
               <p className="text-sm font-medium text-gray-900 mb-1">Estimativa de Custo</p>
               <p className="text-2xl font-bold text-primary">R$ {report.pathway.estimatedCost.toLocaleString('pt-BR')}</p>
               <p className="text-xs text-gray-500">Taxas e emolumentos aproximados</p>
             </div>
             
             <div className="mb-6">
               <p className="text-sm font-medium text-gray-900 mb-1">Tempo Estimado</p>
               <p className="text-lg font-semibold text-gray-700">{report.pathway.estimatedTime}</p>
             </div>

             <div className="space-y-6 relative pl-2">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                {report.pathway.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full z-10"></div>
                    <p className="text-sm text-gray-700 leading-snug">{step}</p>
                  </div>
                ))}
             </div>

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
      <Sidebar />
      <Suspense fallback={<ReportLoading />}>
        <ReportContent />
      </Suspense>
    </>
  );
}