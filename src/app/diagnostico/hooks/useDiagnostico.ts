import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@ui/components/common';
import {
    createTransactionAction,
    updateTransactionAction,
} from '../../actions/transaction-actions';
import { initiatePaymentAction } from '../../actions/payment-actions';
import { saveDocumentRecordAction } from '../../actions/document-actions';
import { getIdFromSlug } from '@/ui/constants/transactions';
import { mapGenericError } from '@/utils/error-mapping';
import { FormData } from '../types';
import { STEPS } from '../constants';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useDiagnostico() {
    const searchParams = useSearchParams();
    const tipoSlug = searchParams.get('tipo');
    const existingId = searchParams.get('id');
    const tipo = getIdFromSlug(tipoSlug || 'compra');
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentStep, setCurrentStep] = useState(0);
    const [transactionId, setTransactionId] = useState<string | null>(existingId);
    const [loading, setLoading] = useState(!!existingId);
    const [initialLoading, setInitialLoading] = useState(!!existingId);

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

    useEffect(() => {
        async function loadTransaction() {
            if (!existingId) return;
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('id', existingId)
                    .single();

                if (error || !data) {
                    addToast('Transação não encontrada', 'error');
                    return;
                }

                setFormData({
                    propertyAddress: data.property_address || '',
                    propertyType: data.property_type || '',
                    registryNumber: data.registry_number || '',
                    registryOffice: data.registry_office || '',
                    hasMatricula: data.has_matricula || '',
                    matriculaOption: data.matricula_option || '',
                    propertyValue: data.property_value || '',
                    additionalInfo: data.additional_info || '',
                });

                const statusStepMap: Record<string, number> = {
                    PENDING_QUESTIONNAIRE: 1,
                    PENDING_DOCUMENTS: 2,
                    PENDING_PAYMENT: 3,
                };
                setCurrentStep(statusStepMap[data.status] ?? 0);
            } catch (err) {
                console.error('Error loading transaction:', err);
            } finally {
                setInitialLoading(false);
                setLoading(false);
            }
        }
        loadTransaction();
    }, [existingId, addToast]);

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilesUpload = async (files: File[], documentType?: string) => {
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
                    documentType,
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
                return !!(formData.propertyAddress && formData.propertyType);
            case 1:
                return !!(formData.hasMatricula && (formData.hasMatricula === 'sim' || formData.matriculaOption));
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
                    await updateTransactionAction(transactionId, {
                        ...formData,
                        advanceStatus: 'PENDING_DOCUMENTS',
                    });
                }
            } else if (currentStep === 2) {
                if (transactionId) {
                    await updateTransactionAction(transactionId, {
                        advanceStatus: 'PENDING_PAYMENT',
                    });
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
            // In dev mode, the action triggers diagnosis and redirects.
            // If no redirect occurred (unlikely), show success and redirect manually.
            addToast('Diagnóstico iniciado com sucesso!', 'success');
            window.location.href = '/meus-diagnosticos';
        } catch (err: any) {
            // Next.js redirect throws an error, so we need to check for it
            if (err?.digest?.startsWith('NEXT_REDIRECT')) {
                return; // Redirect is happening, do nothing
            }
            console.error(err);
            addToast('Erro ao iniciar pagamento: ' + mapGenericError(err.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
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
    };
}
