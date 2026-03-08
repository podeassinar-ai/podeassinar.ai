export interface FormData {
    propertyAddress: string;
    propertyType: string;
    registryNumber: string;
    registryOffice: string;
    hasMatricula: string;
    matriculaOption: string;
    propertyValue: string;
    additionalInfo: string;
}

export interface FailedFile {
    file: File;
    documentType?: string;
    error: string;
}

export type ValidationErrors = Partial<Record<keyof FormData, string>>;

export interface PaymentStepProps {
    transactionId: string | null;
    matriculaOption: string;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    onPaymentClick: () => void;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}
