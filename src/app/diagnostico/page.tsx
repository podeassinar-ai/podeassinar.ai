'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { TransactionTypeModal } from '@ui/components/layout/transaction-type-modal';
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  StepIndicator,
  Alert,
  FileUploader,
  useToast,
} from '@ui/components/common';
import { createTransactionAction, updateTransactionAction } from '../actions/transaction-actions';
import { initiatePaymentAction } from '../actions/payment-actions';
import { saveDocumentRecordAction } from '../actions/document-actions';
import { createClient } from '@supabase/supabase-js';
import { mapGenericError } from '@/utils/error-mapping';

// Init client-side supabase for storage upload
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STEPS = ['Informações', 'Questionário', 'Documentos', 'Pagamento'];

const transactionTypeLabels: Record<string, string> = {
  REGULARIZATION: 'Regularização',
  PURCHASE: 'Compra e Venda',
  RENTAL: 'Aluguel',
  DONATION: 'Doação',
  EXCHANGE: 'Permuta',
  BUILT_TO_SUIT: 'Built-to-suit',
  SURFACE_RIGHT: 'Direito Real de Superfície',
  RURAL_LEASE: 'Arrendamento Rural',
  GUARANTEES: 'Garantias',
  FIDUCIARY: 'Alienação Fiduciária',
  CAPITAL: 'Integralização de Capital',
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
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleFilesUpload = async (files: File[]) => {
    if (!transactionId) {
      addToast('Erro: Transação não iniciada.', 'error');
      return;
    }

    setLoading(true);
    try {
      const newUploadedFiles = [...uploadedFiles];
      
      for (const file of files) {
        const filePath = `transactions/${transactionId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        await saveDocumentRecordAction(transactionId, {
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
        });

        newUploadedFiles.push(file);
      }
      
      setUploadedFiles(newUploadedFiles);
      addToast('Documentos enviados com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Erro ao enviar documentos. ' + mapGenericError(err.message), 'error');
    } finally {
      setLoading(false);
    }
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

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 0) {
        if (!transactionId) {
          const tx = await createTransactionAction(tipo, formData);
          setTransactionId(tx.id);
        } else {
          await updateTransactionAction(transactionId, formData);
        }
      } else if (currentStep === 1) {
        if (transactionId) {
          await updateTransactionAction(transactionId, formData);
        }
      }
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Erro ao salvar dados. ' + mapGenericError(err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePayment = async () => {
    if (!transactionId) return;
    setLoading(true);
    try {
      await initiatePaymentAction(transactionId);
    } catch (err: any) {
      console.error(err);
      addToast('Erro ao iniciar pagamento: ' + mapGenericError(err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

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
            <Card title="Dados do Imóvel" description="Identificação da propriedade objeto da análise">
              <div className="space-y-6">
                <Input
                  label="Endereço completo do imóvel"
                  placeholder="Rua, número, complemento, bairro, cidade, estado"
                  value={formData.propertyAddress}
                  onChange={(e) => updateField('propertyAddress', e.target.value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <Input
                    label="Valor estimado (R$)"
                    placeholder="0,00"
                    value={formData.propertyValue}
                    mask="currency"
                    onChange={(e) => updateField('propertyValue', e.target.value)}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded border border-gray-100 space-y-4">
                  <h4 className="text-sm font-medium text-text-secondary font-mono uppercase">Dados Cartorários (Opcional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número da Matrícula"
                      placeholder="Ex: 12345"
                      value={formData.registryNumber}
                      mask="number"
                      onChange={(e) => updateField('registryNumber', e.target.value)}
                    />
                    <Input
                      label="Cartório de Registro"
                      placeholder="Ex: 1º RGI"
                      value={formData.registryOffice}
                      onChange={(e) => updateField('registryOffice', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <Card title="Status Documental" description="Entendimento inicial da situação jurídica">
              <div className="space-y-8">
                <div className="space-y-4">
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
                    <Alert variant="warning" title="Atenção: Validade da Certidão">
                      Para garantia jurídica completa, cartórios exigem certidões com menos de 30 dias. 
                      Analisaremos o documento enviado, mas recomendamos a atualização.
                    </Alert>
                  )}

                  {formData.hasMatricula === 'nao' && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                      <Alert variant="info" title="Serviço de Busca">
                        Podemos solicitar a certidão atualizada diretamente no cartório para você.
                      </Alert>
                      <Select
                        label="Como deseja prosseguir?"
                        options={[
                          { value: 'solicitar', label: 'Solicitar emissão pelo PodeAssinar (+ taxas cartorárias)' },
                          { value: 'providenciar', label: 'Vou providenciar a certidão por conta própria' },
                        ]}
                        placeholder="Selecione uma opção"
                        value={formData.matriculaOption}
                        onChange={(e) => updateField('matriculaOption', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <Textarea
                  label="Observações Adicionais"
                  placeholder="Descreva pendências conhecidas, dívidas, inventários em andamento ou qualquer detalhe relevante sobre o imóvel."
                  value={formData.additionalInfo}
                  onChange={(e) => updateField('additionalInfo', e.target.value)}
                  hint="Essas informações orientam o foco da nossa análise jurídica."
                />
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card title="Upload de Documentos" description="Ambiente seguro e criptografado">
              <div className="space-y-6">
                <Alert variant="info">
                  Seus documentos são protegidos por criptografia ponta-a-ponta e processados pela nossa IA de forma confidencial.
                </Alert>

                <div className="grid gap-6">
                  <FileUploader
                    label="Certidão de Matrícula"
                    onUpload={handleFilesUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    hint="Envie o PDF ou fotos legíveis de todas as páginas"
                  />

                  <FileUploader
                    label="IPTU (Opcional)"
                    onUpload={handleFilesUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    hint="Capa do carnê ou certidão negativa de débitos"
                  />

                  <FileUploader
                    label="Outros Documentos"
                    onUpload={handleFilesUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    hint="Contratos, escrituras anteriores, etc."
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded border border-border p-4">
                    <h4 className="text-sm font-medium text-text-primary mb-3 font-mono uppercase">Arquivos Selecionados</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                               <p className="text-sm font-medium text-text-primary truncate max-w-[200px] font-mono text-xs">{file.name}</p>
                               <p className="text-[10px] text-text-muted font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-error transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="space-y-6">
              <Card className="bg-white">
                 <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">Confirmação da Análise</h3>
                    <p className="text-text-secondary mt-1">Revise os valores da Due Diligence</p>
                 </div>

                 <div className="bg-gray-50 rounded border border-border p-6 mb-6">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <div>
                          <span className="block font-medium text-text-primary">Due Diligence Imobiliária</span>
                          <span className="text-sm text-text-muted">Análise IA + Relatório + Validação</span>
                        </div>
                        <span className="font-semibold text-text-primary font-mono">R$ 300,00</span>
                      </div>
                      
                      {formData.matriculaOption === 'solicitar' && (
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                          <div>
                            <span className="block font-medium text-text-primary">Serviço de Busca de Certidão</span>
                            <span className="text-sm text-text-muted">Taxas cartorárias + Emissão digital</span>
                          </div>
                          <span className="font-semibold text-text-primary font-mono">R$ 50,00</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg text-primary">Total</span>
                        <span className="font-bold text-2xl text-primary font-mono">
                          R$ {formData.matriculaOption === 'solicitar' ? '350,00' : '300,00'}
                        </span>
                      </div>
                   </div>
                 </div>

                 <Button 
                   variant="primary" 
                   size="lg" 
                   className="w-full py-4 text-lg"
                   onClick={handlePayment}
                   loading={loading}
                 >
                   Ir para Pagamento (Seguro)
                 </Button>
                 
                 <p className="text-center text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                   Ambiente seguro. Dados criptografados.
                 </p>
              </Card>
            </div>
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