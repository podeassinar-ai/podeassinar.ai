import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import Link from 'next/link';
import { getActiveSubscriptionAction, checkSubscriptionCreditsAction } from '@app/actions/subscription-actions';
import { formatPlanPrice } from '@domain/entities/plan';
import { redirect } from 'next/navigation';
import { createClient } from '@infrastructure/database/supabase-server';
import { CancelSubscriptionButton } from './components/CancelSubscriptionButton';

export default async function MinhaAssinaturaPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect_to=/minha-assinatura');
    }

    const params = await searchParams;
    const showSuccess = params.success === 'true';
    const subscription = await getActiveSubscriptionAction();
    const creditInfo = await checkSubscriptionCreditsAction();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    };

    const percentageUsed = ((creditInfo.totalCredits - creditInfo.remainingCredits) / creditInfo.totalCredits) * 100;
    const percentageRemaining = 100 - percentageUsed;

    return (
        <>
            <Topbar />
            <MainContainer>
                <div className="max-w-5xl mx-auto py-8">
                    {/* Header */}
                    <div className="mb-10 animate-fade-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-text-primary">Minha Assinatura</h1>
                        </div>
                        <p className="text-text-secondary text-lg ml-11">Gerencie seu plano e acompanhe o consumo de créditos.</p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start gap-4 animate-fade-up">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-green-800 text-lg">Assinatura ativada com sucesso!</h3>
                                <p className="text-green-700 mt-1">
                                    Seus créditos já estão disponíveis. Você pode começar uma nova análise agora mesmo.
                                </p>
                            </div>
                        </div>
                    )}

                    {subscription && subscription.plan ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
                            {/* Left Column: Plan Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold text-text-primary">{subscription.plan.name}</h2>
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
                                                    Ativo
                                                </span>
                                            </div>
                                            <p className="text-text-secondary text-lg">{subscription.plan.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-text-primary">{formatPlanPrice(subscription.plan)}</p>
                                            <p className="text-sm text-text-muted font-medium">/mês</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Ciclo Atual</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-text-primary font-medium">Início: {formatDate(subscription.currentPeriodStart)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Próxima Renovação</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span className="text-text-primary font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                        <Link href="/planos" className="flex-1">
                                            <Button variant="secondary" className="w-full justify-center">
                                                Alterar Plano
                                            </Button>
                                        </Link>
                                        <div className="flex-1">
                                            <CancelSubscriptionButton
                                                subscriptionId={subscription.id}
                                                currentPeriodEnd={subscription.currentPeriodEnd}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Credits */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Saldo de Créditos
                                    </h3>

                                    <div className="flex flex-col items-center justify-center mb-8">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="60"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    className="text-white/10"
                                                />
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="60"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    strokeDasharray={377}
                                                    strokeDashoffset={377 - (377 * percentageRemaining) / 100}
                                                    className="text-primary transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold">{creditInfo.remainingCredits}</span>
                                                <span className="text-xs text-white/60">restantes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-white/80">
                                        <div className="flex justify-between">
                                            <span>Total do Plano</span>
                                            <span className="font-bold">{creditInfo.totalCredits}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Utilizados</span>
                                            <span className="font-bold">{creditInfo.totalCredits - creditInfo.remainingCredits}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <Link href="/diagnostico">
                                            <button className="w-full py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg active:transform active:scale-95">
                                                Usar Crédito
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* No Subscription State */
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto animate-fade-up">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-3">Nenhuma assinatura ativa</h2>
                            <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                                Assine um plano e tenha acesso a pacotes de due diligences com preços reduzidos e prioridade na análise.
                            </p>
                            <Link href="/planos">
                                <Button variant="primary" size="lg" className="shadow-lg shadow-primary/25">
                                    Ver Planos Disponíveis
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </MainContainer>
        </>
    );
}
