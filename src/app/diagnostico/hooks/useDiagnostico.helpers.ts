import type { FailedFile, FormData, ValidationErrors } from '../types';

export function validateDiagnosticoField(
    formData: FormData,
    field: keyof FormData
): string | undefined {
    const value = formData[field]?.trim?.() ?? formData[field];

    switch (field) {
        case 'propertyAddress':
            if (!value || value.length < 10) {
                return 'Informe o endereco completo';
            }
            return undefined;
        case 'propertyType':
            if (!value) {
                return 'Selecione o tipo do imovel';
            }
            return undefined;
        case 'hasMatricula':
            if (!value) {
                return 'Selecione uma opcao';
            }
            return undefined;
        case 'matriculaOption':
            if (
                (formData.hasMatricula === 'nao' || formData.hasMatricula === 'antiga') &&
                !value
            ) {
                return 'Selecione como deseja prosseguir';
            }
            return undefined;
        default:
            return undefined;
    }
}

export function validateDiagnosticoStep(
    formData: FormData,
    step: number
): {
    isValid: boolean;
    errors: ValidationErrors;
    fields: Array<keyof FormData>;
} {
    const stepFields: Record<number, Array<keyof FormData>> = {
        0: ['propertyAddress', 'propertyType'],
        1: ['hasMatricula', 'matriculaOption'],
    };

    const fields = stepFields[step] ?? [];
    const errors: ValidationErrors = {};

    for (const field of fields) {
        const error = validateDiagnosticoField(formData, field);
        if (error) {
            errors[field] = error;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        fields,
    };
}

export function buildUploadFailure(file: File, documentType: string | undefined, error: unknown): FailedFile {
    return {
        file,
        documentType,
        error: error instanceof Error ? error.message : 'Falha ao enviar arquivo',
    };
}
