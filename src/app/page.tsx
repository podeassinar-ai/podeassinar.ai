import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button, Alert } from '@ui/components/common';
import Link from 'next/link';

// Icons as components for cleaner usage
const Icons = {
  Purchase: () => (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sale: () => (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Financing: () => (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
  Rental: () => (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a6 6 0 01-1.414 0l-.707-.707a6 6 0 01-1.414 0l-.707-.707a6 6 0 01-1.414 0L5.343 14.257A6 6 0 1111 8.243L11.001 8.243A5.996 5.996 0 0115 7z" />
    </svg>
  ),
  Regularization: () => (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
};

const transactionTypes = [
  {
    id: 'PURCHASE',
    title: 'Comprar Imóvel',
    description: 'Análise jurídica para aquisição de propriedade com segurança total.',
    icon: Icons.Purchase,
  },
  {
    id: 'SALE',
    title: 'Vender Imóvel',
    description: 'Verificação de regularidade documental para facilitar a venda.',
    icon: Icons.Sale,
  },
  {
    id: 'FINANCING',
    title: 'Financiamento Bancário',
    description: 'Diagnóstico prévio para aprovação de crédito imobiliário.',
    icon: Icons.Financing,
  },
  {
    id: 'RENTAL',
    title: 'Locação Segura',
    description: 'Análise de riscos para contratos de aluguel residencial ou comercial.',
    icon: Icons.Rental,
  },
  {
    id: 'REGULARIZATION',
    title: 'Regularização',
    description: 'Identificação detalhada de pendências e mapa para regularização.',
    icon: Icons.Regularization,
  },
];

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <MainContainer
        title="Bem-vindo ao PodeAssinar"
        subtitle="Inteligência jurídica para transações imobiliárias seguras"
      >
        <div className="bg-white border border-blue-100 rounded p-6 mb-10 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-primary mt-1">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1">Como funciona?</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Nosso diagnóstico analisa automaticamente a matrícula do imóvel e dezenas de bases de dados jurídicos para identificar riscos ocultos. 
              Ao final, você recebe um relatório completo e validado por advogados.
            </p>
            <div className="text-sm font-medium text-primary bg-blue-50 inline-block px-3 py-1 rounded">
              Valor único por diagnóstico: R$ 300,00
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Inicie um novo diagnóstico
          </h2>
          <p className="text-text-secondary">Selecione o tipo de transação que deseja analisar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {transactionTypes.map((type) => (
            <Link key={type.id} href={`/diagnostico?tipo=${type.id}`}>
              <div className="group h-full bg-white border border-border rounded p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col">
                <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
                  <type.icon />
                </div>
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">
                  {type.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                  Iniciar análise 
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex justify-center">
          <p className="text-sm text-text-muted">
            Precisa de ajuda especializada? <a href="mailto:contato@podeassinar.ai" className="text-primary hover:underline">Fale com nosso time jurídico</a>
          </p>
        </div>
      </MainContainer>
    </>
  );
}