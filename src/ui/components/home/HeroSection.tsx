import Link from 'next/link';

interface HeroSectionProps {
    getDiagnosticoHref: (id?: string) => string;
}

export function HeroSection({ getDiagnosticoHref }: HeroSectionProps) {
    return (
        <div className="relative mb-24 py-12 md:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                {/* Text Content */}
                <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-mono font-bold tracking-wider text-primary uppercase bg-orange-50 rounded-full border border-orange-100 shadow-sm animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        AI ENGINE V2.0 ONLINE
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tighter mb-8 leading-[1.1] animate-fade-in-up">
                        Assine com <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                            Segurança Jurídica
                        </span> Total.
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-xl mb-10 leading-relaxed font-normal animate-fade-in-up delay-100">
                        Due Diligence imobiliária avançada. Nossa IA processa, especialistas validam, e você fecha negócio sem riscos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up delay-200">
                        <Link href={getDiagnosticoHref()} className="w-full sm:w-auto">
                            <button className="btn-primary w-full sm:w-auto text-lg px-8 py-5 flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all rounded-xl">
                                <span>Iniciar Análise</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </Link>
                        <a href="#como-funciona" className="btn-secondary w-full sm:w-auto text-lg px-8 py-5 text-center font-medium flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all rounded-xl text-gray-700">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ver Demo
                        </a>
                    </div>

                    {/* Trust Bar */}
                    <div className="mt-12 flex items-center gap-8 text-sm font-medium text-gray-500 animate-fade-in-up delay-300">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${i * 100} flex items-center justify-center bg-gray-200`}>
                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                            <span>+2k análises realizadas</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Validado por Advogados</span>
                        </div>
                    </div>
                </div>

                {/* Tech Visual / Document X-Ray */}
                <div className="flex-1 w-full max-w-lg relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-20 animate-pulse-slow"></div>

                    {/* Main Container - Dark Glass Effect */}
                    <div className="relative bg-[#0F172A] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden h-[420px] flex items-center justify-center">

                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}></div>

                        {/* Document Simulation */}
                        <div className="relative bg-white w-[260px] h-[340px] shadow-2xl rounded-sm p-6 flex flex-col gap-4 transform rotate-1 z-10">
                            {/* Header Mockup */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-24 h-2 bg-gray-200 rounded"></div>
                                    <div className="w-16 h-2 bg-gray-100 rounded"></div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200 w-full mb-2"></div>

                            {/* Text Lines */}
                            <div className="space-y-2.5">
                                <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                                <div className="w-11/12 h-1.5 bg-gray-100 rounded"></div>
                                <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                                <div className="w-4/5 h-1.5 bg-gray-100 rounded"></div>

                                {/* Highlight: Risk */}
                                <div className="relative py-0.5 -mx-1 px-1 bg-red-50 rounded border border-red-100">
                                    <div className="w-full h-1.5 bg-red-200 rounded mb-1"></div>
                                    <div className="w-3/4 h-1.5 bg-red-200 rounded"></div>

                                    {/* Connector Dot */}
                                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-red-500 rounded-full translate-x-1/2 ring-2 ring-white"></div>
                                </div>

                                <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                                <div className="w-10/12 h-1.5 bg-gray-100 rounded"></div>

                                {/* Highlight: Success */}
                                <div className="relative py-0.5 -mx-1 px-1 bg-green-50 rounded border border-green-100 mt-2">
                                    <div className="w-11/12 h-1.5 bg-green-200 rounded"></div>

                                    {/* Connector Dot */}
                                    <div className="absolute left-0 top-1/2 w-2 h-2 bg-green-500 rounded-full -translate-x-1/2 ring-2 ring-white"></div>
                                </div>

                                <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                            </div>

                            {/* Stamp */}
                            <div className="absolute bottom-6 right-6 w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center transform -rotate-12 opacity-50">
                                <span className="text-[10px] font-bold text-primary uppercase">Validado</span>
                            </div>

                            {/* Scan Line Animation */}
                            <div className="absolute inset-0 w-full h-[20%] bg-gradient-to-b from-transparent via-primary/20 to-primary/40 border-b-2 border-primary animate-scan pointer-events-none z-20 mix-blend-multiply"></div>
                        </div>

                        {/* Floating Cards (Popups) */}

                        {/* Card 1: Risk Alert */}
                        <div className="absolute top-1/3 right-4 transform translate-x-0 sm:translate-x-4 bg-white p-3 rounded-lg shadow-xl border-l-4 border-red-500 animate-bounce-slow z-30 max-w-[140px]">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-[10px]">!</div>
                                <span className="text-xs font-bold text-gray-900">Alerta</span>
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight">Penhora na Av.05 detectada</div>
                            <div className="absolute -left-2 top-1/2 w-2 h-[1px] bg-red-500/50"></div>
                        </div>

                        {/* Card 2: Success Check */}
                        <div className="absolute bottom-1/4 left-4 transform translate-x-0 sm:-translate-x-4 bg-white p-3 rounded-lg shadow-xl border-l-4 border-green-500 animate-bounce-slow z-30 max-w-[140px]" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[10px]">✓</div>
                                <span className="text-xs font-bold text-gray-900">Aprovado</span>
                            </div>
                            <div className="text-[10px] text-gray-500 leading-tight">Cadeia dominial íntegra</div>
                            <div className="absolute -right-2 top-1/2 w-2 h-[1px] bg-green-500/50"></div>
                        </div>

                        {/* Overlay UI Elements */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            {/* Empty for balance or future use */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
