# Treinamento Kiro

Repositório de apoio para o programa de treinamento do **Kiro IDE**. O projeto é uma API REST de catálogo de produtos que evolui ao longo das sessões — cada módulo adiciona novas funcionalidades e demonstra uma feature diferente do Kiro.

## Stack

- Node.js + TypeScript (strict mode, ES2020, CommonJS)
- Express 4.x + CORS
- Vitest 4.x + fast-check + supertest (testes)
- ESLint 10.x + Prettier (qualidade de código)
- ts-node-dev (hot reload em desenvolvimento)
- Dados em memória (sem banco externo)

## Setup

```bash
npm install
npm run dev
```

O servidor sobe por padrão na porta `3000`.

## Comandos disponíveis

| Comando           | Descrição                        |
| ----------------- | -------------------------------- |
| `npm run dev`     | Servidor com hot reload          |
| `npm run build`   | Compila TypeScript para `dist/`  |
| `npm start`       | Roda build compilado             |
| `npm test`        | Executa todos os testes          |
| `npm run lint`    | Roda ESLint                      |
| `npm run lint:fix`| Corrige problemas de lint        |
| `npm run format`  | Formata com Prettier             |

## Endpoints

| Método | Rota       | Descrição                                    |
| ------ | ---------- | -------------------------------------------- |
| GET    | `/health`  | Health check (status + timestamp)            |
| GET    | `/products`| Listagem com filtros, ordenação e paginação  |

### Query params de `/products`

| Param     | Tipo           | Default | Descrição                    |
| --------- | -------------- | ------- | ---------------------------- |
| category  | string         | —       | Filtro por categoria (exato) |
| minPrice  | number         | —       | Preço mínimo (inclusivo)     |
| maxPrice  | number         | —       | Preço máximo (inclusivo)     |
| sortBy    | name \| price  | name    | Campo de ordenação           |
| sortOrder | asc \| desc    | asc     | Direção da ordenação         |
| limit     | 1–100          | 10      | Itens por página             |
| offset    | ≥ 0            | 0       | Itens a pular                |

Categorias disponíveis: `eletronicos`, `moveis`, `acessorios`

## Módulos do Treinamento

Cada sessão foca em uma feature do Kiro e adiciona algo ao projeto:

| #   | Sessão                   | Feature do Kiro                          | O que adiciona ao projeto                         | Docs                                                     |
| --- | ------------------------ | ---------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| 1   | Spec Driven Development  | Specs (requirements → design → tasks)    | Endpoint `/products`, services, types, testes     | [docs/kiro-spec-driven](docs/kiro-spec-driven/)          |
| 2   | Steering Documents       | Steering files (.kiro/steering/)         | Padrões de tech, estrutura, produto, testes, git  | [docs/kiro-steering-documents](docs/kiro-steering-documents/) |
| 3   | Agent Hooks              | Hooks (.kiro/hooks/)                     | Automações de lint on save e update README        | [docs/kiro-hooks](docs/kiro-hooks/)                      |
| 4   | Kiro Powers              | Powers + MCP                             | Integração com serviços externos via Powers       | [docs/powers](docs/powers/)                              |
| 5   | Kiro Skills              | Skills do agente                         | Skills customizadas (caveman, TDD, SQL)           | [docs/kiro-skills](docs/kiro-skills/)                    |
| 6   | Kiro CLI                 | CLI (autocomplete, chat, translate)      | Uso do Kiro fora da IDE                           | [docs/kiro-cli](docs/kiro-cli/)                          |
| 7   | Caveman Mode             | Compressão de tokens                     | Comunicação ultra-compacta para economizar contexto| [docs/kiro-caveman-training](docs/kiro-caveman-training/) |
| 8   | Subagents                | Agentes especializados                   | Delegação de tarefas a subagentes                 | [docs/kiro-subagents](docs/kiro-subagents/)              |

## Estrutura do Projeto

```text
├── src/
│   ├── app.ts                  # Setup Express (middleware + rotas)
│   ├── server.ts               # Entrypoint
│   ├── database/
│   │   └── products.ts         # Produtos em memória
│   ├── routes/
│   │   ├── health.ts           # GET /health
│   │   └── products.ts         # GET /products (pipeline)
│   ├── services/
│   │   └── productService.ts   # Validate, filter, sort, paginate
│   └── types/
│       └── productTypes.ts     # Interfaces e tipos
├── tests/
│   ├── unit/                   # Testes unitários
│   ├── property/               # Testes property-based (fast-check)
│   └── integration/            # Testes HTTP (supertest)
├── .kiro/
│   ├── agents/                 # Agentes customizados (story-refiner, test-generator)
│   ├── hooks/                  # Agent hooks configurados
│   ├── skills/                 # Skills (caveman, sql-optimization, TDD)
│   ├── specs/                  # Specs (requirements, design, tasks)
│   └── steering/               # Steering documents do projeto
├── docs/                       # Material de cada sessão de treinamento
└── backup-files/               # Backups de hooks e steerings para demos
```

## Configurações do Kiro

### Steering Documents (`.kiro/steering/`)

| Arquivo             | Descrição                                      |
| ------------------- | ---------------------------------------------- |
| `tech.md`           | Stack, ferramentas e convenções técnicas       |
| `structure.md`      | Estrutura de pastas e padrões de arquitetura   |
| `product.md`        | Contexto de produto e domínio                  |
| `padroes-testes.md` | Padrões para escrita de testes                 |
| `guia-git-flow.md`  | Fluxo de branches e versionamento              |
| `guia-commit.md`    | Padrão de mensagens de commit                  |
| `guia-trello.md`    | Integração e workflow com Trello               |

### Agents (`.kiro/agents/`)

| Agente              | Descrição                                      |
| ------------------- | ---------------------------------------------- |
| `story-refiner`     | Refinamento de histórias de usuário            |
| `test-generator`    | Geração de testes automatizados                |

### Skills (`.kiro/skills/`)

| Skill                    | Descrição                                  |
| ------------------------ | ------------------------------------------ |
| `caveman`                | Comunicação ultra-comprimida (65% menos tokens) |
| `sql-optimization`       | Otimização de queries SQL                  |
| `test-driven-development`| Workflow de TDD guiado                     |

## Como usar este repositório

### Como instrutor

1. Clone o repo e rode `npm install`
2. Abra no Kiro IDE
3. Siga o material em `docs/` na ordem das sessões
4. Cada sessão tem seu próprio README com roteiro de apresentação

### Como participante

1. Clone o repo e rode `npm install`
2. Acompanhe a sessão ao vivo
3. Consulte os docs de cada módulo para revisão posterior
4. Explore os arquivos em `.kiro/` para entender a configuração

## Evolução progressiva

O projeto começa simples (Express + health check) e vai ganhando corpo:

```text
Sessão 1 → Código (endpoint, services, types, testes)
Sessão 2 → Governança (steering documents com padrões do time)
Sessão 3 → Automação (hooks para lint, README, segurança)
Sessão 4 → Integração (powers e MCP servers)
Sessão 5 → Produtividade (skills customizadas)
Sessão 6 → CLI (uso headless e em pipelines)
Sessão 7 → Eficiência (caveman mode para economizar tokens)
Sessão 8 → Delegação (subagentes especializados)
```

---

> 📌 **Fontes**: [Documentação Kiro](https://kiro.dev/docs/)
