'use client';

import { Suspense } from 'react';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { TransactionTypeModal } from '@ui/components/layout/transaction-type-modal';
import { Button, StepIndicator } from '@ui/components/common';
import { useDiagnostico } from './hooks/useDiagnostico';
import { STEPS, transactionTypeLabels } from './constants';
import { StepPropertyInfo } from './components/StepPropertyInfo';
import { StepDocumentStatus } from './components/StepDocumentStatus';
import { StepFileUpload } from './components/StepFileUpload';
import { PaymentStep } from './components/PaymentStep';

function DiagnosticoContent() {
  const {
    tipo,
    isModalOpen,
    setIsModalOpen,
    currentStep,
    transactionId,
    loading,
    setLoading,
    initialLoading,
    formData,
    uploadedFiles,
    updateField,
    handleFilesUpload,
    removeFile,
    canProceed,
    handleNext,
    handleBack,
    handlePayment,
    addToast,
  } = useDiagnostico();

  // Show loading during initial fetch
  if (initialLoading) {
    return (
      <MainContainer title="Iniciando IA..." subtitle="">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-sm font-mono text-primary animate-pulse">Carregando dados da transação...</p>
        </div>
      </MainContainer>
    );
  }

  return (
    <>
      <MainContainer
        title={`Nova Due Diligence: ${transactionTypeLabels[tipo]}`}
        subtitle="Inicie a análise de riscos jurídicos do imóvel com IA"
        action={
          <Button variant="ghost" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Alterar tipo
          </Button>
        }
      >
        <div className="mb-12 max-w-3xl mx-auto">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <div className="max-w-3xl mx-auto">
          {currentStep === 0 && (
            <StepPropertyInfo formData={formData} updateField={updateField} />
          )}

          {currentStep === 1 && (
            <StepDocumentStatus formData={formData} updateField={updateField} />
          )}

          {currentStep === 2 && (
            <StepFileUpload
              uploadedFiles={uploadedFiles}
              handleFilesUpload={handleFilesUpload}
              removeFile={removeFile}
            />
          )}

          {currentStep === 3 && (
            <PaymentStep
              transactionId={transactionId}
              matriculaOption={formData.matriculaOption}
              loading={loading}
              setLoading={setLoading}
              onPaymentClick={handlePayment}
              addToast={addToast}
            />
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              ← Voltar
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
                loading={loading}
              >
                Continuar →
              </Button>
            )}
          </div>
        </div>
      </MainContainer>

      <TransactionTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function DiagnosticoLoading() {
  return (
    <MainContainer title="Iniciando IA..." subtitle="">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-sm font-mono text-primary animate-pulse">Carregando módulos de análise...</p>
      </div>
    </MainContainer>
  );
}

export default function DiagnosticoPage() {
  return (
    <>
      <Topbar />
      <Suspense fallback={<DiagnosticoLoading />}>
        <DiagnosticoContent />
      </Suspense>
    </>
  );
}