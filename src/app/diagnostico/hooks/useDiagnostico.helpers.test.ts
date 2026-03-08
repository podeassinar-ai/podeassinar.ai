import { describe, expect, it } from 'vitest';
import {
    buildUploadFailure,
    validateDiagnosticoField,
    validateDiagnosticoStep,
} from './useDiagnostico.helpers';
import type { FormData } from '../types';

function makeFormData(overrides: Partial<FormData> = {}): FormData {
    return {
        propertyAddress: '',
        propertyType: '',
        registryNumber: '',
        registryOffice: '',
        hasMatricula: '',
        matriculaOption: '',
        propertyValue: '',
        additionalInfo: '',
        ...overrides,
    };
}

describe('useDiagnostico helpers', () => {
    it('validates required property info fields', () => {
        const formData = makeFormData({
            propertyAddress: 'Rua A',
            propertyType: '',
        });

        expect(validateDiagnosticoField(formData, 'propertyAddress')).toBe('Informe o endereco completo');
        expect(validateDiagnosticoField(formData, 'propertyType')).toBe('Selecione o tipo do imovel');
    });

    it('requires matricula option only when the user does not have a current certificate', () => {
        const withoutCertificate = makeFormData({
            hasMatricula: 'nao',
            matriculaOption: '',
        });
        const withCertificate = makeFormData({
            hasMatricula: 'sim',
            matriculaOption: '',
        });

        expect(validateDiagnosticoField(withoutCertificate, 'matriculaOption')).toBe(
            'Selecione como deseja prosseguir'
        );
        expect(validateDiagnosticoField(withCertificate, 'matriculaOption')).toBeUndefined();
    });

    it('validates all fields for the current step', () => {
        const formData = makeFormData({
            propertyAddress: '',
            propertyType: '',
        });

        const result = validateDiagnosticoStep(formData, 0);

        expect(result.isValid).toBe(false);
        expect(result.fields).toEqual(['propertyAddress', 'propertyType']);
        expect(result.errors).toEqual({
            propertyAddress: 'Informe o endereco completo',
            propertyType: 'Selecione o tipo do imovel',
        });
    });

    it('captures the file, document type and original message for failed uploads', () => {
        const file = new File(['content'], 'matricula.pdf', { type: 'application/pdf' });

        const failure = buildUploadFailure(file, 'MATRICULA', new Error('storage offline'));

        expect(failure).toEqual({
            file,
            documentType: 'MATRICULA',
            error: 'storage offline',
        });
    });
});
