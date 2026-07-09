# Critical UX/UI Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir 5 bloqueios críticos de UX/UI antes do lançamento em produção.

**Architecture:** Reaproveitar padrões já existentes no app: impressão nativa do navegador para PDF, `?success=true` para banners de confirmação, server action + modal para cancelamento, e evolução incremental do hook `useDiagnostico` para validação em tempo real e retry de uploads falhos. A implementação evita novas dependências e concentra a lógica mutável em `useDiagnostico` e nas server actions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Supabase, Tailwind CSS

---

### Task 1: Registrar testes de regressão para cancelamento e fluxos do diagnóstico

**Files:**
- Create: `src/app/actions/subscription-actions.test.ts`
- Create: `src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`
- Create: `src/app/diagnostico/hooks/useDiagnostico.helpers.ts`

**Step 1: Write the failing test**

Escrever testes para:
- cancelar assinatura ativa do próprio usuário;
- recusar cancelamento quando status não for `ACTIVE`;
- validar campos obrigatórios por etapa;
- agregar falhas por arquivo no upload e permitir retry pontual.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/app/actions/subscription-actions.test.ts src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`
Expected: FAIL por exports/helpers ainda não existentes.

**Step 3: Write minimal implementation**

Criar helpers puros para validação e reconciliação de uploads; depois adaptar a server action.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/app/actions/subscription-actions.test.ts src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`
Expected: PASS

### Task 2: Implementar PDF via `window.print()` com estilos de impressão

**Files:**
- Modify: `src/app/diagnostico/[id]/page.tsx`
- Modify: `src/ui/components/layout/topbar.tsx`
- Modify: `src/ui/styles/globals.css`

**Step 1: Wire print action**

Adicionar `onClick={() => window.print()}` ao botão e marcar wrappers navegacionais como `no-print`.

**Step 2: Add print stylesheet**

Escrever regras `@media print` para esconder navegação/ações e limpar layout.

**Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS

### Task 3: Exibir confirmação persistente após pagamento

**Files:**
- Modify: `src/app/diagnostico/hooks/useDiagnostico.ts`
- Modify: `src/app/meus-diagnosticos/page.tsx`

**Step 1: Redirect with query param**

Trocar o redirect pós-pagamento para `/meus-diagnosticos?success=true` e remover toast redundante.

**Step 2: Render success banner**

Adicionar `searchParams` e banner verde no topo da página.

**Step 3: Verify**

Run: `npm run typecheck`
Expected: PASS

### Task 4: Adicionar validação em tempo real e retry de uploads

**Files:**
- Modify: `src/app/diagnostico/types.ts`
- Modify: `src/app/diagnostico/hooks/useDiagnostico.ts`
- Modify: `src/app/diagnostico/page.tsx`
- Modify: `src/app/diagnostico/components/StepPropertyInfo.tsx`
- Modify: `src/app/diagnostico/components/StepDocumentStatus.tsx`
- Modify: `src/app/diagnostico/components/StepFileUpload.tsx`
- Test: `src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`

**Step 1: Add types and helpers**

Criar `FailedFile`, `ValidationErrors` e helpers para validação por campo/etapa.

**Step 2: Refactor hook**

Adicionar `errors`, `touched`, upload parcial, retry/dismiss e validação no `handleNext`.

**Step 3: Wire UI**

Passar `error` e `onBlur` para steps e renderizar a seção de falhas com ações.

**Step 4: Verify**

Run: `npm test -- src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`
Expected: PASS

### Task 5: Implementar cancelamento de assinatura com confirmação

**Files:**
- Modify: `src/app/actions/subscription-actions.ts`
- Create: `src/app/minha-assinatura/components/CancelSubscriptionButton.tsx`
- Modify: `src/app/minha-assinatura/page.tsx`
- Test: `src/app/actions/subscription-actions.test.ts`

**Step 1: Add server action**

Adicionar `cancelSubscriptionAction(subscriptionId)` com autenticação, ownership e status checks.

**Step 2: Add client button**

Criar componente cliente com `Modal`, loading state, confirmação e `router.refresh()`.

**Step 3: Replace inert button**

Substituir o botão atual na página.

**Step 4: Verify**

Run: `npm test -- src/app/actions/subscription-actions.test.ts`
Expected: PASS

### Task 6: Verificação final

**Files:**
- Review: diff completo

**Step 1: Run focused tests**

Run: `npm test -- src/app/actions/subscription-actions.test.ts src/app/diagnostico/hooks/useDiagnostico.helpers.test.ts`
Expected: PASS

**Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

**Step 3: Run lint if available**

Run: `npm run lint`
Expected: PASS ou reportar bloqueio de configuração do projeto.
