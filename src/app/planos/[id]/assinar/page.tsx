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
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3"></div>
            </div>

            <MainContainer>
                <div className="max-w-xl mx-auto py-8">
                    {/* Header */}
                    <div className="text-center mb-10 animate-fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-mono font-bold tracking-wider text-green-700 uppercase bg-green-50 rounded-full border border-green-200 shadow-sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            AMBIENTE SEGURO
                        </div>
                        <h1 className="text-3xl font-bold text-text-primary mb-3">
                            Confirmar Assinatura
                        </h1>
                        <p className="text-text-secondary text-lg">
                            Você está a um passo de automatizar suas análises.
                        </p>
                    </div>

                    {/* Checkout Card - Glassmorphism */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary mb-1">{plan.name}</h2>
                                <p className="text-text-secondary">{plan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-extrabold text-primary">{formatPlanPrice(plan)}</p>
                                <p className="text-sm font-medium text-text-muted">/{billingCycleLabel}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-text-primary">
                                    <strong>{plan.diagnosesPerCycle}</strong> diagnósticos mensais
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-text-primary">Renovação automática</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-text-primary">Cancelamento sem multa</span>
                            </div>
                        </div>

                        {/* Terms Notice */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-text-secondary leading-relaxed">
                            <p>
                                Ao clicar em "Pagar Agora", você será redirecionado para o checkout seguro da Stripe.
                                Sua assinatura de {formatPlanPrice(plan)} será cobrada a cada {billingCycleLabel}.
                            </p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700 animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full text-lg h-14 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
                                onClick={handleSubscribe}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Redirecionando...
                                    </span>
                                ) : (
                                    'Pagar Agora'
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full text-text-muted hover:text-text-primary"
                                onClick={() => router.push('/planos')}
                                disabled={submitting}
                            >
                                Cancelar e Voltar
                            </Button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-text-muted flex items-center justify-center gap-4 opacity-70">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                            Pagamento Criptografado
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" /></svg>
                            Satisfação Garantida
                        </span>
                    </p>
                </div>
            </MainContainer>
        </>
    );
}
