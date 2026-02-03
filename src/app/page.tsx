import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSlugFromId } from '@/ui/constants/transactions';

// Icons as components for cleaner usage
const Icons = {
  Purchase: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sale: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Rental: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a6 6 0 01-1.414 0l-.707-.707a6 6 0 01-1.414 0l-.707-.707a6 6 0 01-1.414 0L5.343 14.257A6 6 0 1111 8.243L11.001 8.243A5.996 5.996 0 0115 7z" />
    </svg>
  ),
  Regularization: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Donation: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  Exchange: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  BuiltToSuit: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  SurfaceRight: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  RuralLease: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Guarantees: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  FiduciaryAlienation: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  ),
  CapitalIntegration: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const transactionTypes = [
  {
    id: 'REGULARIZATION',
    title: 'Regularização',
    subtitle: 'Resolução de pendências',
    gradient: 'from-amber-500 to-orange-500',
    icon: Icons.Regularization,
  },
  {
    id: 'PURCHASE',
    title: 'Compra e Venda',
    subtitle: 'Segurança na aquisição',
    gradient: 'from-orange-500 to-red-500',
    icon: Icons.Purchase,
  },
  {
    id: 'RENTAL',
    title: 'Aluguel',
    subtitle: 'Risco de inquilinato',
    gradient: 'from-purple-500 to-pink-500',
    icon: Icons.Rental,
  },
  {
    id: 'DONATION',
    title: 'Doação',
    subtitle: 'Transferência gratuita',
    gradient: 'from-pink-500 to-rose-500',
    icon: Icons.Donation,
  },
  {
    id: 'EXCHANGE',
    title: 'Permuta',
    subtitle: 'Troca de imóveis',
    gradient: 'from-cyan-500 to-blue-500',
    icon: Icons.Exchange,
  },
  {
    id: 'BUILT_TO_SUIT',
    title: 'Built-to-suit',
    subtitle: 'Locação sob medida',
    gradient: 'from-indigo-500 to-purple-500',
    icon: Icons.BuiltToSuit,
  },
  {
    id: 'SURFACE_RIGHT',
    title: 'Direito Real de Superfície',
    subtitle: 'Uso do solo',
    gradient: 'from-teal-500 to-emerald-500',
    icon: Icons.SurfaceRight,
  },
  {
    id: 'RURAL_LEASE',
    title: 'Arrendamento Rural',
    subtitle: 'Contratos agrários',
    gradient: 'from-green-500 to-lime-500',
    icon: Icons.RuralLease,
  },
  {
    id: 'GUARANTEES',
    title: 'Garantias',
    subtitle: 'Hipoteca e penhor',
    gradient: 'from-blue-600 to-indigo-600',
    icon: Icons.Guarantees,
  },
  {
    id: 'FIDUCIARY',
    title: 'Alienação Fiduciária',
    subtitle: 'Garantia de imóvel',
    gradient: 'from-slate-600 to-gray-600',
    icon: Icons.FiduciaryAlienation,
  },
  {
    id: 'CAPITAL',
    title: 'Integralização de Capital',
    subtitle: 'Aporte em empresa',
    gradient: 'from-emerald-600 to-green-600',
    icon: Icons.CapitalIntegration,
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const getDiagnosticoHref = (id?: string) => {
    let slug = '';
    if (id) {
      slug = getSlugFromId(id);
    }
    const base = slug ? `/diagnostico?tipo=${slug}` : '/diagnostico';
    return isAuthenticated ? base : `/login?redirect_to=${encodeURIComponent(base)}`;
  };

  return (
    <>
      <Topbar />
      <MainContainer>
        {/* Hero Section */}
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

        {/* Brand/Social Proof Section 
        <div className="py-10 border-y border-gray-100 mb-20 bg-gray-50/50 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12">
            <div className="text-center mb-8">
               <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase font-mono">Tecnologia reconhecida em</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="text-xl font-black text-gray-800 tracking-tighter">TECHKRUNCH</span>
               <span className="text-xl font-serif font-bold text-gray-800 italic">LegalTimes</span>
               <span className="text-xl font-bold text-gray-800 tracking-wide">PROPTECH</span>
               <span className="text-xl font-bold text-gray-800 flex items-center gap-1">
                  <span className="w-6 h-6 bg-gray-800 rounded-sm"></span>
                  BLOCKDATA
               </span>
            </div>
        </div>
        */}

        {/* Services Grid Section */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Qual transação você deseja blindar?</h2>
            <p className="text-lg text-gray-600">Selecione o tipo de negócio imobiliário para iniciar a análise jurídica automática.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {transactionTypes.map((type, index) => (
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

        {/* The PodeAssinar Edge / 4 Pillars */}
        <div className="mb-24 relative">
          {/* Decorative Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-gray-50/50 to-transparent -z-10 rounded-full blur-3xl"></div>

          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs font-mono mb-2 block">Por que usar?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Muito mais que um check-list</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: "Status Real",
                desc: "Saiba exatamente em que pé está a documentação do imóvel."
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
                title: "Mapa de Riscos",
                desc: "Identificamos penhoras, dívidas e fraudes ocultas na matrícula."
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" /></svg>,
                title: "Caminhos",
                desc: "Não apontamos só o problema. Dizemos como resolver."
              },
              {
                icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: "Custos",
                desc: "Estimativa clara de quanto vai custar regularizar ou transferir."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Problem Solver */}
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

        {/* Final CTA */}
        <div className="text-center py-16 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Pronto para fechar negócio?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Não assine nada antes de passar pelo crivo da nossa inteligência jurídica.</p>
          <Link href={getDiagnosticoHref()}>
            <button className="btn-primary text-xl px-12 py-5 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Começar Due Diligence
            </button>
          </Link>
        </div>

      </MainContainer>
    </>
  );
}