import Link from 'next/link';

interface CertificateSolverSectionProps {
    getDiagnosticoHref: (id?: string) => string;
}

export function CertificateSolverSection({ getDiagnosticoHref }: CertificateSolverSectionProps) {
    return (
        <div className="bg-[#1E293B] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden mb-20 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}></div>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1">
                    <div className="inline-block bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-white/80">
                        Workaround Automático
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">
                        Sem certidão atualizada? <br />
                        <span className="text-primary">Sem problema.</span>
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                        Sabemos que conseguir uma matrícula atualizada é chato. Se você não tiver, nós buscamos no cartório para você durante o processo.
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                            <span className="text-gray-300">Conexão direta com cartórios</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                            <span className="text-gray-300">Menor custo de despachante</span>
                        </li>
                    </ul>

                    <Link href={getDiagnosticoHref()}>
                        <button className="bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                            Resolver Agora
                        </button>
                    </Link>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute -inset-4 bg-primary/30 rounded-full blur-3xl"></div>
                        <div className="relative bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-4 border-b border-gray-700 pb-4">
                                <div className="w-12 h-12 bg-gray-700/50 border border-gray-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">1º Registro de Imóveis</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <div className="text-xs text-green-400 font-mono tracking-wide uppercase">CONECTADO • VIA API</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-gray-700 rounded w-full"></div>
                                <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                                <div className="h-2 bg-gray-700 rounded w-4/6"></div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">EMISSÃO CONCLUÍDA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
