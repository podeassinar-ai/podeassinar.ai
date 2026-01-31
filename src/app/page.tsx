import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import Link from 'next/link';

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
  Financing: () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
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
};

const transactionTypes = [
  {
    id: 'PURCHASE',
    title: 'Comprar',
    subtitle: 'Segurança na aquisição',
    gradient: 'from-orange-500 to-red-500',
    icon: Icons.Purchase,
  },
  {
    id: 'SALE',
    title: 'Vender',
    subtitle: 'Regularidade documental',
    gradient: 'from-blue-500 to-indigo-500',
    icon: Icons.Sale,
  },
  {
    id: 'FINANCING',
    title: 'Financiar',
    subtitle: 'Análise de crédito',
    gradient: 'from-emerald-500 to-teal-500',
    icon: Icons.Financing,
  },
  {
    id: 'RENTAL',
    title: 'Alugar',
    subtitle: 'Locação segura',
    gradient: 'from-purple-500 to-pink-500',
    icon: Icons.Rental,
  },
  {
    id: 'REGULARIZATION',
    title: 'Regularizar',
    subtitle: 'Resolução de pendências',
    gradient: 'from-amber-500 to-orange-500',
    icon: Icons.Regularization,
  },
];

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <MainContainer>
        {/* Hero Section */}
        <div className="relative mb-16 py-8 md:py-12">
          {/* Decorative Blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-40 animate-pulse delay-75 pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-primary uppercase bg-orange-50 rounded-full border border-orange-100">
              Inteligência Artificial Jurídica
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight mb-6 leading-tight">
              Segurança jurídica <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                para seu imóvel.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8 leading-relaxed">
              Diagnósticos automáticos, análise de riscos e relatórios validados por especialistas. Tudo em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/diagnostico">
                <button className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                  Começar Diagnóstico
                </button>
              </Link>
              <a href="#como-funciona" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 text-center">
                Como funciona?
              </a>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">O que você precisa hoje?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {transactionTypes.map((type, index) => (
              <Link key={type.id} href={`/diagnostico?tipo=${type.id}`}>
                <div 
                  className="group relative overflow-hidden bg-white border border-border rounded-2xl p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon />
                  </div>
                  <h3 className="font-bold text-text-primary text-lg mb-1">{type.title}</h3>
                  <p className="text-xs text-text-muted font-medium">{type.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div id="como-funciona" className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/50 to-orange-50/50 -z-10" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Por que usar o PodeAssinar?
              </h3>
              <ul className="space-y-4">
                {[
                  'Análise de mais de 50 bases de dados jurídicos',
                  'Relatório simplificado com semáforo de riscos',
                  'Validação final por advogados especializados',
                  'Proteção contra fraudes e dívidas ocultas'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text-secondary font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-border">
               <div className="flex items-center gap-3 mb-4 border-b border-border pb-4">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <div>
                   <p className="text-sm font-bold text-text-primary">Resultado da Análise</p>
                   <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block">COMPRA SEGURA</p>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="h-2 w-48 bg-gray-100 rounded-full"></div>
                 <div className="h-2 w-32 bg-gray-100 rounded-full"></div>
                 <div className="h-2 w-40 bg-gray-100 rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}