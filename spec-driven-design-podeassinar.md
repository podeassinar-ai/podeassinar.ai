**SPEC-DRIVEN DESIGN**
======================

**Projeto:** 
-------------

**PodeAssinar.ai**
------------------

Você é um **Senior Software Architect + Legal Tech Product Designer**, especialista em **plataformas jurídicas escaláveis**, **direito imobiliário brasileiro**, **LGPD** e **AI-assisted workflows**.

Sua tarefa é **desenhar a especificação técnica e arquitetural** de um sistema chamado **PodeAssinar.ai**, seguindo rigorosamente as diretrizes abaixo.

**1️⃣ Visão do Produto (imutável)**
-----------------------------------

O **PodeAssinar.ai** é uma **plataforma jurídica imobiliária** cujo objetivo final é oferecer **assistência jurídica completa** para **transações imobiliárias**, incluindo:

*   compra e venda
    
*   locação
    
*   financiamentos e refinanciamentos
    
*   hipotecas
    
*   alienação fiduciária
    
*   doações
    
*   permutas
    
*   regularizações urbanísticas e registrais
    

⚠️ **IMPORTANTE:**

O sistema **nasce operando APENAS** com o **produto de diagnóstico jurídico imobiliário**, mas **DEVE SER ARQUITETADO desde o início** para evoluir para acompanhamento jurídico integral de transações, sem refatorações estruturais profundas.

👉 Pense em **Product Slice**, não em MVP descartável.

**2️⃣ Produto Inicial (escopo ativo do MVP)**
---------------------------------------------

### **🎯 Produto vendido inicialmente**

**Diagnóstico Jurídico Imobiliário Pago**

*   Valor: **R$ 300–600 por diagnóstico**
    
*   Pagamento obrigatório antes da entrega
    
*   Entrega digital
    

### **Fluxo do usuário:**

1.  *   vender
        
    *   comprar
        
    *   financiar
        
    *   refinanciar
        
    *   alugar
        
    *   regularizar
        
2.  Responde a um **questionário guiado**
    
3.  Envia documentos (PDFs / imagens)
    
4.  *   status do imóvel
        
    *   mapa de riscos
        
    *   caminhos jurídicos possíveis
        
    *   estimativa de custos por etapa
        
5.  *   orçamento total
        
    *   contratação direta da regularização / acompanhamento jurídico
        

⚠️ A **execução jurídica** é inicialmente **manual**, mas facilitada pelo sistema.

**3️⃣ Impeditivo crítico (certidão de matrícula atualizada)**
-------------------------------------------------------------

Para validade jurídica do diagnóstico:

*   É **necessária certidão de matrícula atualizada (≤ 30 dias)**
    

### **O sistema DEVE oferecer três caminhos (workaround obrigatório):**

1.  **Upload de certidão atualizada pelo usuário**
    
2.  **Upload de certidão antiga + atualização pelo sistema**
    
3.  **Usuário informa nº da matrícula + cartório → sistema emite a certidão**
    

➡️ A emissão pelo sistema:

*   tem **custo adicional variável**
    
*   depende do cartório / tipo de certidão
    
*   deve ser claramente precificada antes da cobrança
    

**4️⃣ AI no sistema (obrigatório)**
-----------------------------------

O sistema se chamará **PodeAssinar.ai** e **DEVE integrar AI via API**.

### **Papel da AI (restrito e seguro):**

*   Classificar intenção do usuário
    
*   Organizar respostas do questionário
    
*   Extrair informações de documentos
    
*   Gerar **pré-diagnóstico jurídico**
    
*   Sugerir riscos e caminhos
    

⚠️ **Regra absoluta:**

> A AI **NÃO toma decisões jurídicas finais**.

> Todo diagnóstico é **revisado e aprovado por humano**.

Arquitetura: **AI-assisted, human-approved**.

**5️⃣ Tech Stack (obrigatória)**
--------------------------------

### **Frontend**

*   **Next.js (App Router)**
    
*   Server Actions
    
*   UI focada em formulários inteligentes
    

### **Backend (fase inicial)**

*   **Next.js API Routes / Server Actions**
    
*   *   domain
        
    *   application
        
    *   infrastructure
        

⚠️ A lógica jurídica **não pode** ficar diretamente em Server Actions.

### **Banco de dados**

*   *   Neon **ou** Supabase (justificar escolha)
        
*   Modelagem orientada a domínio
    

### **Storage de documentos**

*   Storage externo (Supabase Storage / S3 compatível)
    
*   **Nunca armazenar arquivos no servidor**
    
*   *   vinculados à transação
        
    *   com data de expiração
        
    *   com política automática de exclusão
        

**6️⃣ Política de retenção e expiração de documentos**
------------------------------------------------------

*   *   até **30 dias** (prazo da matrícula)
        
    *   ou até conclusão do serviço
        
*   *   exclusão automática
        
    *   ou anonimização, se aplicável
        

Cada documento deve conter:

*   base legal (LGPD)
    
*   data de expiração
    
*   histórico de acesso (audit log)
    

**7️⃣ LGPD (obrigatório desde o design)**
-----------------------------------------

O sistema trata **dados jurídicos sensíveis**.

### **O projeto DEVE prever:**

*   Política de Proteção de Dados
    
*   Política de Retenção
    
*   Plano de Resposta a Incidente
    
*   Logs de acesso
    
*   Minimização de dados
    

### **DPO**

*   Papel de **DPO designado** deve existir no sistema
    
*   Mesmo que terceirizado no início
    

**8️⃣ Domínios do sistema (mesmo que inativos)**
------------------------------------------------

O sistema DEVE ser modelado com os seguintes **bounded contexts**, ainda que parcialmente vazios:

1.  Identity & Access
    
2.  Transaction Core
    
3.  Diagnostic Engine (ativo no MVP)
    
4.  Document Management
    
5.  Legal Workflow (futuro)
    
6.  Billing & Monetization
    
7.  Audit & Compliance
    

⚠️ Não implementar tudo, mas **modelar tudo**.

**9️⃣ Monetização**
-------------------

*   Diagnóstico pago (gateway obrigatório)
    
*   *   regularização
        
    *   acompanhamento jurídico
        
*   *   sugestão automática de serviços
        
    *   geração de orçamento
        
    *   upgrade sem novo onboarding
        

**🔟 Resultado esperado do seu trabalho**
-----------------------------------------

Você deve entregar:

1.  Arquitetura geral do sistema
    
2.  Diagrama lógico de domínios
    
3.  Modelagem inicial de dados
    
4.  Fluxos do usuário (MVP + futuro)
    
5.  Estratégia de AI
    
6.  Estratégia de LGPD
    
7.  Justificativa técnica das escolhas
    
8.  Pontos de extensão futuros (“lacunas planejadas”)
    

**⚠️ Restrições finais**
------------------------

*   Não criar app complexo desnecessário
    
*   Não assumir integrações cartoriais automáticas no início
    
*   Não violar LGPD
    
*   Não criar solução que dependa exclusivamente de AI
    
*   Priorizar **escalabilidade jurídica**, não só técnica
    

### **🎯 Mentalidade obrigatória**

> Este sistema **nasce simples**,

> **pensa grande**,

> e **nunca precisará ser refeito** para virar uma plataforma jurídica imobiliária completa.