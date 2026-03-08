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
import { FailedFile, FormData, ValidationErrors } from '../types';
import { STEPS } from '../constants';
import {
    buildUploadFailure,
    validateDiagnosticoField,
    validateDiagnosticoStep,
} from './useDiagnostico.helpers';

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
    const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Set<keyof FormData>>(new Set());

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
        setFormData((prev) => {
            const next = { ...prev, [field]: value };

            if (touched.has(field) || field === 'hasMatricula') {
                const nextErrors = { ...errors };
                const fieldError = validateDiagnosticoField(next, field);

                if (fieldError) nextErrors[field] = fieldError;
                else delete nextErrors[field];

                if (field === 'hasMatricula' || touched.has('matriculaOption')) {
                    const matriculaOptionError = validateDiagnosticoField(next, 'matriculaOption');
                    if (matriculaOptionError) nextErrors.matriculaOption = matriculaOptionError;
                    else delete nextErrors.matriculaOption;
                }

                setErrors(nextErrors);
            }

            return next;
        });
    };

    const handleBlur = (field: keyof FormData) => {
        setTouched((prev) => new Set(prev).add(field));
        setErrors((prev) => {
            const next = { ...prev };
            const fieldError = validateDiagnosticoField(formData, field);

            if (fieldError) next[field] = fieldError;
            else delete next[field];

            return next;
        });
    };

    const validateStep = (step: number) => {
        const result = validateDiagnosticoStep(formData, step);
        if (result.fields.length > 0) {
            setTouched((prev) => {
                const next = new Set(prev);
                for (const field of result.fields) next.add(field);
                return next;
            });
        }
        setErrors((prev) => {
            const next = { ...prev };
            for (const field of result.fields) {
                if (result.errors[field]) next[field] = result.errors[field];
                else delete next[field];
            }
            return next;
        });
        return result.isValid;
    };

    const uploadSingleFile = async (file: File, documentType?: string) => {
        if (!transactionId) {
            throw new Error('Transação não iniciada.');
        }

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
    };

    const handleFilesUpload = async (files: File[], documentType?: string) => {
        if (!transactionId) {
            addToast('Erro: Transação não iniciada.', 'error');
            return;
        }

        setLoading(true);
        try {
            const newUploadedFiles = [...uploadedFiles];
            const newFailedFiles: FailedFile[] = [];

            for (const file of files) {
                try {
                    await uploadSingleFile(file, documentType);
                    newUploadedFiles.push(file);
                } catch (err) {
                    newFailedFiles.push(buildUploadFailure(file, documentType, err));
                }
            }

            setUploadedFiles(newUploadedFiles);
            if (newFailedFiles.length > 0) {
                setFailedFiles((prev) => [...prev, ...newFailedFiles]);
                addToast(`${newFailedFiles.length} arquivo(s) falharam no envio`, 'error');
            }
            if (newUploadedFiles.length > uploadedFiles.length) {
                addToast('Documentos enviados com sucesso!', 'success');
            }
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

    const retryFailedUpload = async (index: number) => {
        const failedFile = failedFiles[index];
        if (!failedFile) return;

        setLoading(true);
        try {
            await uploadSingleFile(failedFile.file, failedFile.documentType);
            setUploadedFiles((prev) => [...prev, failedFile.file]);
            setFailedFiles((prev) => prev.filter((_, i) => i !== index));
            addToast(`Arquivo ${failedFile.file.name} enviado com sucesso!`, 'success');
        } catch (err: any) {
            setFailedFiles((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? { ...item, error: mapGenericError(err.message) }
                        : item
                )
            );
            addToast(`Erro ao reenviar ${failedFile.file.name}. ${mapGenericError(err.message)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeFailedFile = (index: number) => {
        setFailedFiles((prev) => prev.filter((_, i) => i !== index));
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
        if (!validateStep(currentStep)) {
            addToast('Corrija os campos obrigatorios para continuar.', 'error');
            return;
        }

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
            window.location.href = '/meus-diagnosticos?success=true';
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
        failedFiles,
        errors,
        updateField,
        handleBlur,
        handleFilesUpload,
        removeFile,
        retryFailedUpload,
        removeFailedFile,
        canProceed,
        handleNext,
        handleBack,
        handlePayment,
        addToast,
    };
}
