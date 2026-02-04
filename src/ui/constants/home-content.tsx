// Home Page Static Content
// Extracted from src/app/page.tsx for better separation of concerns

import { HomeIcons } from '@ui/components/home/HomeIcons';

export const transactionTypes = [
    {
        id: 'REGULARIZATION',
        title: 'Regularização',
        subtitle: 'Resolução de pendências',
        gradient: 'from-amber-500 to-orange-500',
        icon: HomeIcons.Regularization,
    },
    {
        id: 'PURCHASE',
        title: 'Compra e Venda',
        subtitle: 'Segurança na aquisição',
        gradient: 'from-orange-500 to-red-500',
        icon: HomeIcons.Purchase,
    },
    {
        id: 'RENTAL',
        title: 'Aluguel',
        subtitle: 'Risco de inquilinato',
        gradient: 'from-purple-500 to-pink-500',
        icon: HomeIcons.Rental,
    },
    {
        id: 'DONATION',
        title: 'Doação',
        subtitle: 'Transferência gratuita',
        gradient: 'from-pink-500 to-rose-500',
        icon: HomeIcons.Donation,
    },
    {
        id: 'EXCHANGE',
        title: 'Permuta',
        subtitle: 'Troca de imóveis',
        gradient: 'from-cyan-500 to-blue-500',
        icon: HomeIcons.Exchange,
    },
    {
        id: 'BUILT_TO_SUIT',
        title: 'Built-to-suit',
        subtitle: 'Locação sob medida',
        gradient: 'from-indigo-500 to-purple-500',
        icon: HomeIcons.BuiltToSuit,
    },
    {
        id: 'SURFACE_RIGHT',
        title: 'Direito Real de Superfície',
        subtitle: 'Uso do solo',
        gradient: 'from-teal-500 to-emerald-500',
        icon: HomeIcons.SurfaceRight,
    },
    {
        id: 'RURAL_LEASE',
        title: 'Arrendamento Rural',
        subtitle: 'Contratos agrários',
        gradient: 'from-green-500 to-lime-500',
        icon: HomeIcons.RuralLease,
    },
    {
        id: 'GUARANTEES',
        title: 'Garantias',
        subtitle: 'Hipoteca e penhor',
        gradient: 'from-blue-600 to-indigo-600',
        icon: HomeIcons.Guarantees,
    },
    {
        id: 'FIDUCIARY',
        title: 'Alienação Fiduciária',
        subtitle: 'Garantia de imóvel',
        gradient: 'from-slate-600 to-gray-600',
        icon: HomeIcons.FiduciaryAlienation,
    },
    {
        id: 'CAPITAL',
        title: 'Integralização de Capital',
        subtitle: 'Aporte em empresa',
        gradient: 'from-emerald-600 to-green-600',
        icon: HomeIcons.CapitalIntegration,
    },
];

export const pillars = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Status Real',
        desc: 'Saiba exatamente em que pé está a documentação do imóvel.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        title: 'Mapa de Riscos',
        desc: 'Identificamos penhoras, dívidas e fraudes ocultas na matrícula.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" />
            </svg>
        ),
        title: 'Caminhos',
        desc: 'Não apontamos só o problema. Dizemos como resolver.',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Custos',
        desc: 'Estimativa clara de quanto vai custar regularizar ou transferir.',
    },
];
