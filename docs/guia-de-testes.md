# PodeAssinar — Guia de Testes para Parceiros

Ola! Este guia explica como testar todas as funcionalidades do PodeAssinar. Siga cada secao na ordem para garantir que tudo esta funcionando corretamente.

---

## Antes de comecar

1. Acesse o sistema pelo navegador (Chrome ou Edge de preferencia)
2. Crie uma conta usando email e senha, ou entre com Google
3. Apos o login, voce sera redirecionado para a tela inicial

---

## 1. Criar um Diagnostico (Fluxo Principal)

Este e o fluxo mais importante do sistema. Ele guia o usuario por etapas para solicitar uma analise juridica de um imovel.

### Passo 1 — Informacoes do Imovel

- Clique em "Novo Diagnostico" na tela inicial
- Selecione o tipo de transacao (Compra, Venda, Locacao, etc.)
- Preencha o endereco do imovel
- Selecione o tipo de imovel (Apartamento, Casa, Terreno, etc.)

**O que testar:**
- Tente clicar em "Continuar" sem preencher nada — devem aparecer mensagens de erro em vermelho abaixo de cada campo
- Clique em um campo, deixe vazio, e clique em outro campo — o erro deve aparecer imediatamente no campo que voce saiu
- Preencha tudo corretamente e clique em "Continuar" — deve avancar sem problemas

### Passo 2 — Situacao Documental

- Informe se o imovel possui matricula atualizada
- Dependendo da resposta, campos adicionais podem aparecer

**O que testar:**
- As mesmas validacoes do passo anterior se aplicam aqui
- Se voce selecionar "Nao" ou "Antiga" para matricula, um novo campo deve aparecer perguntando como deseja prosseguir

### Passo 3 — Upload de Documentos

- Envie os documentos do imovel (matricula, IPTU, RG/CPF, etc.)
- Voce pode arrastar arquivos para a area de upload ou clicar para selecionar

**O que testar:**
- Envie pelo menos um arquivo — ele deve aparecer na lista de "Arquivos Selecionados"
- Se um arquivo falhar no envio, ele aparece em uma secao vermelha "Falhas no Envio"
- Na secao de falhas, clique em "Tentar novamente" para reenviar o arquivo
- Clique no "X" para descartar um arquivo com falha
- Voce so pode avancar se tiver pelo menos um arquivo enviado com sucesso

### Passo 4 — Pagamento

- Escolha a forma de pagamento (credito da assinatura ou pagamento avulso via PIX)
- Confirme o pagamento

**O que testar:**
- Apos confirmar o pagamento, voce deve ser redirecionado para "Meus Diagnosticos"
- Um banner verde deve aparecer no topo da pagina dizendo "Diagnostico iniciado com sucesso!"
- Sua analise aparecera na lista com status "Processando"

---

## 2. Consultar Diagnosticos

- Acesse "Meus Diagnosticos" no menu
- Voce vera a lista de todos os diagnosticos solicitados

**O que testar:**
- Cada diagnostico mostra o tipo de transacao, data e status atual
- Se houver muitos diagnosticos, deve haver botoes de paginacao (Anterior/Proximo)
- Clique em um diagnostico concluido para ver o relatorio completo

---

## 3. Relatorio do Diagnostico (PDF)

- Abra um diagnostico com status "Concluido"
- Voce vera o relatorio completo com sumario, riscos identificados e recomendacoes

**O que testar:**
- Clique no botao "Baixar PDF" — o dialogo de impressao do navegador deve abrir
- Na janela de impressao, selecione "Salvar como PDF" como destino
- O PDF gerado deve mostrar apenas o conteudo do relatorio, sem menus de navegacao ou botoes
- O layout deve estar limpo e legivel

---

## 4. Assinatura

- Acesse "Minha Assinatura" no menu
- Voce vera detalhes do plano atual, creditos restantes e data de renovacao

### Testar Cancelamento

- Clique em "Cancelar Assinatura"
- Um modal de confirmacao deve aparecer com um aviso
- O modal informa ate quando voce tera acesso (fim do periodo atual)
- Clique em "Manter Assinatura" — o modal fecha e nada muda
- Clique em "Confirmar Cancelamento" — a assinatura e cancelada
- A pagina deve atualizar mostrando o novo status

---

## 5. Painel Administrativo (para Advogados)

Voce tera acesso ao painel de administracao com funcionalidades de revisao e gestao. Para acessar, navegue para `/admin` ou clique no link do painel no menu.

### 5.1 — Dashboard (Control Room)

- A tela inicial do admin mostra 4 cards com metricas em tempo real:
  - Aguardando Revisao (diagnosticos pendentes de revisao humana)
  - Pedidos de Certidoes (solicitacoes de documentos em andamento)
  - Processando IA (diagnosticos sendo gerados pela inteligencia artificial)
  - Entregues Hoje (diagnosticos finalizados no dia)
- Abaixo, ha um feed de atividades recentes e o status dos servicos do sistema

**O que testar:**
- Os numeros nos cards devem refletir a quantidade real de itens no sistema
- O feed de atividade deve mostrar acoes recentes (novos diagnosticos, pagamentos, etc.)
- Os links rapidos "Nova Revisao Manual" e "Emitir Certidoes" devem levar as paginas corretas

### 5.2 — Fila de Revisao

- Acesse "Fila de Revisao" no menu lateral
- Voce vera uma lista de diagnosticos gerados pela IA que precisam de revisao humana
- Cada item mostra: ID da transacao, nome do cliente, endereco, confianca da IA e prioridade

**O que testar:**
- A barra de confianca da IA deve ter cores diferentes (vermelho = baixa, amarelo = media, verde = alta)
- Clique em "Revisar" em qualquer item para abrir o editor de revisao

