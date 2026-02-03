import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import Link from 'next/link';
import { getAvailablePlansAction } from '@app/actions/subscription-actions';
import { formatPlanPrice, getPricePerDiagnosis, Plan } from '@domain/entities/plan';

function PlanCard({ plan, isPopular }: { plan: Plan; isPopular?: boolean }) {
    const pricePerDiagnosis = getPricePerDiagnosis(plan);
    const formattedPrice = formatPlanPrice(plan);
    const formattedPricePerDiag = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(pricePerDiagnosis / 100);

    return (
        <div className={`relative bg-white rounded-2xl border ${isPopular ? 'border-primary shadow-glow' : 'border-border'} p-8 flex flex-col h-full`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MAIS POPULAR
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <p className="text-sm text-text-secondary">{plan.description}</p>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-text-primary">{formattedPrice}</span>
                    <span className="text-sm text-text-muted">/mês</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                    {formattedPricePerDiag} por diagnóstico
                </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>{plan.diagnosesPerCycle}</strong> diagnósticos por mês</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Acesso prioritário à análise</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Suporte dedicado</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Histórico completo de análises</span>
                </li>
            </ul>

            <Link
                href={`/planos/${plan.id}/assinar`}
                className={`w-full py-3 rounded-lg font-bold text-center transition-all ${isPopular
                        ? 'bg-primary text-white hover:bg-primary-hover'
                        : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                    }`}
            >
                Assinar Plano
            </Link>
        </div>
    );
}

export default async function PlanosPage() {
    const plans = await getAvailablePlansAction();

    // Mark the middle plan as popular (or the one with most diagnoses if 3 or more)
    const popularIndex = plans.length >= 3 ? 1 : 0;

    return (
        <>
            <Topbar />
            <MainContainer>
                {/* Header */}
                <div className="text-center mb-12 pt-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-mono font-bold tracking-wider text-primary uppercase bg-orange-50 rounded border border-orange-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        PLANOS PARA EMPRESAS
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Escolha o plano ideal para sua{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                            operação
                        </span>
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Pacotes mensais de due diligences com preços especiais para imobiliárias,
                        construtoras e escritórios de advocacia.
                    </p>
                </div>

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-text-secondary">Nenhum plano disponível no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                        {plans.map((plan, index) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isPopular={index === popularIndex}
                            />
                        ))}
                    </div>
                )}

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg border border-border p-6">
                            <h3 className="font-bold text-text-primary mb-2">Como funciona o pacote de créditos?</h3>
                            <p className="text-sm text-text-secondary">
                                Ao assinar um plano, você recebe uma quantidade fixa de créditos para usar durante o mês.
                                Cada diagnóstico consome um crédito. Os créditos são renovados automaticamente a cada ciclo de cobrança.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-border p-6">
                            <h3 className="font-bold text-text-primary mb-2">Posso cancelar a qualquer momento?</h3>
                            <p className="text-sm text-text-secondary">
                                Sim! Você pode cancelar sua assinatura a qualquer momento. Os créditos restantes
                                continuarão válidos até o fim do período já pago.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg border border-border p-6">
                            <h3 className="font-bold text-text-primary mb-2">E se eu precisar de mais créditos?</h3>
                            <p className="text-sm text-text-secondary">
                                Você pode fazer upgrade para um plano maior a qualquer momento, ou comprar
                                diagnósticos avulsos pelo preço normal de R$ 300,00 cada.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-primary to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Precisa de um plano personalizado?
                    </h2>
                    <p className="text-white/80 mb-6 max-w-xl mx-auto">
                        Para operações com mais de 50 diagnósticos por mês, entre em contato
                        para discutirmos um plano sob medida para sua empresa.
                    </p>
                    <a
                        href="mailto:contato@podeassinar.ai"
                        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Falar com Comercial
                    </a>
                </div>
            </MainContainer>
        </>
    );
}
