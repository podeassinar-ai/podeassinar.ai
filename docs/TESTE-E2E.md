# Roteiro de Teste Ponta a Ponta — PodeAssinar.ai

Roteiro manual de QA para validar o app publicado na Vercel, seguido passo a
passo no navegador. Cobre o fluxo do **Administrador** (que gera e aprova o
diagnóstico, usando o bypass de pagamento) e o fluxo do **Usuário/Cliente**.

> **Pré-requisitos** (ver `docs/DEPLOY-VERCEL.md`):
> - App publicado numa URL Vercel.
> - Supabase novo com migrations aplicadas + bucket `documents` criado.
> - Inngest conectado ao endpoint `/api/inngest` (senão o diagnóstico nunca é gerado).
> - Duas contas criadas:
>   - **Admin:** `admin@seudominio.com` — promovido a `SYSTEM_ADMIN` via SQL.
>   - **Cliente:** `user@seudominio.com` — papel padrão `CLIENT`.
> - Senha usada nos exemplos: a que você definiu no cadastro.

**Convenções:** cada passo tem uma **Ação** e um **✅ Resultado esperado**.
Marque `[x]` ao concluir.

**Legenda de status** (rótulos exatos que a UI mostra em /meus-diagnosticos):

| Estado interno | Rótulo na tela |
|---|---|
| `PENDING_QUESTIONNAIRE` | Aguardando Info |
| `PENDING_DOCUMENTS` | Aguardando Docs |
| `PENDING_PAYMENT` | Aguardando Pgto |
| `PROCESSING` | Em Análise IA |
| `PENDING_REVIEW` | Revisão Humana |
| `COMPLETED` | Finalizado |

---

## Parte 0 — Sanidade (2 min)

- [ ] **0.1** Abrir `https://<dominio>/` deslogado.
  ✅ A home carrega (status 200), sem erro.
- [ ] **0.2** Abrir `https://<dominio>/planos`.
  ✅ Aparecem os 3 planos: **Starter**, **Professional**, **Enterprise** com preços.
  ❌ Se aparecer "Não foi possível carregar os planos" → env/Supabase errado (pare e corrija).
- [ ] **0.3** Abrir `https://<dominio>/diagnostico` deslogado.
  ✅ Redireciona para `/login` (rota protegida).

---

## Parte 1 — Fluxo do Administrador (gerar → revisar → entregar)

O admin `SYSTEM_ADMIN` cria uma transação e, por ter bypass de pagamento, o
pipeline de IA roda direto — permitindo validar geração, revisão e entrega do
diagnóstico sem pagamento real.

### 1A. Login e acesso ao painel

- [ ] **1.1** Ir em `/login`, entrar como **admin@seudominio.com**.
  ✅ Login OK, redireciona para a home logado.
- [ ] **1.2** Acessar `https://<dominio>/admin`.
  ✅ Carrega o "Control Room" (layout escuro, menu lateral: Control Room, Fila de
  Revisão, Certidões, Notificações, e — por ser SYSTEM_ADMIN — Acesso & Usuários
  e Compliance & LGPD).
  ❌ Se redirecionar para `/` → a conta não é staff. Confirme a promoção via SQL.

### 1B. Criar um diagnóstico (com bypass de pagamento)

- [ ] **1.3** Ir em `/diagnostico`. Escolher um tipo de transação (ex.: **Compra**).
  ✅ Abre o formulário em 4 etapas: **Informações → Questionário → Documentos → Pagamento**.
- [ ] **1.4** Etapa **Informações**: preencher endereço do imóvel, tipo, valor
  estimado, e a opção de matrícula. Avançar.
  ✅ Só avança com os campos obrigatórios preenchidos (validação em tempo real).
- [ ] **1.5** Etapa **Questionário**: responder as perguntas guiadas. Avançar.
  ✅ Avança para Documentos.
- [ ] **1.6** Etapa **Documentos**: subir ao menos 1 PDF (ex.: uma matrícula de
  teste). Aguardar o upload concluir.
  ✅ O arquivo aparece como enviado; sem erro de upload. (Se falhar: bucket
  `documents` não existe ou está com policy errada.)
- [ ] **1.7** Etapa **Pagamento**: como admin (SYSTEM_ADMIN), confirmar.
  ✅ **Bypass**: em vez de ir para o checkout, o sistema dispara o processamento
  e redireciona para **/meus-diagnosticos**. (No log da função aparece
  `[ADMIN BYPASS] Skipping payment gateway`.)

### 1C. Acompanhar o processamento (Inngest → IA)

- [ ] **1.8** Em `/meus-diagnosticos`, observar o status do diagnóstico recém-criado.
  ✅ Começa em **"Em Análise IA"** (status `PROCESSING`) e, em alguns
  segundos/minutos, muda para **"Revisão Humana"** (`PENDING_REVIEW`).
  ⏱️ Se ficar preso em "Em Análise IA": o Inngest não está conectado/sincronizado —
  verifique o Sync do app em `/api/inngest` no painel do Inngest.
- [ ] **1.9** (Opcional, Inngest) No dashboard do Inngest, ver as execuções
  `extract-all-documents` → `generate-ai-diagnosis` concluídas com sucesso.
  ✅ Ambas verdes; a de diagnóstico chama a OpenAI.

### 1D. Revisar e aprovar

- [ ] **1.10** No painel admin, ir em **Fila de Revisão** (`/admin/revisao`).
  ✅ O diagnóstico aparece na fila com status "AI_GENERATED"/em revisão.