### 5.3 — Editor de Revisao (tela mais importante do admin)

- Ao clicar em "Revisar", voce entra no editor de revisao dividido em duas partes:
  - **Lado esquerdo**: Visualizador de documentos — mostra os PDFs e imagens enviados pelo cliente. Use as abas para alternar entre documentos
  - **Lado direito**: Editor da analise — aqui voce pode modificar o que a IA gerou

- No editor voce pode:
  - Editar o resumo executivo (campo de texto livre)
  - Editar, adicionar ou remover riscos identificados (cada risco tem nivel, descricao e recomendacao)
  - Editar, adicionar ou remover caminhos juridicos sugeridos

**O que testar:**
- Edite o resumo e clique em "Salvar Rascunho" — as alteracoes devem ser salvas sem aprovar
- Recarregue a pagina — o rascunho salvo deve permanecer
- Adicione um novo risco e mude o nivel de um existente
- Quando estiver satisfeito, clique em "Aprovar & Enviar" — o diagnostico sera marcado como entregue e o cliente sera notificado
- Apos aprovar, o item deve sair da fila de revisao

### 5.4 — Certidoes (Pedidos de Documentos)

- Acesse "Certidoes" no menu lateral
- Voce vera cards com pedidos de certidoes de registro de imoveis
- Cada card mostra: tipo do pedido, numero da matricula, cartorio, solicitante e data

**O que testar:**
- Em um pedido com status "Pendente", clique em "Assumir" — o status muda para "Em Andamento" e fica atribuido a voce
- Adicione notas ao pedido (ex: "Protocolo 12345 no 2o Cartorio")
- Quando o documento estiver pronto, clique em "Concluir" — o item sai da lista
- O fluxo correto e: Pendente → Assumir → Adicionar notas → Concluir

### 5.5 — Notificacoes

- Acesse "Notificacoes" no menu lateral
- O numero de notificacoes nao lidas aparece como um badge vermelho no menu

**O que testar:**
- Ao receber novos diagnosticos para revisao, uma notificacao deve aparecer
- Clique em uma notificacao — ela deve ser marcada como lida e linkar para o item correto
- Use "Marcar todas como lidas" para limpar o badge
- As notificacoes mostram prioridade (Alta/Media/Baixa) com cores diferentes

### 5.6 — Atalhos de Teclado

- Pressione Cmd+K (Mac) ou Ctrl+K (Windows) em qualquer tela do admin
- Uma paleta de comandos aparece permitindo navegar rapidamente entre paginas

**O que testar:**
- Digite "revisao" na paleta — deve filtrar e mostrar a opcao da Fila de Revisao
- Selecione um item e pressione Enter — deve navegar para a pagina

---

## 6. Navegacao e Acessibilidade

**O que testar:**
- Em todas as paginas, deve haver breadcrumbs (trilha de navegacao) mostrando onde voce esta
- Tente navegar usando apenas o teclado (Tab para mover entre elementos, Enter para clicar)
- Os menus dropdown (selects) devem funcionar com setas do teclado (cima/baixo), Enter para selecionar, e Escape para fechar
- Ao abrir um modal, o foco deve ficar preso dentro dele (Tab nao sai do modal)
- Ao fechar o modal, o foco volta para o botao que o abriu

---

## 7. Responsividade (Mobile)

- Acesse o sistema pelo celular ou redimensione a janela do navegador

**O que testar:**
- O menu principal deve se adaptar para navegacao mobile
- Os formularios devem ocupar a largura toda da tela
- Os botoes devem ser faceis de clicar com o dedo
- O modal deve ocupar a tela inteira no celular

---

## 8. Estados de Erro

**O que testar:**
- Se a pagina do relatorio tiver um erro, deve aparecer uma mensagem amigavel com opcao de tentar novamente (nao uma tela branca)
- Se o upload de arquivo falhar, deve mostrar qual arquivo falhou e permitir reenvio
- Se o pagamento falhar, deve mostrar uma mensagem clara do erro

---

## Resumo Rapido

| Funcionalidade | Como testar | Resultado esperado |
|---|---|---|
| Validacao de formulario | Deixe campos vazios e clique em outro campo | Erro aparece imediatamente |
| Upload com retry | Envie arquivo e simule falha | Botao "Tentar novamente" aparece |
| Pagamento | Complete o fluxo de pagamento | Banner verde + redirecionamento |
| PDF | Clique "Baixar PDF" no relatorio | Dialogo de impressao abre |
| Cancelar assinatura | Clique "Cancelar Assinatura" | Modal de confirmacao aparece |
| Navegacao por teclado | Use Tab e Enter para navegar | Todos os elementos sao acessiveis |
| Paginacao | Tenha multiplos diagnosticos | Botoes Anterior/Proximo funcionam |
| Admin — Dashboard | Acesse /admin | Cards com metricas reais |
| Admin — Revisao | Clique "Revisar" em um diagnostico | Editor split-pane com documentos e analise |
| Admin — Salvar rascunho | Edite a analise e salve | Alteracoes persistem apos recarregar |
| Admin — Aprovar | Clique "Aprovar & Enviar" | Item sai da fila, cliente notificado |
| Admin — Certidoes | Assumir → Notas → Concluir | Fluxo completo de gestao de pedidos |
| Admin — Notificacoes | Verifique badge no menu | Contador atualiza, marcar como lida funciona |
| Admin — Cmd+K | Pressione Cmd+K ou Ctrl+K | Paleta de comandos aparece |

---

Se encontrar algum problema, por favor anote:
1. Em qual pagina aconteceu
2. O que voce estava fazendo
3. O que esperava acontecer
4. O que aconteceu de fato
5. Se possivel, tire um print da tela

Obrigado por ajudar nos testes!
