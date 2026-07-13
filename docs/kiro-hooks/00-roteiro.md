# Hooks

## 📁 Eventos de Arquivo
Demo 1: Criando um Hook via UI

### Passo a passo:

1. **Abra o painel Agent Hooks** (sidebar do Kiro)
2. **Clique no `+`**
3. **Selecione**: "Manually create a hook"
4. **Preencha**:
   - **Title**: Lint on Save
   - **Description**: Roda ESLint automaticamente ao salvar arquivos TypeScript do projeto (src e tests)
   - **Event**: File Saved
   - **Patterns**: "src/**/*.ts tests/**/*.ts
   - **Action**: Run Command
   - **Command**: npm run format & npm run lint:fix
5. **Clique em "Create Hook"**
6. **Teste**:
   - Adicione identação no arquivo productService.ts
   - Ao salvar o arquivo o hook será executado e o arquivo voltará ao normal


## 💬 Eventos de Prompt/Agent

### Passo a passo:
1. **Abra o painel Agent Hooks** (sidebar do Kiro)
2. **Clique no `+`**
3. **Selecione**: "Manually create a hook"
4. **Preencha**:
   - **Title**: Rode os testes quando o agente parar
   - **Description**: Executa os testes automaticamente após o agente finalizar uma tarefa
   - **Event**: Agent Stop
   - **Action**: Run Command
   - **Command**: npx vitest --run --clearCache
5. **Clique em "Create Hook"**
6. **Teste**:
   digite qualquer coisa no chat e veja os testes serem executados quando o agente parar

## 🔧 Eventos de Ferramenta
Demo: Hook de revisão antes de escrita em arquivos

Por que é útil?
Funciona como um "code review automático" em tempo real
Garante que o agente respeite as convenções do projeto em toda escrita
Diferente do lint (que cuida de formatação), esse cuida de arquitetura e padrões

### Passo a passo:
1. **Abra o painel Agent Hooks** (sidebar do Kiro)
2. **Clique no `+`**
3. **Selecione**: "Manually create a hook"
4. **Preencha**: 
   - **Title:** Review antes de escrever
   - **Description:** Antes de qualquer operação de escrita em arquivo, o agente verifica se o código segue os padrões do projeto
   - **Event:** Pre Tool Use
   - **Tool Types:** write
   - **Action:** Ask Agent
   - **Instructions**:
   ```
   "Antes de escrever, verifique:
   1. O código segue o padrão de camadas (routes → services → database)?
   2. Funções de service são puras?
   3. Naming conventions estão corretas?
   Se algo estiver fora do padrão, corrija antes de salvar.
   ```
5. **Clique em "Create Hook"**
6. **Teste**:
   - Peça ao Kiro: "Adicione um endpoint GET /categories que retorna as categorias disponíveis"
   - Observe que antes de cada escrita de arquivo, o agente faz uma auto-revisão dos padrões
   - (Em caso de ter tempo disponível) Compare com o resultado sem o hook (desabilite e repita)


## 📋 Eventos de Task (Specs)


## 🖱️ Evento Manual
Demo 3: Criando um Hook via Chat,
Hook de atualização do README do projeto (Manual Trigger)

### Passo a passo:

1. **No chat, digite**:
    ```
    Crie um hook manual que atualize o README.md na raiz do projeto
    ```
2. **O Kiro vai criar um hook com trigger Manual**
3. **Teste**:
   - Abra `src/services/tarefa-service.js`
   - Vá no painel **Agent Hooks**
   - Clique no botão ▶️ do hook "Atualizar README"
   - Observe o Kiro atualizar o arquivo

4. Comparar **tempo** e **créditos** entre esse e o hook de lint (Demo 1)
    