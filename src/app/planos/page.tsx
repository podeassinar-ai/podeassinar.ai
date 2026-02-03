import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import Link from 'next/link';
import { getAvailablePlansAction } from '@app/actions/subscription-actions';
import { formatPlanPrice, getPricePerDiagnosis, Plan } from '@domain/entities/plan';

function PlanCard({ plan, isPopular, index }: { plan: Plan; isPopular?: boolean; index: number }) {
    const pricePerDiagnosis = getPricePerDiagnosis(plan);
    const formattedPrice = formatPlanPrice(plan);
    const formattedPricePerDiag = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(pricePerDiagnosis / 100);

    const standardPrice = 30000; // R$ 300,00 in cents
    const savingsPercent = Math.round(((standardPrice - pricePerDiagnosis) / standardPrice) * 100);

    return (
        <div
            className={`
                relative bg-white rounded-2xl border p-8 flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                animate-fade-up opacity-0
                ${isPopular
                    ? 'border-primary shadow-glow ring-2 ring-primary/10'
                    : 'border-border hover:border-primary/30'}
            `}
            style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'forwards' }}
        >
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                    Mais Popular
                </div>
            )}

            {savingsPercent > 0 && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                    ECONOMIZE {savingsPercent}%
                </div>
            )}

            <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-1">{plan.name}</h3>
                <p className="text-sm text-text-secondary h-10 overflow-hidden">{plan.description}</p>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-text-primary tracking-tight">{formattedPrice}</span>
                    <span className="text-sm text-text-muted font-medium">/mês</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
                        {formattedPricePerDiag} / diagnóstico
                    </span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span>
                        <strong className="text-text-primary block text-base">{plan.diagnosesPerCycle} diagnósticos</strong>
                        <span className="text-xs">renovados mensalmente</span>
                    </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span>Acesso prioritário à IA</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span>Relatórios em PDF instantâneos</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span>Dashboard de gestão</span>
                </li>
            </ul>

            <Link
                href={`/planos/${plan.id}/assinar`}
                className={`
                    w-full py-4 rounded-xl font-bold text-center transition-all duration-300
                    ${isPopular
                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg hover:shadow-orange-200 hover:-translate-y-1'
                        : 'bg-gray-50 text-text-primary hover:bg-gray-100 border border-gray-200 hover:border-gray-300'}
                `}
            >
                Começar Agora
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
            <div className="relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>

                <MainContainer>
                    {/* Header */}
                    <div className="text-center mb-16 pt-8 animate-fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-mono font-bold tracking-wider text-primary uppercase bg-primary/5 rounded-full border border-primary/10">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            PARA IMOBILIÁRIAS E ADVOGADOS
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-6 tracking-tight">
                            Escale sua operação com{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                                inteligência
                            </span>
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Aumente sua produtividade na análise de documentos imobiliários.
                            Escolha o pacote ideal e reduza seus custos operacionais.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    {plans.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-text-primary">Ops, nenhum plano disponível no momento.</p>
                            <p className="text-text-muted">Entre em contato com nosso suporte.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20 px-4">
                            {plans.map((plan, index) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    isPopular={index === popularIndex}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto mb-20 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards', opacity: 0 }}>
                        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">Dúvidas Frequentes</h2>
                        <div className="grid gap-4">
                            {[
                                {
                                    q: 'Como funciona o pacote de créditos?',
                                    a: 'Ao assinar um plano, você recebe uma quantidade fixa de créditos mensais. Cada análise jurídica consome 1 crédito. Se não usar todos, eles expiram no fim do ciclo.'
                                },
                                {
                                    q: 'Posso cancelar a qualquer momento?',
                                    a: 'Sim! Sua assinatura pode ser cancelada a qualquer momento através do painel. Você continuará com acesso aos créditos até o fim do período já pago.'
                                },
                                {
                                    q: 'E se eu precisar de mais créditos?',
                                    a: 'Você pode fazer upgrade de plano instantaneamente (pagando a diferença pro-rata) ou comprar análises avulsas diretamente na plataforma.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
                                    <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {item.q}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed ml-7">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="relative bg-text-primary rounded-3xl p-8 md:p-12 text-center text-white mb-8 overflow-hidden animate-fade-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards', opacity: 0 }}>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">
                                Precisa de um plano Enterprise?
                            </h2>
                            <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
                                Para grandes volumes (acima de 50 análises/mês) ou integração via API,
                                temos condições exclusivas para sua empresa.
                            </p>
                            <a
                                href="mailto:contato@podeassinar.ai"
                                className="inline-flex items-center gap-2 bg-white text-text-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Falar com Consultor
                            </a>
                        </div>
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
