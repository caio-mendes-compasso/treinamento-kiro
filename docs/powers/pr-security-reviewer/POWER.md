---
name: "pr-security-reviewer"
displayName: "PR Security Reviewer"
description: "Analisa Pull Requests no GitHub em busca de vulnerabilidades de segurança no código alterado, comenta inline nos pontos problemáticos e submete review com REQUEST_CHANGES quando encontra problemas."
keywords: ["security", "pull-request", "vulnerabilities", "secrets", "code-review", "github-pr"]
author: "Fernando Henrique Utik"
---

# PR Security Reviewer

## Overview

Power que automatiza a revisão de segurança em Pull Requests do GitHub. Recebe o número de uma PR (ou URL), analisa todos os arquivos modificados (diff) em busca de vulnerabilidades de segurança, comenta inline nos pontos problemáticos e submete uma review com status apropriado.

O foco principal é detectar **exposição de dados sensíveis** no código: secrets hardcoded, credenciais, tokens, chaves de API, informações pessoais em logs, connection strings e padrões conhecidos de secrets de diversos provedores.

## Available Steering Files

- **workflow.md** — Fluxo completo passo-a-passo: da recepção da PR até submissão da review
- **patterns.md** — Catálogo de padrões regex e heurísticas para detecção de vulnerabilidades

## Funcionalidades

1. **Receber uma PR** — aceita número da PR, URL completa, ou formato `owner/repo#number`
2. **Obter o diff** — usa GitHub API para buscar arquivos alterados
3. **Analisar código alterado** buscando vulnerabilidades de segurança
4. **Comentar inline na PR** — cria review comments na linha exata do problema
5. **Submeter review com status apropriado** — REQUEST_CHANGES, COMMENT ou APPROVE
6. **Gerar relatório resumido** — contagem por severidade, score e recomendação

## Onboarding

### Pré-requisitos

- Power `github-pr-opener` (ou qualquer power com MCP server do GitHub) instalado e configurado
- Token do GitHub com permissões de leitura em PRs e escrita em reviews (`repo` scope)
- Repositório acessível via API do GitHub

### Como Usar

O usuário informa a PR de uma destas formas:

```
Analise a segurança da PR #42
Revise segurança: https://github.com/owner/repo/pull/42
Review de segurança em owner/repo#42
```

O agente então executa o fluxo completo automaticamente.

## Categorias de Vulnerabilidades

### 🔴 Critical

- API keys, tokens ou secrets hardcoded
- Chaves privadas (RSA, SSH, PGP) expostas
- AWS Access Keys / Secret Keys
- Connection strings com credenciais

### 🟠 High

- Senhas em texto plano
- Tokens JWT hardcoded
- GitHub tokens, Slack webhooks expostos
- URLs com credenciais embutidas (`https://user:password@host`)
- Arquivo `.env` adicionado ao repositório

### 🟡 Medium

- Logs que expõem informações sensíveis (CPF, email, telefone, endereço)
- Variáveis de ambiente com valores sensíveis commitados
- Comentários com informações confidenciais

### 🔵 Low

- Padrões suspeitos que podem ser false positives
- Nomes de variáveis sugestivos sem valor hardcoded confirmado
- Configurações de debug habilitadas em código que parece produção

## Formato dos Comentários Inline

Para cada vulnerabilidade encontrada, o comment inline segue este template:

```markdown
🔴 **Security Issue: Hardcoded Credential**

**Severidade:** Critical

**Risco:** Credenciais no código-fonte ficam expostas no histórico do git e podem ser acessadas por qualquer pessoa com acesso ao repositório.

**Sugestão:**
```suggestion
const password = process.env.DB_PASSWORD;
```

> Mova valores sensíveis para variáveis de ambiente e use `.env` (não commitado) para desenvolvimento local.
```

## Lógica de Status da Review

| Condição | Status | Ação |
|----------|--------|------|
| Encontrou problemas 🔴 Critical ou 🟠 High | `REQUEST_CHANGES` | Bloqueia merge |
| Encontrou apenas 🟡 Medium ou 🔵 Low | `COMMENT` | Alerta sem bloquear |
| Não encontrou vulnerabilidades | `APPROVE` | Aprova com mensagem positiva |

## Formato do Relatório (Body da Review)

```markdown
## 🔒 Security Review Report

### Resumo
| Severidade | Contagem |
|------------|----------|
| 🔴 Critical | X |
| 🟠 High | X |
| 🟡 Medium | X |
| 🔵 Low | X |

### Arquivos Afetados
- `src/config/database.ts` (2 issues)
- `src/services/auth.ts` (1 issue)

### Score de Segurança: **35/100**

### Recomendação
❌ **Corrigir e re-submeter** — Foram encontradas vulnerabilidades críticas que impedem a aprovação desta PR. Corrija os pontos indicados e solicite nova revisão.
```

## Score de Segurança (0-100)

O score é calculado com base na quantidade e severidade dos problemas encontrados:

- Cada 🔴 Critical: -25 pontos
- Cada 🟠 High: -15 pontos
- Cada 🟡 Medium: -8 pontos
- Cada 🔵 Low: -3 pontos
- Score mínimo: 0
- Score inicial: 100

### Interpretação do Score

| Score | Recomendação |
|-------|--------------|
| 90-100 | ✅ Aprovar — Nenhum ou poucos problemas menores |
| 70-89 | ⚠️ Revisar — Problemas de média severidade detectados |
| 40-69 | ❌ Corrigir — Vulnerabilidades significativas encontradas |
| 0-39 | 🚨 Bloquear — Vulnerabilidades críticas, corrigir imediatamente |

## Best Practices

- Sempre analise TODOS os arquivos alterados na PR, não apenas os mais óbvios
- Considere o contexto: um valor que parece uma key pode ser um placeholder ou exemplo de documentação
- Use blocos `suggestion` do GitHub sempre que possível para facilitar a correção
- Não marque como vulnerability valores que são claramente exemplos ou testes (ex: `test_api_key_123`)
- Ao encontrar um `.env` adicionado, verifique se existe um `.env.example` correspondente
- Respeite o princípio de menor surpresa: explique claramente cada problema encontrado
- Agrupe problemas do mesmo tipo quando estão próximos no mesmo arquivo

## Troubleshooting

### PR não encontrada

**Causa:** Número incorreto ou repositório sem acesso
**Solução:** Verificar que o token tem acesso ao repositório e que o número da PR está correto

### Review não submetida

**Causa:** Token sem permissão de escrita em reviews
**Solução:** Garantir que o token do GitHub tem scope `repo` ou `public_repo`

### Falsos positivos excessivos

**Causa:** Código de testes ou exemplos sendo marcados como vulnerabilidades
**Solução:** O agente deve considerar o contexto do arquivo (diretório `tests/`, `examples/`, `docs/`)

## Configuration

Este power utiliza o MCP server do GitHub já configurado no workspace. Certifique-se de que o power `github-pr-opener` ou equivalente está instalado e funcionando.

Nenhuma configuração adicional é necessária além do token do GitHub com permissões adequadas.
