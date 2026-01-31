import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Card, Button, Alert } from '@ui/components/common';
import Link from 'next/link';

const transactionTypes = [
  {
    id: 'PURCHASE',
    title: 'Comprar Imóvel',
    description: 'Análise jurídica para aquisição de propriedade',
    icon: '🏠',
  },
  {
    id: 'SALE',
    title: 'Vender Imóvel',
    description: 'Verificação de regularidade para venda',
    icon: '💰',
  },
  {
    id: 'FINANCING',
    title: 'Financiar',
    description: 'Diagnóstico para financiamento bancário',
    icon: '🏦',
  },
  {
    id: 'RENTAL',
    title: 'Alugar',
    description: 'Análise para locação residencial ou comercial',
    icon: '🔑',
  },
  {
    id: 'REGULARIZATION',
    title: 'Regularizar',
    description: 'Identificação de pendências e caminhos de regularização',
    icon: '📋',
  },
];

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <MainContainer
        title="Bem-vindo ao PodeAssinar.ai"
        subtitle="Diagnóstico jurídico imobiliário inteligente"
      >
        <Alert variant="info" className="mb-8">
          <p>
            Nosso diagnóstico analisa a situação jurídica do seu imóvel, identifica riscos e sugere
            caminhos de regularização. O valor é de <strong>R$ 300,00</strong> por diagnóstico.
          </p>
        </Alert>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            O que você deseja fazer?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactionTypes.map((type) => (
            <Link key={type.id} href={`/diagnostico?tipo=${type.id}`}>
              <Card className="h-full hover:shadow-dropdown transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">{type.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Dúvidas? Entre em contato: contato@podeassinar.ai
          </p>
        </div>
      </MainContainer>
    </>
  );
}
