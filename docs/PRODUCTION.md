# Guia de Produção — PodeAssinar.ai

Este documento descreve o que é necessário para levar o app a produção, o que já
foi validado localmente e o que exige credenciais/ação externa.

## 1. Variáveis de ambiente (Vercel → Project Settings → Environment Variables)

| Variável | Obrigatória | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase de produção |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role key (secreta) |
| `OPENAI_API_KEY` | ✅ | validada localmente (gpt-4o-mini / gpt-4o) |
| `ABACATEPAY_API_KEY` | ✅ | **a chave `abc_dev_...` atual retorna 401 — obter chave válida** |
| `ABACATEPAY_WEBHOOK_SECRET` | ✅ | segredo do webhook (o backup tinha placeholder `whsec_seu_secret_aqui`) |
| `INNGEST_EVENT_KEY` | ✅ (prod) | Inngest Cloud |
| `INNGEST_SIGNING_KEY` | ✅ (prod) | Inngest Cloud |
| `CRON_SECRET` | ✅ | protege `/api/cron/purge-expired-documents`; Vercel injeta como `Bearer` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | opcional | rate limiting; sem eles usa limiter em memória |
| `RESEND_API_KEY` | opcional | e-mail; sem ele cai no console (sem envio real) |
| `AI_MODEL_OVERRIDE` | opcional | força um modelo específico da OpenAI |
| `NEXT_PUBLIC_APP_URL` | ✅ | ex.: `https://podeassinar.ai` |

Validação: `src/infrastructure/config/env.ts` expõe `assertServerEnv()` /
`assertPublicEnv()` para falhar cedo se algo obrigatório faltar.

## 2. Banco de dados (Supabase)

O projeto Supabase antigo (`uhjdagilbbenpvrrlikx`) está **morto** (não resolve DNS).
Provisione um novo projeto e aplique as migrations:

```bash
supabase link --project-ref <NOVO_REF>
supabase db push        # aplica supabase/migrations/001..017
```

As migrations foram renumeradas para versões únicas e monotônicas (havia uma
colisão `008` que quebrava `db push`). A cadeia inteira foi validada com
`supabase db reset` do zero.

### Pós-migração (obrigatório)
1. **Storage bucket**: crie o bucket privado `documents` (10 MB, pdf/imagens).
   Localmente é feito por `scripts/bootstrap-local.sh`; em prod, crie via painel
   ou API. As migrations não criam bucket.
2. **Primeiro admin**: promova seu usuário:
   ```sql
   UPDATE users SET role = 'SYSTEM_ADMIN' WHERE email = 'voce@exemplo.com';
   ```
   (O trigger anti-escalação bloqueia mudanças de `role` por clientes; use a
   service_role/psql para promover.)

### O que a migration 015 corrige (crítico)
Tabelas criadas por SQL cru **não** recebem os GRANTs que o painel do Supabase
aplicaria. Sem a 015, `anon`/`authenticated`/`service_role` levam
`permission denied` em todas as tabelas — o app inteiro quebra numa base nova.
A 015 concede os GRANTs (RLS continua filtrando linhas), corrige políticas RLS
que consultavam `users` diretamente, e adiciona o trigger anti-escalação de
`role`/`is_active`.

## 3. AbacatePay (pagamentos Pix)

- **Webhook URL**: configure no painel AbacatePay apontando para
  `https://<seu-dominio>/api/webhooks/abacatepay?webhookSecret=<ABACATEPAY_WEBHOOK_SECRET>`.
  O código valida o `?webhookSecret=` (mecanismo primário) e também aceita o
  header HMAC `X-Webhook-Signature`.
- Eventos: `billing.paid`, `billing.expired`, `billing.refunded`, `billing.created`.
- **Pendência**: a chave dev atual retorna 401. A criação de checkout
  (`createCheckout`) só pôde ser validada quanto ao formato — teste com uma chave
  válida em sandbox antes do go-live. O caminho do webhook (confirmação →
  liberação do diagnóstico) foi validado localmente com segredo auto-assinado.

## 4. Inngest (pipeline assíncrono)

- Em prod use Inngest Cloud (`INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`).
- Registre o app apontando para `https://<seu-dominio>/api/inngest`.
- Funções: `extract-all-documents` → `generate-ai-diagnosis` → notifica admins.
- Localmente há incompatibilidade entre a CLI do Inngest e o SDK 3.52
  (`sdk_version_denied`); o pipeline foi validado por teste de integração direto
  (`src/__integration__/ai-pipeline.integration.test.ts`).

## 5. Cron LGPD

`vercel.json` agenda `/api/cron/purge-expired-documents` diariamente (03:00 UTC).
Ele apaga documentos expirados (storage + linha) e registra no audit log
(ator = sistema, `user_id NULL`). Protegido por `CRON_SECRET`.

## 6. Como rodar/validar localmente

```bash
supabase start
bash scripts/bootstrap-local.sh   # bucket + usuários de teste
pnpm dev                          # porta 3000 (use PORT=3210 se quiser)

# testes hermeticos
pnpm test

# teste de integração ao vivo (OpenAI + Supabase local)
RUN_INTEGRATION=1 pnpm vitest run src/__integration__/ai-pipeline.integration.test.ts
```

Contas de teste (senha `Test1234!`): `client@pode.test`, `admin@pode.test`,
`lawyer@pode.test`.

## 7. Pendências conhecidas (não bloqueantes)

- `@next/swc` 15.5.7 vs Next 15.5.11: warning cosmético (build passa). Resync do
  lockfile quando conveniente.
- OAuth (Google/Azure) no login está scaffolded mas não conectado a botões.
- E-mail em modo console até configurar `RESEND_API_KEY`.
