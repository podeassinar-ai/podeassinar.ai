'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import { getPlanByIdAction, initiateSubscriptionAction } from '@app/actions/subscription-actions';
import { Plan, formatPlanPrice } from '@domain/entities/plan';

export default function SubscriptionCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.id as string;

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPlan() {
            try {
                const planData = await getPlanByIdAction(planId);
                if (!planData) {
                    setError('Plano não encontrado');
                    return;
                }
                setPlan(planData);
            } catch (err: any) {
                setError(err.message || 'Erro ao carregar plano');
            } finally {
                setLoading(false);
            }
        }
        loadPlan();
    }, [planId]);

    const handleSubscribe = async () => {
        if (!plan) return;

        setSubmitting(true);
        setError(null);

        try {
            const result = await initiateSubscriptionAction(plan.id);
            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao iniciar assinatura');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Topbar />
                <MainContainer>
                    <div className="max-w-lg mx-auto py-12">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </MainContainer>
            </>
        );
    }

    if (error || !plan) {
        return (
            <>
                <Topbar />
                <MainContainer>
                    <div className="max-w-lg mx-auto py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-text-primary mb-2">Erro</h2>
                        <p className="text-text-secondary mb-6">{error || 'Plano não encontrado'}</p>
                        <Button variant="secondary" onClick={() => router.push('/planos')}>
                            Voltar para Planos
                        </Button>
                    </div>
                </MainContainer>
            </>
        );
    }

    const billingCycleLabel = {
        MONTHLY: 'mês',
        QUARTERLY: 'trimestre',
        YEARLY: 'ano',
    }[plan.billingCycle];

    return (
        <>
            <Topbar />
            <MainContainer>
                <div className="max-w-lg mx-auto py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-mono font-bold tracking-wider text-primary uppercase bg-orange-50 rounded border border-orange-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            CONFIRMAÇÃO
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            Confirmar Assinatura
                        </h1>
                        <p className="text-text-secondary">
                            Revise os detalhes do plano antes de prosseguir
                        </p>
                    </div>

                    {/* Plan Summary Card */}
                    <div className="bg-white rounded-xl border border-border p-6 mb-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">{plan.name}</h2>
                                <p className="text-sm text-text-secondary">{plan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{formatPlanPrice(plan)}</p>
                                <p className="text-xs text-text-muted">/{billingCycleLabel}</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-text-secondary">
                                    <strong>{plan.diagnosesPerCycle}</strong> diagnósticos por {billingCycleLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-text-secondary">Acesso prioritário à análise</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-text-secondary">Suporte dedicado</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-text-secondary">Cancele a qualquer momento</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms Notice */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-text-secondary">
                        <p>
                            Ao clicar em "Confirmar e Pagar", você concorda com nossos{' '}
                            <a href="/termos" className="text-primary hover:underline">Termos de Uso</a>
                            {' '}e{' '}
                            <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
                            Sua assinatura será renovada automaticamente a cada {billingCycleLabel}.
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => router.push('/planos')}
                            disabled={submitting}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleSubscribe}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processando...
                                </span>
                            ) : (
                                'Confirmar e Pagar'
                            )}
                        </Button>
                    </div>
                </div>
            </MainContainer>
        </>
    );
}
