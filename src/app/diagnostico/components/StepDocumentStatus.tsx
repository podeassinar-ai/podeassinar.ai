import { Card, Select, Textarea, Alert } from '@ui/components/common';
import { FormData } from '../types';

interface StepDocumentStatusProps {
    formData: FormData;
    updateField: (field: keyof FormData, value: string) => void;
}

export function StepDocumentStatus({ formData, updateField }: StepDocumentStatusProps) {
    return (
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

                    {(formData.hasMatricula === 'nao' || formData.hasMatricula === 'antiga') && (
                        <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                            {formData.hasMatricula === 'antiga' && (
                                <Alert variant="warning" title="Atenção: Validade da Certidão">
                                    Para garantia jurídica completa, cartórios exigem certidões com menos de 30 dias.
                                    Analisaremos o documento enviado, mas recomendamos a atualização.
                                </Alert>
                            )}

                            {formData.hasMatricula === 'nao' && (
                                <Alert variant="info" title="Serviço de Busca">
                                    Podemos solicitar a certidão atualizada diretamente no cartório para você.
                                </Alert>
                            )}

                            <Select
                                label="Como deseja prosseguir?"
                                options={[
                                    { value: 'solicitar', label: 'Solicitar emissão pelo PodeAssinar (+ taxas cartorárias)' },
                                    { value: 'providenciar', label: formData.hasMatricula === 'antiga' ? 'Tenho uma antiga, mas irei providenciar a atualização por conta própria' : 'Vou providenciar a certidão por conta própria' },
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
    );
}
