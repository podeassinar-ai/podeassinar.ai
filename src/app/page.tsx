import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  const getDiagnosticoHref = (tipo?: string) => {
    const base = tipo ? `/diagnostico?tipo=${tipo}` : '/diagnostico';
    return isAuthenticated ? base : `/login?redirect_to=${encodeURIComponent(base)}`;
  };

  return (
    <>
      <Sidebar />
      <MainContainer>
        {/* Hero Section */}
        <div className="relative mb-20 py-8 md:py-16">
           <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Text Content */}
              <div className="flex-1 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-mono font-bold tracking-wider text-primary uppercase bg-orange-50 rounded border border-orange-100">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  AI POWERED ENGINE v2.0
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight mb-6 leading-tight">
                  Due Diligence <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                    Imobiliária com IA
                  </span>
                </h1>
                
                <p className="text-lg text-text-secondary max-w-xl mb-8 leading-relaxed font-medium">
                  Automatize a análise de riscos jurídicos em transações imobiliárias. Processamento de documentos em segundos, validado por especialistas.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={getDiagnosticoHref()}>
                    <button className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center gap-2 group">
                      Iniciar Due Diligence
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </Link>
                  <a href="#como-funciona" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 text-center font-mono text-sm flex items-center justify-center">
                    <span className="text-xs text-gray-400 mr-2">01</span>
                    COMO_FUNCIONA
                  </a>
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
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                         <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10">
                            SCANNING_MODE: ACTIVE
                         </div>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-150"></div>
                         </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-text-primary">Selecione o Tipo de Análise</h2>
             <span className="text-xs font-mono text-primary bg-orange-50 px-2 py-1 rounded border border-orange-100">MODO: ONLINE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {transactionTypes.map((type, index) => (
              <Link key={type.id} href={getDiagnosticoHref(type.id)}>
                <div 
                  className="group relative overflow-hidden bg-white border border-border rounded-2xl p-6 hover:shadow-glow hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer min-h-[140px]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon />
                  </div>
                  <h3 className="font-bold text-text-primary text-sm mb-1 leading-tight">{type.title}</h3>
                  
                  {/* Tech decoration */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-green-400 transition-colors"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div id="como-funciona" className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden mt-12">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block mb-2 text-xs font-mono text-primary font-bold tracking-widest uppercase">Pipeline de Processamento</div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                Como funciona a Due Diligence IA?
              </h3>
              <ul className="space-y-4">
                {[
                  'Extração de dados via OCR (Reconhecimento Óptico)',
                  'Cruzamento com 50+ bases de dados jurídicos',
                  'Detecção de padrões de fraude e riscos ocultos',
                  'Revisão humana final para garantia de qualidade'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded bg-white border border-border flex items-center justify-center font-mono text-xs text-gray-500 group-hover:text-primary group-hover:border-primary transition-colors">
                       0{i + 1}
                    </div>
                    <span className="text-text-secondary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Stats Card */}
            <div className="w-full md:w-auto bg-white p-8 rounded-2xl shadow-xl border border-border relative">
               <div className="absolute -top-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg font-mono">
                  LIVE DATA
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                     <p className="text-3xl font-bold text-gray-900 font-mono">98.5%</p>
                     <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Precisão</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-bold text-gray-900 font-mono">Inst.</p>
                     <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Análise IA</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}