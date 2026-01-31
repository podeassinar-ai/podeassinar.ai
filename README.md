# PodeAssinar.ai

**PodeAssinar.ai** é uma plataforma jurídica imobiliária projetada para oferecer diagnósticos jurídicos completos e automatizados para transações imobiliárias (compra e venda, locação, regularização, etc.). O sistema utiliza Inteligência Artificial para análise documental, mantendo sempre a supervisão e aprovação final de advogados especializados (*AI-assisted, human-approved*).

## 🚀 Visão do Produto

O objetivo inicial do MVP é o **Diagnóstico Jurídico Imobiliário**, permitindo que usuários enviem informações e documentos de um imóvel para receberem um mapa de riscos, caminhos jurídicos possíveis e estimativas de custos.

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend:** Next.js Server Actions & API Routes.
- **Banco de Dados:** Supabase (PostgreSQL).
- **Storage:** Supabase Storage (S3 compatível).
- **Pagamentos:** [AbacatePay](https://docs.abacatepay.com/) (Pix).
- **Linguagem:** TypeScript.
- **Estilo de UI:** Inspirado no **Streamlit** (minimalista, foco em dados e formulários limpos).

## 🏗️ Arquitetura (Clean Architecture)

O projeto segue os princípios da **Arquitetura Limpa** para garantir a separação de responsabilidades e facilidade de manutenção:

- `src/domain`: **Regras de Negócio Empresariais.** Contém as entidades (Transaction, Document, Diagnosis) e interfaces (contratos) dos repositórios e serviços. Não possui dependências externas.
- `src/application`: **Regras de Negócio da Aplicação.** Contém os Casos de Uso (Use Cases) que orquestram a lógica do sistema.
- `src/infrastructure`: **Detalhes Técnicos.** Implementações de repositórios (Supabase), serviços de terceiros (IA, Pagamentos) e clientes de banco de dados.
- `src/ui`: **Interface do Usuário.** Componentes React, Estilos Globais e Layout.
- `src/app`: **Rotas do Next.js.** Páginas e Server Actions que funcionam como controladores de entrada.

## 📋 Pré-requisitos

- Node.js (v18+)
- Conta no [Supabase](https://supabase.com/)
- API Key de um provedor de IA (OpenAI ou Claude)
- Conta no [AbacatePay](https://abacatepay.com/) (para processamento de pagamentos via Pix)

## ⚙️ Instalação e Configuração

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd podeassinar
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=seu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

   # IA
   OPENAI_API_KEY=sua_openai_key

   # AbacatePay
   ABACATEPAY_API_KEY=sua_abacatepay_api_key
   ABACATEPAY_WEBHOOK_SECRET=seu_webhook_secret
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configurar o Banco de Dados:**
   Execute o script `supabase/schema.sql` no Editor SQL do seu painel Supabase para criar as tabelas, tipos ENUM e políticas de segurança (RLS).

5. **Configurar Webhook do AbacatePay:**
   No painel do AbacatePay, configure o webhook para apontar para:
   ```
   https://seu-dominio.com/api/webhooks/abacatepay
   ```
   Eventos recomendados: `billing.paid`, `billing.expired`, `billing.refunded`.

6. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## 💳 Integração de Pagamentos

O sistema utiliza o **AbacatePay** como gateway de pagamentos, focado em **Pix** para o mercado brasileiro. A integração segue o padrão de Clean Architecture:

- **Interface:** `src/domain/interfaces/payment-gateway.ts`
- **Implementação:** `src/infrastructure/services/abacate-pay-gateway.ts`

### Fluxo de Pagamento

1. Usuário finaliza o questionário e documentos.
2. Sistema cria uma cobrança via `client.billing.create`.
3. Usuário é redirecionado para a página de checkout do AbacatePay.
4. Após o pagamento (Pix), o webhook `billing.paid` é disparado.
5. O sistema atualiza o status da transação para `PROCESSING`.

## 🔒 Segurança e LGPD

- **Minimização de Dados:** Apenas dados estritamente necessários são coletados.
- **Retenção de Documentos:** Implementada política de expiração automática (30 dias para matrículas, 90 dias para outros).
- **Logs de Auditoria:** Todas as ações sensíveis são registradas na tabela `audit_logs`.
- **RLS (Row Level Security):** O acesso aos dados no banco é restrito ao proprietário da transação via Supabase Auth.

## 📄 Licença

Este projeto é de uso exclusivo da PodeAssinar.ai. Todos os direitos reservados.
