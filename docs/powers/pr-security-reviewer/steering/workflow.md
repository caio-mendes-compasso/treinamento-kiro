# Workflow: Revisão de Segurança de PR

Fluxo completo passo-a-passo que o agente deve seguir ao receber um pedido de revisão de segurança.

---

## Step 1: Identificar a PR

O usuário pode informar a PR de várias formas. Parse o input para extrair:

- **Número da PR**: `#42`, `42`
- **URL completa**: `https://github.com/owner/repo/pull/42`
- **Formato owner/repo#number**: `owner/repo#42`

Se o repositório não foi informado, use o repositório do workspace atual (extrair de `.git/config` ou do remote origin).

### Validação

- Confirme que o número da PR é um inteiro positivo
- Confirme que o repositório existe e é acessível
- Confirme que a PR está aberta (não faz sentido revisar PR já merged/closed)

---

## Step 2: Obter o Diff da PR

Use a API do GitHub (via MCP) para buscar os arquivos alterados na PR.

### Informações necessárias

Para cada arquivo alterado, obtenha:
- **filename**: caminho do arquivo
- **status**: added, modified, removed, renamed
- **patch**: o diff em formato unified diff
- **additions**: número de linhas adicionadas

### Filtros

- Ignore arquivos removidos (status `removed`) — não há código novo para analisar
- Ignore arquivos binários (imagens, PDFs, etc.)
- Ignore arquivos de lock (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Foque nas linhas ADICIONADAS (prefixo `+` no diff) — linhas removidas não são vulnerabilidades novas

---

## Step 3: Analisar o Código Alterado

Para cada arquivo e cada linha adicionada, execute as verificações de segurança.

### Processo de Análise

1. **Para cada arquivo alterado:**
   - Identifique o tipo de arquivo (extensão, caminho)
   - Verifique se é arquivo de teste/exemplo (reduzir severidade se for)
   - Analise cada hunk do diff

2. **Para cada linha adicionada (prefixo `+`):**
   - Execute todos os padrões de detecção (ver steering `patterns.md`)
   - Registre matches com: arquivo, linha, padrão que deu match, severidade, contexto

3. **Pós-processamento:**
   - Elimine false positives óbvios (valores placeholder, exemplos em docs)
   - Agrupe findings do mesmo tipo quando adjacentes
   - Calcule o score de segurança

### Contexto para Redução de Falsos Positivos

Considere estes fatores para reduzir falsos positivos:

- **Diretórios de teste**: `tests/`, `__tests__/`, `test/`, `spec/`, `*.test.*`, `*.spec.*`
- **Diretórios de docs**: `docs/`, `examples/`, `README*`
- **Valores placeholder**: `YOUR_API_KEY`, `xxx`, `placeholder`, `example`, `test_`, `fake_`
- **Variáveis de ambiente sem valor**: `process.env.SECRET` (referência, não exposição)
- **Imports de env**: ler de `.env` é OK, commitar o `.env` é problema

---

## Step 4: Criar Review Comments Inline

Para cada vulnerabilidade encontrada, crie um review comment na linha exata.

### Estrutura do Comment

```markdown
{emoji_severidade} **Security Issue: {tipo_vulnerabilidade}**

**Severidade:** {Critical|High|Medium|Low}

**Risco:** {explicação do risco em 1-2 frases}

**Sugestão:**
```suggestion
{código corrigido se possível}
```

> {recomendação adicional}
```

### Regras para Comments

- Use blocos `suggestion` do GitHub SEMPRE que possível (facilita one-click fix)
- Se não for possível sugerir código (ex: remover completamente), explique o que fazer
- Um comment por vulnerabilidade (não agrupe múltiplos problemas em um comment)
- A posição do comment deve ser na linha exata onde o problema foi detectado
- Use a posição relativa ao diff (campo `position` no PR review comment API)

### Exemplos de Comments por Tipo

#### API Key Hardcoded

```markdown
🔴 **Security Issue: Hardcoded API Key**

**Severidade:** Critical

**Risco:** API keys no código-fonte ficam expostas no histórico do git. Qualquer pessoa com acesso ao repositório pode extrair e usar esta chave.

**Sugestão:**
```suggestion
const apiKey = process.env.STRIPE_API_KEY;
```

> Mova a chave para uma variável de ambiente. Adicione `STRIPE_API_KEY` ao seu `.env` (não commitado) e ao `.env.example` (sem o valor real).
```

#### Log com Dados Sensíveis

```markdown
🟡 **Security Issue: Sensitive Data in Logs**

**Severidade:** Medium

**Risco:** Logs com dados pessoais (CPF, email, telefone) podem ser acessados por pessoas sem autorização e violam a LGPD.

**Sugestão:**
```suggestion
console.log(`Usuário processado: ${user.id}`);
```

> Nunca logue dados pessoais identificáveis. Use apenas IDs internos ou dados anonimizados em logs.
```

#### Arquivo .env Commitado

```markdown
🟠 **Security Issue: .env File Committed**

**Severidade:** High

**Risco:** Arquivos .env contêm credenciais e configurações sensíveis. Uma vez commitados, ficam no histórico do git permanentemente.

> Remova este arquivo do repositório com `git rm --cached .env`, adicione `.env` ao `.gitignore`, e rotacione TODAS as credenciais que estavam neste arquivo (elas já foram expostas).
```

---

## Step 5: Calcular Score e Preparar Relatório

### Cálculo do Score

```
score = 100 - (critical * 25) - (high * 15) - (medium * 8) - (low * 3)
score = Math.max(0, score)
```

### Preparar o Body da Review

Monte o relatório seguindo o template documentado no POWER.md:

1. Tabela de resumo por severidade
2. Lista de arquivos afetados com contagem de issues
3. Score de segurança
4. Recomendação baseada no score e nas severidades encontradas

### Recomendações por Cenário

| Cenário | Texto da Recomendação |
|---------|----------------------|
| Score 90-100, sem critical/high | ✅ **Aprovar** — Código seguro, nenhuma vulnerabilidade significativa encontrada. |
| Score 70-89, sem critical | ⚠️ **Revisar** — Problemas de média severidade detectados. Considere corrigir antes do merge. |
| Score 40-69, com high | ❌ **Corrigir e re-submeter** — Vulnerabilidades significativas encontradas. Corrija os pontos indicados. |
| Score 0-39, com critical | 🚨 **Bloquear** — Vulnerabilidades críticas detectadas. Corrija imediatamente e rotacione quaisquer secrets expostos. |
| Nenhum problema | ✅ **Aprovar** — Nenhuma vulnerabilidade de segurança detectada. Código seguro para merge. 🎉 |

---

## Step 6: Submeter a Review

Use a API do GitHub (via MCP) para submeter a review com:

- **event**: `REQUEST_CHANGES`, `COMMENT`, ou `APPROVE` (baseado na lógica do POWER.md)
- **body**: o relatório completo formatado
- **comments**: array de inline comments com posição no diff

### Lógica de Decisão do Status

```
if (critical > 0 || high > 0):
    event = "REQUEST_CHANGES"
elif (medium > 0 || low > 0):
    event = "COMMENT"
else:
    event = "APPROVE"
```

### Após Submissão

Informe ao usuário:
- Quantas vulnerabilidades foram encontradas
- O score de segurança
- O status da review submetida
- Link direto para a review na PR (se disponível)

---

## Fluxo Resumido

```
1. Parse input → extrair owner, repo, PR number
2. GET /repos/{owner}/{repo}/pulls/{number}/files → obter diff
3. Para cada arquivo alterado:
   a. Filtrar linhas adicionadas
   b. Executar padrões de detecção
   c. Registrar findings
4. Pós-processar: eliminar falsos positivos, calcular score
5. Montar review comments inline
6. Montar relatório (body da review)
7. POST review com status + comments + body
8. Reportar resultado ao usuário
```
