'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  StepIndicator,
  Alert,
  FileUploader,
} from '@ui/components/common';

const STEPS = ['Informações', 'Questionário', 'Documentos', 'Pagamento'];

const transactionTypeLabels: Record<string, string> = {
  PURCHASE: 'Compra de Imóvel',
  SALE: 'Venda de Imóvel',
  FINANCING: 'Financiamento',
  REFINANCING: 'Refinanciamento',
  RENTAL: 'Locação',
  REGULARIZATION: 'Regularização',
};

interface FormData {
  propertyAddress: string;
  propertyType: string;
  registryNumber: string;
  registryOffice: string;
  hasMatricula: string;
  matriculaOption: string;
  propertyValue: string;
  additionalInfo: string;
}

function DiagnosticoContent() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo') || 'PURCHASE';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    propertyAddress: '',
    propertyType: '',
    registryNumber: '',
    registryOffice: '',
    hasMatricula: '',
    matriculaOption: '',
    propertyValue: '',
    additionalInfo: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilesUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.propertyAddress && formData.propertyType;
      case 1:
        return formData.hasMatricula && (formData.hasMatricula === 'sim' || formData.matriculaOption);
      case 2:
        return uploadedFiles.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <MainContainer
      title={`Novo Diagnóstico: ${transactionTypeLabels[tipo]}`}
      subtitle="Preencha as informações para análise jurídica do imóvel"
    >
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {currentStep === 0 && (
        <Card title="Informações do Imóvel">
          <div className="space-y-4">
            <Input
              label="Endereço completo do imóvel"
              placeholder="Rua, número, complemento, bairro, cidade, estado"
              value={formData.propertyAddress}
              onChange={(e) => updateField('propertyAddress', e.target.value)}
            />
            
            <Select
              label="Tipo do imóvel"
              options={[
                { value: 'apartamento', label: 'Apartamento' },
                { value: 'casa', label: 'Casa' },
                { value: 'terreno', label: 'Terreno' },
                { value: 'comercial', label: 'Imóvel Comercial' },
                { value: 'rural', label: 'Imóvel Rural' },
              ]}
              placeholder="Selecione o tipo"
              value={formData.propertyType}
              onChange={(e) => updateField('propertyType', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número da matrícula (se souber)"
                placeholder="Ex: 12345"
                value={formData.registryNumber}
                onChange={(e) => updateField('registryNumber', e.target.value)}
                hint="Opcional neste momento"
              />
              <Input
                label="Cartório de Registro"
                placeholder="Ex: 1º Ofício de Registro de Imóveis"
                value={formData.registryOffice}
                onChange={(e) => updateField('registryOffice', e.target.value)}
                hint="Opcional neste momento"
              />
            </div>

            <Input
              label="Valor estimado do imóvel"
              placeholder="R$ 0,00"
              value={formData.propertyValue}
              onChange={(e) => updateField('propertyValue', e.target.value)}
            />
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card title="Questionário">
          <div className="space-y-6">
            <Select
              label="Você possui a certidão de matrícula atualizada do imóvel?"
              options={[
                { value: 'sim', label: 'Sim, tenho a certidão atualizada (menos de 30 dias)' },
                { value: 'antiga', label: 'Tenho uma certidão antiga (mais de 30 dias)' },
                { value: 'nao', label: 'Não tenho a certidão' },
              ]}
              placeholder="Selecione uma opção"
              value={formData.hasMatricula}
              onChange={(e) => updateField('hasMatricula', e.target.value)}
            />

            {formData.hasMatricula === 'antiga' && (
              <Alert variant="warning" title="Certidão desatualizada">
                Para um diagnóstico válido, é necessária uma certidão com menos de 30 dias. 
                Você pode enviar a antiga e solicitar a atualização por nossa plataforma.
              </Alert>
            )}

            {formData.hasMatricula === 'nao' && (
              <>
                <Alert variant="info" title="Emissão de certidão">
                  Podemos solicitar a certidão para você. Informe o número da matrícula e 
                  o cartório na etapa anterior. O custo será adicionado ao diagnóstico.
                </Alert>
                <Select
                  label="Como deseja prosseguir?"
                  options={[
                    { value: 'solicitar', label: 'Solicitar emissão pelo PodeAssinar (+ custo do cartório)' },
                    { value: 'providenciar', label: 'Vou providenciar a certidão por conta própria' },
                  ]}
                  placeholder="Selecione uma opção"
                  value={formData.matriculaOption}
                  onChange={(e) => updateField('matriculaOption', e.target.value)}
                />
              </>
            )}

            <Textarea
              label="Informações adicionais"
              placeholder="Descreva qualquer situação relevante sobre o imóvel (pendências conhecidas, disputas, obras, etc.)"
              value={formData.additionalInfo}
              onChange={(e) => updateField('additionalInfo', e.target.value)}
              hint="Opcional, mas ajuda na análise"
            />
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="Documentos">
          <div className="space-y-6">
            <Alert variant="info">
              Envie os documentos disponíveis. No mínimo, precisamos da certidão de matrícula 
              ou IPTU para iniciar a análise.
            </Alert>

            <FileUploader
              label="Certidão de Matrícula"
              onUpload={handleFilesUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              hint="PDF ou imagem da certidão de matrícula do imóvel"
            />

            <FileUploader
              label="IPTU ou Carnê"
              onUpload={handleFilesUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              hint="Opcional: Comprovante de IPTU do imóvel"
            />

            <FileUploader
              label="Outros documentos"
              onUpload={handleFilesUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              hint="Contratos, escrituras, certidões adicionais, etc."
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Arquivos enviados:</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-text-primary">{file.name}</span>
                        <span className="text-xs text-text-muted">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <Card title="Pagamento">
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-text-primary mb-3">Resumo do pedido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Diagnóstico Jurídico Imobiliário</span>
                  <span className="text-text-primary">R$ 300,00</span>
                </div>
                {formData.matriculaOption === 'solicitar' && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Emissão de Certidão (estimado)</span>
                    <span className="text-text-primary">R$ 50,00</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-text-primary">Total</span>
                    <span className="text-primary">
                      R$ {formData.matriculaOption === 'solicitar' ? '350,00' : '300,00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Alert variant="info">
              Após o pagamento, nosso sistema iniciará a análise dos documentos com IA. 
              Um advogado especializado revisará o diagnóstico antes da entrega final.
              <br /><br />
              <strong>Prazo estimado: 2-3 dias úteis.</strong>
            </Alert>

            <Button variant="primary" size="lg" className="w-full">
              Pagar e Iniciar Diagnóstico
            </Button>

            <p className="text-xs text-text-muted text-center">
              Pagamento seguro via AbacatePay (Pix). Seus dados estão protegidos.
            </p>
          </div>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Voltar
        </Button>
        
        {currentStep < STEPS.length - 1 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continuar
          </Button>
        )}
      </div>
    </MainContainer>
  );
}

function DiagnosticoLoading() {
  return (
    <MainContainer title="Carregando..." subtitle="">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </MainContainer>
  );
}

export default function DiagnosticoPage() {
  return (
    <>
      <Sidebar />
      <Suspense fallback={<DiagnosticoLoading />}>
        <DiagnosticoContent />
      </Suspense>
    </>
  );
}
