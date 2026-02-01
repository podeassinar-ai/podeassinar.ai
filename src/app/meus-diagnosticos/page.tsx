import { Sidebar } from '@ui/components/layout/sidebar';
import { MainContainer } from '@ui/components/layout/main-container';
import { Button, SyncPaymentButton } from '@ui/components/common';
import { TechBadge } from '@ui/components/common/tech-badge';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const transactionLabels: Record<string, string> = {
  REGULARIZATION: 'Regularização',
  PURCHASE: 'Compra e Venda',
  RENTAL: 'Aluguel',
  DONATION: 'Doação',
  EXCHANGE: 'Permuta',
  BUILT_TO_SUIT: 'Built-to-suit',
  SURFACE_RIGHT: 'Direito Real de Superfície',
  RURAL_LEASE: 'Arrendamento Rural',
  GUARANTEES: 'Garantias',
  FIDUCIARY: 'Alienação Fiduciária',
  CAPITAL: 'Integralização de Capital',
};

const statusStyles: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'outline' }> = {
  PENDING_QUESTIONNAIRE: { label: 'Aguardando Info', variant: 'warning' },
  PENDING_DOCUMENTS: { label: 'Aguardando Docs', variant: 'warning' },
  PENDING_PAYMENT: { label: 'Aguardando Pgto', variant: 'warning' },
  PROCESSING: { label: 'Em Análise IA', variant: 'default' }, 
  PENDING_REVIEW: { label: 'Revisão Humana', variant: 'outline' },
  COMPLETED: { label: 'Finalizado', variant: 'success' },
};

export default async function MeusDiagnosticosPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let transactions: any[] = [];

  if (user) {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) transactions = data;
  }

  return (
    <>
      <Sidebar />
      <MainContainer
        title="Minhas Análises"
        subtitle="Histórico de Due Diligence e relatórios gerados"
        action={
           <Link href="/diagnostico">
              <Button variant="primary" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Análise
              </Button>
            </Link>
        }
      >
        {transactions.length === 0 ? (
          <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Nenhuma análise encontrada
            </h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">
              Inicie uma nova Due Diligence para garantir a segurança jurídica do seu negócio.
            </p>
            <Link href="/diagnostico">
              <Button variant="primary">Iniciar Due Diligence</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((diag) => {
              const status = statusStyles[diag.status] || { label: diag.status, variant: 'default' };
              
              // Mock price if not stored in transaction (it's in payment usually, or fixed)
              const price = 300; 

              return (
                <div key={diag.id} className="group bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-glow-hover transition-all duration-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TechBadge variant="outline">
                        {transactionLabels[diag.type] || diag.type}
                      </TechBadge>
                      <TechBadge variant={status.variant}>
                        {status.label}
                      </TechBadge>
                    </div>
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">{diag.property_address || 'Endereço não informado'}</h3>
                    <p className="text-xs text-text-muted mt-1 font-mono">
                      REF: {diag.id.slice(0, 8)} • {new Date(diag.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-secondary uppercase tracking-wider font-mono">Valor</p>
                      <p className="font-bold text-text-primary font-mono">
                        R$ {price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SyncPaymentButton transactionId={diag.id} status={diag.status} />
                      <Link href={`/diagnostico/${diag.id}`}>
                        <Button variant="secondary" size="sm" className="border-gray-300">
                          Ver Relatório
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MainContainer>
    </>
  );
}