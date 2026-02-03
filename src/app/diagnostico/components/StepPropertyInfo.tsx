import { Card, Input, Select } from '@ui/components/common';
import { FormData } from '../types';

interface StepPropertyInfoProps {
    formData: FormData;
    updateField: (field: keyof FormData, value: string) => void;
}

export function StepPropertyInfo({ formData, updateField }: StepPropertyInfoProps) {
    return (
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
    );
}