- [ ] **1.11** Abrir o item (`/admin/revisao/[id]`).
  ✅ Mostra: resumo gerado pela IA, lista de **riscos** (com níveis LOW/MEDIUM/
  HIGH/CRITICAL) e **caminhos jurídicos** com custos estimados; e os documentos
  anexados (visualizáveis via URL assinada).
- [ ] **1.12** (Opcional) Editar algum texto de risco/caminho e salvar como
  rascunho.
  ✅ Alteração persiste.
- [ ] **1.13** Clicar **"Aprovar & Enviar"**.
  ✅ O sistema: marca como revisado (APPROVED) → transação vira **COMPLETED** →
  marca como **entregue** → tenta notificar o cliente. Volta para a fila e o item
  sai de "pendente".

---

## Parte 2 — Fluxo do Usuário/Cliente

Valida o que o cliente comum vê e faz. Como o pagamento real está adiado, o
cliente vai até a etapa de **Pagamento**; a visualização do **relatório pronto**
é validada no diagnóstico que o admin entregou na Parte 1 (se você usar o mesmo
imóvel/usuário) ou criando um segundo caso.

> Dica: para ver um relatório entregue pelo lado do cliente, faça a Parte 1 com
> uma transação criada pela conta **cliente** só até "Documentos", e finalize o
> processamento/aprovação pelo admin. Alternativamente, valide os itens de
> navegação e o estado "aguardando pagamento" abaixo.

### 2A. Cadastro/Login

- [ ] **2.1** Sair da conta admin. Em `/login`, entrar como **user@seudominio.com**.
  ✅ Login OK; **não** vê o menu de admin; `/admin` redireciona para `/`.

### 2B. Iniciar um diagnóstico

- [ ] **2.2** Ir em `/diagnostico`, escolher um tipo (ex.: **Venda**).
  ✅ Abre as 4 etapas.
- [ ] **2.3** Preencher **Informações** e **Questionário**. Avançar.
  ✅ Validação por etapa funciona; avança.
- [ ] **2.4** **Documentos**: subir um PDF; se um upload falhar, testar o
  **"tentar novamente"** no arquivo com erro.
  ✅ Upload conclui; retry individual funciona.
- [ ] **2.5** **Pagamento**: como cliente comum (não admin), confirmar.
  ✅ **Sem bypass**: o cliente é encaminhado ao fluxo de pagamento. Nesta rodada
  (sem chave AbacatePay válida) a criação do checkout **não** completa — o
  esperado é uma **mensagem de erro clara** ("Não foi possível iniciar o
  pagamento. Tente novamente."), **não** uma falsa tela de sucesso.
  📌 Este passo confirma que o app não finge sucesso sem pagar. O pagamento real
  será validado quando houver chave AbacatePay válida (ver DEPLOY-VERCEL.md).

### 2C. Área do cliente

- [ ] **2.6** Ir em **/meus-diagnosticos**.
  ✅ Lista os diagnósticos do próprio usuário com seus status (ex.: **"Aguardando
  Pgto"**). Não aparecem diagnósticos de outros usuários.
- [ ] **2.7** Abrir um diagnóstico **entregue** (status **"Finalizado"**), se houver.
  ✅ Abre o **relatório**: status do imóvel, riscos, caminhos jurídicos, custos
  estimados. Botão de imprimir/PDF (`window.print`) funciona.
- [ ] **2.8** Ir em **/documentos**.
  ✅ Lista os documentos do próprio usuário; baixar um documento gera URL
  assinada e funciona. (Cada download é registrado no audit log — LGPD.)
- [ ] **2.9** Ir em **/minha-assinatura**.
  ✅ Se sem assinatura ativa, mostra o estado correspondente; se houver, mostra o
  medidor de créditos **sem "NaN"** (mesmo em plano com 0 créditos).

---

## Parte 3 — Verificações de segurança (rápidas, importantes)

- [ ] **3.1** Logado como **cliente**, tentar acessar `/admin/dashboard`.
  ✅ Redireciona para `/` (sem acesso ao painel).
- [ ] **3.2** Logado como **cliente**, os dados de outros usuários não aparecem
  em nenhuma lista (diagnósticos, documentos, transações).
  ✅ Só os próprios dados (isolamento por RLS).
- [ ] **3.3** (Opcional, técnico) Confirmar que um cliente não consegue se
  auto-promover a admin — isso é bloqueado no banco (trigger anti-escalação).

---

## Parte 4 — LGPD / retenção (opcional)

- [ ] **4.1** No painel admin, **Compliance & LGPD**.
  ✅ Carrega sem erro.
- [ ] **4.2** (Técnico) O cron diário `/api/cron/purge-expired-documents` remove
  documentos expirados (storage + registro) e grava no audit log. Pode ser
  disparado manualmente com o header `Authorization: Bearer <CRON_SECRET>`.
  ✅ Retorna `{ ok: true, documentsPurged, storageObjectsDeleted }`.

---

## Resumo do que este roteiro valida

| Área | Validado |
|---|---|
| Autenticação + proteção de rotas | ✅ |
| Onboarding do diagnóstico (4 etapas) | ✅ |
| Upload de documentos (storage) | ✅ |
| Pipeline assíncrono (Inngest → extração → IA) | ✅ |
| Revisão humana + aprovação/entrega | ✅ |
| Área do cliente (lista, relatório, documentos, assinatura) | ✅ |
| Isolamento de dados por usuário (RLS) | ✅ |
| Bloqueio de escalonamento de privilégio | ✅ |
| Pagamento **real** (AbacatePay Pix) | ⏳ adiado — precisa de chave válida |
| E-mail **real** (Resend) | ⏳ opcional — precisa de `RESEND_API_KEY` |
