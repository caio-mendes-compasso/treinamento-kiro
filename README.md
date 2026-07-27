# Treinamento Kiro

Repositório de apoio para o programa de treinamento do **Kiro IDE**. O projeto é uma API REST de catálogo de produtos que evolui ao longo das sessões — cada módulo adiciona novas funcionalidades e demonstra uma feature diferente do Kiro.

## Stack

- **Runtime**: Node.js + TypeScript (strict mode, ES2020, CommonJS)
- **HTTP**: Express 4.x + cors
- **Testes**: Vitest 4.x + fast-check 4.x + supertest 7.x
- **Qualidade**: ESLint 10.x + Prettier 3.x + eslint-config-prettier
- **Dev**: ts-node-dev (hot reload com transpile-only)
- **Dados**: In-memory (sem banco externo)

## Setup

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:3000` por padrão.

## Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor com hot reload (ts-node-dev) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda build compilado (`dist/server.js`) |
| `npm test` | Executa todos os testes (`vitest --run`) |
| `npm run lint` | Roda ESLint |
| `npm run lint:fix` | Corrige problemas de lint |
| `npm run format` | Formata com Prettier |

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Health check (status + timestamp) |
| GET | /products | Listagem com filtros, ordenação e paginação |

### Query params de `/products`

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| category | string | — | Filtro por categoria (`eletronicos`, `moveis`, `acessorios`) |
| minPrice | number | — | Preço mínimo (inclusivo, BRL) |
| maxPrice | number | — | Preço máximo (inclusivo, BRL) |
| sortBy | name \| price | name | Campo de ordenação |
| sortOrder | asc \| desc | asc | Direção da ordenação |
| limit | 1–100 | 10 | Itens por página |
| offset | ≥ 0 | 0 | Itens a pular |

**Resposta inclui metadata de paginação**: `total`, `page`, `hasNext`.

## Módulos do Treinamento

Cada sessão foca em uma feature do Kiro e adiciona algo ao projeto:

| # | Sessão | Feature do Kiro | O que adiciona ao projeto | Docs |
|---|--------|-----------------|---------------------------|------|
| 1 | Spec Driven Development | Specs (requirements → design → tasks) | Endpoint `/products`, services, types, testes | [docs/kiro-spec-driven](docs/kiro-spec-driven/) |
| 2 | Steering Documents | Steering files (.kiro/steering/) | Padrões de tech, estrutura, produto, testes, git flow | [docs/kiro-steering-documents](docs/kiro-steering-documents/) |
| 3 | Agent Hooks | Hooks (.kiro/hooks/) | Automações de lint on save e update README | [docs/kiro-hooks](docs/kiro-hooks/) |
| 4 | Kiro Powers | Powers + MCP | Integração com serviços externos via Powers | [docs/powers](docs/powers/) |
| 5 | Kiro Skills | Skills do agente | Skills customizadas (caveman, sql-optimization, TDD) | [docs/kiro-skills](docs/kiro-skills/) |
| 6 | Kiro CLI | CLI (autocomplete, chat, translate) | Uso do Kiro fora da IDE | [docs/kiro-cli](docs/kiro-cli/) |
| 7 | Caveman Mode | Compressão de tokens | Comunicação ultra-compacta para economizar contexto | [docs/kiro-caveman-training](docs/kiro-caveman-training/) |
| 8 | Subagents | Agentes especializados | Delegação de tarefas a subagentes | [docs/kiro-subagents](docs/kiro-subagents/) |

## Estrutura do Projeto

```
├── src/
│   ├── app.ts                  # Setup Express (middleware + rotas)
│   ├── server.ts               # Entrypoint (inicia HTTP listener)
│   ├── database/
│   │   └── products.ts         # Dados em memória + interface Product
│   ├── routes/
│   │   ├── health.ts           # GET /health
│   │   └── products.ts         # GET /products (pipeline: validate → filter → sort → paginate)
│   ├── services/
│   │   └── productService.ts   # Lógica de negócio (validação, filtros, sort, paginação)
│   └── types/
│       └── productTypes.ts     # Interfaces e tipos TypeScript
├── tests/
│   ├── unit/                   # Testes unitários (funções isoladas)
│   ├── property/               # Testes property-based (fast-check)
│   └── integration/            # Testes HTTP (supertest)
├── .kiro/
│   ├── agents/                 # Agentes customizados (story-refiner, test-generator)
│   ├── hooks/                  # Agent hooks configurados
│   ├── settings/               # Configurações (MCP servers)
│   ├── skills/                 # Skills (caveman, sql-optimization, TDD)
│   ├── specs/                  # Specs (requirements, design, tasks)
│   └── steering/               # Steering documents do projeto
├── docs/                       # Material de cada sessão de treinamento
└── backup-files/               # Backups de hooks e steerings para demos
```

## Configuração do Kiro

### Steering Documents (`.kiro/steering/`)

| Arquivo | Propósito |
|---------|-----------|
| `tech.md` | Stack, build system, convenções de código |
| `structure.md` | Arquitetura em camadas, naming, testes |
| `product.md` | Domínio do produto, endpoints, features |
| `padroes-testes.md` | Padrões para escrita de testes |
| `guia-git-flow.md` | Fluxo de branches e merges |
| `guia-commit.md` | Conventional commits |
| `guia-trello.md` | Integração com board Trello |

### Skills (`.kiro/skills/`)

| Skill | Descrição |
|-------|-----------|
| `caveman` | Comunicação ultra-compacta (65% menos tokens) |
| `sql-optimization` | Otimização de queries SQL |
| `test-driven-development` | TDD workflow |

### Agentes Customizados (`.kiro/agents/`)

| Agente | Descrição |
|--------|-----------|
| `story-refiner` | Refinamento de histórias de usuário com subtasks |
| `test-generator` | Geração de testes automatizados |

## Como usar este repositório

### Como instrutor
1. Clone o repo e rode `npm install`
2. Abra no Kiro IDE
3. Siga o material em `docs/` na ordem das sessões
4. Cada sessão tem seu próprio README com roteiro de apresentação
5. Use os arquivos em `backup-files/` para restaurar hooks/steerings durante demos

### Como participante
1. Clone o repo e rode `npm install`
2. Acompanhe a sessão ao vivo
3. Consulte os docs de cada módulo para revisão posterior
4. Explore os arquivos em `.kiro/` para entender a configuração

## Evolução progressiva

O projeto começa simples (Express + health check) e vai ganhando corpo:

```
Sessão 1 → Código (endpoint, services, types, testes)
Sessão 2 → Governança (steering documents com padrões do time)
Sessão 3 → Automação (hooks para lint, README, segurança)
Sessão 4 → Integração (powers e MCP servers)
Sessão 5 → Produtividade (skills customizadas)
Sessão 6 → CLI (uso headless e em pipelines)
Sessão 7 → Eficiência (caveman mode para economizar tokens)
Sessão 8 → Delegação (subagentes especializados)
```

## Arquitetura

```
Request → Route (thin handler) → Service (pure functions) → Database (in-memory)
```

- **Routes**: validam input, delegam para services, retornam resposta
- **Services**: funções puras que recebem dados como parâmetro (testáveis)
- **Database**: array de produtos em memória, sem side effects
- **Pipeline**: Validate → Filter → Sort → Paginate → Respond

---

> 📌 **Fontes**: [Documentação Kiro](https://kiro.dev/docs/)
