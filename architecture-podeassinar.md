**DIAGRAMA MENTAL DA ARQUITETURA — PodeAssinar.ai**
===================================================

Vou dividir em **3 camadas**:

1.  Visão geral (macro)
    
2.  MVP ativo (fluxo real de hoje)
    
3.  Evolução futura (sem refatoração)
    

**1️⃣ VISÃO GERAL (macroarquitetura)**
--------------------------------------

\[ Usuário \]

|

v

\[ Frontend Next.js \]

|

v

\[ Application Layer \]

|

v

\[ Domain Layer \]

|

v

\[ Infrastructure \]

|

+--> \[ Database (Postgres) \]

+--> \[ Document Storage \]

+--> \[ AI API \]

+--> \[ Payment Gateway \]

⚠️ Regra de ouro:

*   Frontend **nunca** fala direto com DB, AI ou Storage
    
*   Domain **não conhece** tecnologia
    
*   Infrastructure **não decide regra jurídica**
    

**2️⃣ MVP — FLUXO ATIVO HOJE (diagnóstico)**
--------------------------------------------

### **2.1 Entrada do usuário**

Usuário

↓

Frontend (Next.js)

↓

Server Action / API Route

↓

Application: StartDiagnosticUseCase

O frontend:

*   coleta intenção
    
*   coleta respostas
    
*   coleta documentos
    
*   dispara ações
    

### **2.2 Questionário + intenção**

StartDiagnosticUseCase

↓

Domain: Transaction

↓

Domain: DiagnosticRequest

Aqui:

*   cria-se uma **Transação Jurídica**
    
*   associa-se um **pedido de diagnóstico**
    

Mesmo que hoje só exista “diagnóstico”, o sistema já entende:

> “isso aqui é uma transação imobiliária em estágio inicial”

### **2.3 Upload de documentos**

Frontend

↓

Server Action

↓

Application: UploadDocumentUseCase

↓

Infrastructure: StorageProvider

O Storage:

*   recebe o arquivo
    
*   devolve um storage\_ref
    

No domínio:

Document

\- type

\- transaction\_id

\- expires\_at

\- legal\_basis

📌 Documento **não pertence ao usuário**, pertence à transação.

### **2.4 Certidão de matrícula (workaround crítico)**

Usuário escolhe:

1) Upload certidão atual

2) Upload certidão antiga

3) Informar matrícula + cartório

Fluxo (opção 3):

Frontend

↓

Application: RequestUpdatedCertificateUseCase

↓

Infrastructure:

\- PricingService

\- PaymentGateway

\- ManualFulfillmentQueue

📌 Importante:

*   **NÃO** integrar cartório agora
    
*   *   fila operacional
        
    *   tarefa humana
        
    *   status acompanhado no sistema
        

### **2.5 Pagamento do diagnóstico**

Frontend

↓

Payment Gateway

↓

Webhook

↓

Application: ConfirmPaymentUseCase

Após pagamento:

*   diagnóstico é liberado para processamento
    
*   AI pode ser chamada
    

### **2.6 AI – Pré-diagnóstico**

Application: RunAIPreDiagnosticUseCase

↓

Infrastructure: AIProvider (API)

↓

Domain: DiagnosticDraft

A AI:

*   organiza dados
    
*   sugere riscos
    
*   propõe caminhos
    

⚠️ O output:

*   **não é final**
    
*   **não é entregue direto ao usuário**
    

### **2.7 Revisão humana**

Advogado

↓

Frontend (Admin)

↓

Application: ReviewDiagnosticUseCase

↓

Domain: Diagnostic

Aqui nasce:

*   o **diagnóstico oficial**
    
*   com responsabilidade jurídica
    

### **2.8 Entrega ao usuário**

Frontend

↓

Application: DeliverDiagnosticUseCase

↓

Usuário

Conteúdo entregue:

*   status do imóvel
    
*   riscos
    
*   etapas
    
*   custos estimados
    
*   sugestão de contratação
    

**3️⃣ MVP — COMPONENTES “DORMINDO”, MAS JÁ NO MAPA**
----------------------------------------------------

Eles **não fazem nada ainda**, mas **já existem**.

\[ LegalWorkflow \]

\[ ContractEngine \]

\[ SignatureService \]

\[ RegistryIntegration \]

\[ FinancingIntegration \]

Nenhum deles é chamado.

Mas:

*   o domínio já prevê
    
*   o banco já aceita
    
*   a UI já tem placeholders
    

**4️⃣ FUTURO — A EVOLUÇÃO NATURAL (sem trauma)**
------------------------------------------------

### **4.1 Quando vender acompanhamento jurídico**

Diagnostic

↓

UpgradeToLegalAssistanceUseCase

↓

LegalWorkflow

Nada muda no core.

### **4.2 Assinatura digital**

LegalWorkflow

↓

SignatureService (ex: Clicksign)

O documento:

*   já existe
    
*   já tem versionamento
    
*   já tem cadeia de custódia
    

### **4.3 Integração com cartórios (futuro distante)**

RegistryIntegration

↓

Cartório API (quando existir)

Hoje:

*   Amanhã:
    
*   troca-se só a implementação
    

**5️⃣ LGPD NO DIAGRAMA (transversal)**
--------------------------------------

Qualquer acesso a:

\- Documento

\- Diagnóstico

\- Transação

→ AuditLog

→ LegalBasis

→ ExpirationPolicy

O DPO:

*   tem acesso ao audit
    
*   pode disparar exclusão
    
*   pode responder incidente
    

**6️⃣ O DIAGRAMA EM UMA FRASE**
-------------------------------

> **Hoje:** diagnóstico jurídico assistido por AI

> **Amanhã:** gestão jurídica completa de transações imobiliárias

> **Sempre:** mesma espinha dorsal