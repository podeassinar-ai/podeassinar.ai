import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@ui/components/common';
import { checkSubscriptionCreditsAction, consumeSubscriptionCreditAction } from '../../actions/subscription-actions';
import { mapGenericError } from '@/utils/error-mapping';
import { PaymentStepProps } from '../types';

export function PaymentStep({ transactionId, matriculaOption, loading, onPaymentClick, addToast }: PaymentStepProps) {
    const router = useRouter();
    const [creditInfo, setCreditInfo] = useState<{
        hasActiveSubscription: boolean;
        hasAvailableCredits: boolean;
        remainingCredits: number;
        totalCredits: number;
        planName?: string;
    } | null>(null);
    const [checkingCredits, setCheckingCredits] = useState(true);
    const [usingCredit, setUsingCredit] = useState(false);

    useEffect(() => {
        async function checkCredits() {
            try {
                const info = await checkSubscriptionCreditsAction();
                setCreditInfo(info);
            } catch (err) {
                console.error('Error checking credits:', err);
            } finally {
                setCheckingCredits(false);
            }
        }
        checkCredits();
    }, []);

    const handleUseCredit = async () => {
        if (!transactionId) return;

        setUsingCredit(true);
        try {
            const result = await consumeSubscriptionCreditAction(transactionId);
            if (result.success) {
                addToast('Crédito utilizado com sucesso! Sua análise será processada.', 'success');
                router.push('/meus-diagnosticos');
            } else {
                addToast(result.message || 'Erro ao usar crédito', 'error');
            }
        } catch (err: any) {
            addToast('Erro ao usar crédito: ' + mapGenericError(err.message), 'error');
        } finally {
            setUsingCredit(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Subscription Credit Option */}
            {!checkingCredits && creditInfo?.hasAvailableCredits && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-xl animate-fade-up ring-4 ring-primary/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">Usar crédito do plano</h3>
                                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20 uppercase tracking-wide">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-white/80 mb-6">
                                Você tem <strong>{creditInfo.remainingCredits}</strong> análises disponíveis no seu plano <strong>{creditInfo.planName}</strong>.
                                <br className="hidden sm:block" /> Aproveite para usar agora sem custo adicional.
                            </p>

                            <Button
                                variant="primary"
                                onClick={handleUseCredit}
                                loading={usingCredit}
                                disabled={usingCredit || loading}
                                className="w-full sm:w-auto px-8 py-3 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                            >
                                Usar 1 Crédito (Grátis)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Regular Payment Option */}
            <Card className="bg-white">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">
                        {creditInfo?.hasAvailableCredits ? 'Ou pague normalmente' : 'Confirmação da Análise'}
                    </h3>
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

                        {matriculaOption === 'solicitar' && (
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
                                R$ {matriculaOption === 'solicitar' ? '350,00' : '300,00'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    variant={creditInfo?.hasAvailableCredits ? 'secondary' : 'primary'}
                    size="lg"
                    className="w-full py-4 text-lg"
                    onClick={onPaymentClick}
                    loading={loading}
                    disabled={usingCredit}
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
    );
}
