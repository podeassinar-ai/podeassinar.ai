import Link from 'next/link';
import { transactionTypes } from '@ui/constants/home-content';

interface ServicesGridProps {
    getDiagnosticoHref: (id?: string) => string;
}

export function ServicesGrid({ getDiagnosticoHref }: ServicesGridProps) {
    return (
        <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Qual transação você deseja blindar?</h2>
                <p className="text-lg text-gray-600">Selecione o tipo de negócio imobiliário para iniciar a análise jurídica automática.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {transactionTypes.map((type) => (
                    <Link key={type.id} href={getDiagnosticoHref(type.id)}>
                        <div
                            className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer min-h-[180px]"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-white`}>
                                <type.icon />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight group-hover:text-primary transition-colors">{type.title}</h3>
                            <p className="text-xs text-gray-500 font-medium">{type.subtitle}</p>

                            {/* Corner Accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50 to-transparent -mr-8 -mt-8 rounded-full group-hover:from-primary/10 transition-all"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
