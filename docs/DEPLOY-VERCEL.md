# Deploy para Vercel (novo projeto) — passo a passo

Objetivo: publicar o app num projeto Vercel novo, com um Supabase novo, para
testar ponta a ponta. Pagamento fica em **modo bypass de admin** nesta rodada
(a chave AbacatePay atual retorna 401), então o fluxo completo é validado por
uma conta `SYSTEM_ADMIN` sem gateway de pagamento.

Ordem: **Supabase → Inngest → Vercel → pós-deploy**. Não pule a ordem: o build
da Vercel valida env vars no boot (`src/instrumentation.ts`) e falha cedo se
faltar algo obrigatório.

---

## 1. Supabase (projeto novo)

1. Crie um projeto novo em https://supabase.com (região mais próxima, ex.
   `South America (São Paulo)`).
2. Guarde do painel (Project Settings → API):
   - `Project URL` → vira `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secreta) → `SUPABASE_SERVICE_ROLE_KEY`
3. Aplique as migrations (do seu terminal, na raiz do repo):
   ```bash
   supabase link --project-ref <REF_DO_PROJETO>
   supabase db push        # aplica supabase/migrations/001..017
   ```
   > O `db push` foi validado do zero com `supabase db reset` — a cadeia inteira
   > aplica limpa.
4. **Crie o bucket de storage** `documents` (privado). As migrations não criam
   bucket. No painel: Storage → New bucket → nome `documents`, **Public = off**.
   (Opcional: file size limit 10MB, allowed MIME `application/pdf,image/*`.)
5. **Confirmação de e-mail**: para testar rápido, desative a confirmação de
   e-mail em Authentication → Providers → Email → "Confirm email" = off. (Assim
   os usuários de teste logam sem precisar clicar em link.) Reative depois.

## 2. Inngest (pipeline de IA) — obrigatório

O diagnóstico só é gerado se o Inngest processar o pipeline
(extração → IA → notifica). Sem isso, a transação fica em `PROCESSING` para sempre.

1. Crie conta grátis em https://www.inngest.com e um app.
2. Em Inngest → Manage → Event Keys / Signing Key, copie:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
3. Após o deploy da Vercel (passo 3), registre o endpoint do app no Inngest:
   `Sync new app` apontando para `https://<seu-dominio>.vercel.app/api/inngest`.
   (Faça isso DEPOIS que a URL da Vercel existir.)

## 3. Vercel (projeto novo)

1. Em https://vercel.com (sua conta nova) → Add New → Project → importe o repo
   `podeassinar-ai/podeassinar.ai` (branch `main`).
2. Framework: Next.js (autodetectado). Não mude build/output.
3. **Environment Variables** (Production + Preview) — cole:

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | do passo 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do passo 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | do passo 1 (secreto) |
   | `OPENAI_API_KEY` | sua chave OpenAI (validada) |
   | `ABACATEPAY_API_KEY` | a que você tiver (pode ser a dev; pagamento fica em bypass) |
   | `ABACATEPAY_WEBHOOK_SECRET` | qualquer string forte por enquanto |
   | `INNGEST_EVENT_KEY` | do passo 2 |
   | `INNGEST_SIGNING_KEY` | do passo 2 |
   | `CRON_SECRET` | gere um valor aleatório forte |
   | `NEXT_PUBLIC_APP_URL` | `https://<seu-dominio>.vercel.app` (ajuste após o 1º deploy) |

   Opcionais (deixe em branco = usa fallback): `UPSTASH_REDIS_REST_URL`,
   `UPSTASH_REDIS_REST_TOKEN` (rate limit em memória), `RESEND_API_KEY`
   (e-mail vai pro log). **Não** defina `INNGEST_DEV`.
4. Deploy. Anote a URL final e, se necessário, ajuste `NEXT_PUBLIC_APP_URL`
   para ela e redeploy.
5. Volte ao Inngest e faça o "Sync app" para `.../api/inngest` (passo 2.3).

> O `vercel.json` já agenda o cron LGPD diário
> (`/api/cron/purge-expired-documents`) — a Vercel injeta o `CRON_SECRET`
> automaticamente como Bearer.

## 4. Pós-deploy (obrigatório para o teste e2e)

Crie as contas de teste e promova o admin. Duas opções:

**Opção A — pelo próprio app + SQL (recomendada):**
1. Acesse `https://<dominio>/login`, crie duas contas:
   - `admin@seudominio.com` (será o SYSTEM_ADMIN)
   - `user@seudominio.com` (cliente comum)
2. No Supabase → SQL Editor, promova o admin:
   ```sql
   update users set role = 'SYSTEM_ADMIN' where email = 'admin@seudominio.com';
   ```
   > Só `SYSTEM_ADMIN` aciona o bypass de pagamento. O trigger anti-escalação
   > bloqueia mudança de role pelo cliente — por isso a promoção é via SQL Editor
   > (service role).

**Opção B — via Auth Admin API** (se preferir terminal): use o mesmo padrão do
`scripts/bootstrap-local.sh`, trocando API_URL/SERVICE_ROLE_KEY pelos de produção.

## 5. Checagem rápida de saúde

- `https://<dominio>/` → 200 (home)
- `https://<dominio>/planos` → mostra os 3 planos (Starter/Professional/Enterprise).
  Se aparecer erro de "carregar planos", o Supabase/env está errado.
- `https://<dominio>/diagnostico` deslogado → redireciona para `/login`.

Passando isso, siga o roteiro de testes em **`docs/TESTE-E2E.md`**.

## Pendências conhecidas nesta rodada
- **Pagamento real (AbacatePay)**: adiado — chave dev retorna 401. O fluxo de
  pagamento em si (checkout Pix + webhook) não é exercido aqui; validamos o
  resto via bypass de admin. Quando tiver chave válida, configure o webhook em
  `https://<dominio>/api/webhooks/abacatepay?webhookSecret=<ABACATEPAY_WEBHOOK_SECRET>`.
- **E-mail**: sem `RESEND_API_KEY`, notificações vão só para o log da função.
