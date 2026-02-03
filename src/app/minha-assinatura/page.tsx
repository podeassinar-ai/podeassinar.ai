import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button } from '@ui/components/common';
import Link from 'next/link';
import { getActiveSubscriptionAction, checkSubscriptionCreditsAction } from '@app/actions/subscription-actions';
import { formatPlanPrice } from '@domain/entities/plan';
import { redirect } from 'next/navigation';
import { createClient } from '@infrastructure/database/supabase-server';

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
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <>
            <Topbar />
            <MainContainer>
                <div className="max-w-2xl mx-auto py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Minha Assinatura</h1>
                        <p className="text-text-secondary">Gerencie sua assinatura e acompanhe seus créditos</p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-bold text-green-800">Assinatura ativada com sucesso!</p>
                                <p className="text-sm text-green-700">Seus créditos já estão disponíveis para uso.</p>
                            </div>
                        </div>
                    )}

                    {subscription && subscription.plan ? (
                        <>
                            {/* Active Subscription Card */}
                            <div className="bg-white rounded-xl border border-border p-6 mb-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl font-bold text-text-primary">{subscription.plan.name}</h2>
                                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                                ATIVO
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary">{subscription.plan.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">{formatPlanPrice(subscription.plan)}</p>
                                        <p className="text-xs text-text-muted">/mês</p>
                                    </div>
                                </div>

                                {/* Credits Usage */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-text-secondary">Créditos Utilizados</span>
                                        <span className="text-sm font-bold text-text-primary">
                                            {creditInfo.remainingCredits} de {creditInfo.totalCredits} restantes
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${((creditInfo.totalCredits - creditInfo.remainingCredits) / creditInfo.totalCredits) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Subscription Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-text-muted mb-1">Início do período</p>
                                        <p className="font-medium text-text-primary">{formatDate(subscription.currentPeriodStart)}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted mb-1">Próxima renovação</p>
                                        <p className="font-medium text-text-primary">{formatDate(subscription.currentPeriodEnd)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/diagnostico" className="flex-1">
                                    <Button variant="primary" className="w-full">
                                        Nova Due Diligence
                                    </Button>
                                </Link>
                                <Link href="/planos" className="flex-1">
                                    <Button variant="secondary" className="w-full">
                                        Alterar Plano
                                    </Button>
                                </Link>
                            </div>

                            {/* Cancel Section */}
                            <div className="mt-8 pt-8 border-t border-border">
                                <h3 className="text-sm font-bold text-text-primary mb-2">Cancelar Assinatura</h3>
                                <p className="text-sm text-text-secondary mb-4">
                                    Ao cancelar, você ainda terá acesso aos créditos restantes até o fim do período atual
                                    ({formatDate(subscription.currentPeriodEnd)}).
                                </p>
                                <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50">
                                    Cancelar Assinatura
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* No Subscription State */
                        <div className="bg-white rounded-xl border border-border p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-text-primary mb-2">Nenhuma assinatura ativa</h2>
                            <p className="text-text-secondary mb-6 max-w-md mx-auto">
                                Assine um plano e economize em suas due diligences. Pacotes mensais com preços especiais para empresas.
                            </p>
                            <Link href="/planos">
                                <Button variant="primary">
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
