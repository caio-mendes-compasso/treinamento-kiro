# Agents, Custom Agents e Subagents no Kiro

> Referencia oficial: [https://kiro.dev/docs/](https://kiro.dev/docs/)

---

## 1. O que é um Agent?

### O Agent no contexto do Kiro

No Kiro, o **Agent** é o nucleo de inteligencia que executa tarefas no seu ambiente de desenvolvimento. Ele e a entidade de IA que le e edita arquivos, executa comandos no terminal, chama ferramentas (tools), interage com MCPs e toma decisoes com base no contexto do projeto.

Na pratica, quando voce faz um pedido ao Kiro (ex: "corrija o bug de autenticacao"), o agent:

1. Analisa o contexto do projeto (estrutura de pastas, codigo relevante, erros)
2. Planeja uma estrategia de correcao
3. Executa as alteracoes necessarias (edicao de codigo, execucao de testes)
4. Verifica se a correcao funciona
5. Reporta o resultado

O agent do Kiro opera em dois modos de autonomia:
- **Autopilot**: trabalha de ponta a ponta sem interrupcoes, voce revisa depois
- **Supervised**: pausa apos cada alteracao para voce aprovar ou rejeitar

---

## 2. O que sao Subagents?

**Subagents** sao agentes que rodam em paralelo ou de forma delegada pelo agente principal. Cada subagent tem seu proprio contexto isolado, mantendo o contexto do agente principal limpo e focado.


```
┌─────────────────────────────────────────────────────┐
│              SEM Subagents (sequencial)             │
│                                                     │
│  [Review] → [Testes] → [Docs] → Resposta            │
│  (contexto poluído, lento)                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              COM Subagents (paralelo)               │
│                                                     │
│  [Subagent: Review]  ──┐                            │
│  [Subagent: Testes]  ──┼──→ Resultado combinado     │
│  [Subagent: Docs]    ──┘                            │
│  (contexto limpo, rápido)                           │
└─────────────────────────────────────────────────────┘
```

---

## 3. O que é um Custom Agent?

Um **Custom Agent** e um agente especializado que voce define para tarefas ou workflows especificos. Ele e configurado por meio de um **arquivo Markdown** (`.md`) salvo em:

- `~/.kiro/agents/` — escopo global (disponivel em qualquer workspace)
- `<workspace>/.kiro/agents/` — escopo do projeto (compartilhavel via controle de versao)

O custom agent aparece automaticamente no seletor de agentes assim que o arquivo e salvo.

### Quando criar um Custom Agent?

- Quando voce tem um workflow repetitivo que precisa de regras especificas e devem seguir os mesmos critérios (ex: refinamento de historia, code review, infra AWS, migracao de banco)
- Quando quer restringir as ferramentas disponiveis para uma tarefa (ex: agente somente leitura para auditorias)
- Quando deseja integrar MCP servers especificos ao agente
- Quando quer compartilhar uma configuracao padronizada com seu time via git
- Quando precisa de um prompt de sistema personalizado para determinado dominio


## 4. Configurando um Custom Agent

### Estrutura do arquivo

O arquivo e um Markdown com **YAML front matter** no topo para configuracoes e o **corpo** como system prompt do agente.

```markdown
---
name: meu-agente-aws
description: Agente especializado em infra AWS com Terraform
model: claude-sonnet-4
tools:
  - read
  - write
  - shell
  - web
---

Voce e um engenheiro de infraestrutura especializado em AWS.
Sempre use Terraform para provisionamento.
Siga as melhores praticas de seguranca da AWS.
```

### Categorias de Tools

As tools sao declaradas por **categorias** (tags) no front matter:

| Categoria | O que inclui |
|-----------|-------------|
| `read` | Leitura de arquivos, listagem de diretorios, busca de conteudo |
| `write` | Escrita, edicao e exclusao de arquivos |
| `shell` | Execucao de comandos e gerenciamento de processos |
| `web` | Busca na internet e fetch de URLs |
| `subagent` | Capacidade de delegar tarefas para subagents |
| `context` | Ferramentas de contexto e steering |
| `@mcp` | Todas as ferramentas MCP definidas no mcp.json |
| `@builtin` | Todas as ferramentas built-in do Kiro |
| `*` | Tudo (todas as categorias acima) |

Quando novas tools sao adicionadas a uma categoria, seu agente automaticamente ganha acesso a elas.

### Integracao com MCP Servers

Voce pode embutir servidores MCP diretamente no arquivo do agente:

```markdown
---
name: agente-com-mcp
tools:
  - read
  - write
  - shell
mcpServers:
  aws-docs:
    command: uvx
    args: ["awslabs.aws-documentation-mcp-server@latest"]
    env:
      FASTMCP_LOG_LEVEL: ERROR
---

Use a documentacao AWS como referencia para suas respostas.
```

---

## 5. Configurando Permissoes (Permissions)

O sistema de permissoes do Kiro controla o que o agent pode ou nao fazer. As regras podem ser definidas inline no custom agent ou em arquivos separados.

### Estrutura de uma regra

Cada regra possui quatro campos:

| Campo | Descricao | Obrigatorio |
|-------|-----------|-------------|
| `capability` | O tipo de operacao sendo controlada | Sim |
| `match` | Padroes glob que o recurso precisa satisfazer | Nao (padrao: tudo) |
| `exclude` | Padroes glob que isentam o recurso da regra | Nao |
| `effect` | `deny`, `ask` ou `allow` | Sim |

### Hierarquia de resolucao

Os efeitos se resolvem por restritidade:

```
deny > ask > allow
```

Uma regra mais permissiva **nunca** pode sobrescrever uma mais restritiva, independentemente do escopo de origem.

### Exemplo: permissoes inline no custom agent

```markdown
---
name: agente-seguro
tools:
  - read
  - shell
permissions:
  rules:
    - capability: file_read
      match: "**/*.ts"
      effect: allow
    - capability: file_read
      match: "**/.env*"
      effect: deny
    - capability: shell
      match: "npm *"
      effect: allow
    - capability: shell
      match: "rm *"
      effect: deny
---

Voce e um agente de auditoria. Apenas leia codigo TypeScript.
Nunca acesse arquivos .env ou execute comandos destrutivos.
```

### Capabilities comuns

| Capability | Operacao |
|-----------|----------|
| `file_read` | Leitura de arquivos |
| `file_write` | Escrita/criacao de arquivos |
| `shell` | Execucao de comandos no terminal |
| `web_search` | Busca na internet |
| `web_fetch` | Busca de conteudo de URLs |
| `mcp_tool_call` | Chamadas a ferramentas MCP |

---

## 6. Resumo Comparativo

| Conceito | O que e | Onde configurar |
|----------|---------|-----------------|
| **Agent** | O agente principal do Kiro que executa tarefas | Configuracao interna do IDE |
| **Custom Agent** | Agente especializado definido pelo usuario | `~/.kiro/agents/` ou `.kiro/agents/` |
| **Subagent** | Agente delegado que roda em contexto isolado | Invocado automaticamente ou via prompt |

---

## 7. Links uteis

- [Documentacao oficial - Custom Agents (IDE)](https://kiro.dev/docs/custom-agents/)
- [Documentacao oficial - Subagents (IDE)](https://kiro.dev/docs/chat/subagents/)
- [Documentacao oficial - Custom Agents (CLI)](https://kiro.dev/docs/cli/custom-agents/)
- [Documentacao oficial - Permissoes (CLI v3)](https://kiro.dev/docs/cli/v3/permissions/)
- [Documentacao oficial - Agent Config (CLI v3)](https://kiro.dev/docs/cli/v3/agent-config/)
- [Exemplos de Custom Agents](https://kiro.dev/docs/cli/custom-agents/examples/)
- [Changelog IDE 1.0](https://kiro.dev/changelog/ide/1-0/)

---

*Conteudo baseado na documentacao oficial do Kiro (kiro.dev/docs). Informacoes parafraseadas para conformidade com restricoes de licenciamento.*
