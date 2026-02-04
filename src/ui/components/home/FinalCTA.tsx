import Link from 'next/link';

interface FinalCTAProps {
    getDiagnosticoHref: (id?: string) => string;
}

export function FinalCTA({ getDiagnosticoHref }: FinalCTAProps) {
    return (
        <div className="text-center py-16 mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Pronto para fechar negócio?</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Não assine nada antes de passar pelo crivo da nossa inteligência jurídica.</p>
            <Link href={getDiagnosticoHref()}>
                <button className="btn-primary text-xl px-12 py-5 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    Começar Due Diligence
                </button>
            </Link>
        </div>
    );
}
