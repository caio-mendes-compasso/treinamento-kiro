# Padrões de Detecção de Vulnerabilidades

Catálogo completo de padrões regex e heurísticas usadas para detectar vulnerabilidades de segurança em código.

---

## Estrutura de um Padrão

Cada padrão tem:
- **Nome**: identificador do tipo de vulnerabilidade
- **Severidade**: Critical, High, Medium, Low
- **Regex**: expressão regular para detecção
- **Descrição**: o que o padrão detecta
- **Exceções**: quando NÃO marcar como vulnerabilidade
- **Sugestão de correção**: template de fix

---

## 🔴 Critical Patterns

### AWS Access Key

```
Regex: (?:AKIA|ASIA)[A-Z0-9]{16}
Severidade: Critical
Descrição: AWS Access Key ID hardcoded
Exceção: Valor em comentário marcado como "example" ou "placeholder"
Fix: Usar variável de ambiente AWS_ACCESS_KEY_ID
```

### AWS Secret Key

```
Regex: (?:aws)?_?(?:secret)?_?(?:access)?_?key["'\s]*[:=]\s*["'][A-Za-z0-9/+=]{40}["']
Severidade: Critical
Descrição: AWS Secret Access Key hardcoded
Fix: Usar variável de ambiente AWS_SECRET_ACCESS_KEY
```

### Private Key (RSA/SSH/PGP)

```
Regex: -----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----
Severidade: Critical
Descrição: Chave privada exposta no código-fonte
Fix: Mover para arquivo separado não commitado ou usar secret manager
```

### Generic Secret/Token Assignment (High Entropy)

```
Regex: (?:secret|token|password|passwd|pwd|api_?key|apikey|auth_?token|access_?token|private_?key)["'\s]*[:=]\s*["'][A-Za-z0-9+/=_\-]{20,}["']
Severidade: Critical
Descrição: Valor de secret/token hardcoded com alta entropia
Exceção: Valores placeholder (YOUR_*, CHANGE_ME, example, test_, fake_, xxx, placeholder)
Fix: Mover para variável de ambiente
```

### GitHub Personal Access Token

```
Regex: gh[pousr]_[A-Za-z0-9_]{36,255}
Severidade: Critical
Descrição: GitHub token (PAT, OAuth, etc.) hardcoded
Fix: Usar variável de ambiente GITHUB_TOKEN
```

### Google API Key

```
Regex: AIza[0-9A-Za-z\-_]{35}
Severidade: Critical
Descrição: Google API Key hardcoded
Fix: Usar variável de ambiente e restringir a key por domínio/IP no console do Google
```

### Stripe Secret Key

```
Regex: sk_live_[0-9a-zA-Z]{24,}
Severidade: Critical
Descrição: Stripe secret key de produção hardcoded
Fix: Usar variável de ambiente STRIPE_SECRET_KEY
```

### Stripe Publishable Key (Live)

```
Regex: pk_live_[0-9a-zA-Z]{24,}
Severidade: High
Descrição: Stripe publishable key de produção (menos crítica mas deve ser protegida)
Fix: Usar variável de ambiente STRIPE_PUBLISHABLE_KEY
```

---

## 🟠 High Patterns

### Password/Senha em Texto Plano

```
Regex: (?:password|senha|passwd|pwd)["'\s]*[:=]\s*["'][^"']{4,}["']
Severidade: High
Descrição: Senha em texto plano no código
Exceção: Valores como "password", "123456", "test" em arquivos de teste
Fix: Usar variável de ambiente ou secret manager
```

### Connection String com Credenciais

```
Regex: (?:mongodb|postgres|postgresql|mysql|redis|amqp|mssql):\/\/[^:]+:[^@]+@[^\s"']+
Severidade: High
Descrição: Connection string com usuário e senha embutidos
Fix: Montar connection string a partir de variáveis de ambiente separadas
```

### URL com Credenciais Embutidas

```
Regex: https?:\/\/[^:]+:[^@]+@[^\s"']+
Severidade: High
Descrição: URL com user:password no formato básico HTTP auth
Fix: Usar autenticação via headers ou variáveis de ambiente
```

### JWT Token Hardcoded

```
Regex: eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_\-]{10,}
Severidade: High
Descrição: Token JWT hardcoded (formato header.payload.signature)
Fix: Tokens devem ser gerados dinamicamente, nunca hardcoded
```

### Slack Webhook URL

```
Regex: https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+
Severidade: High
Descrição: Slack Webhook URL exposta
Fix: Usar variável de ambiente SLACK_WEBHOOK_URL
```

### SendGrid API Key

```
Regex: SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}
Severidade: High
Descrição: SendGrid API Key hardcoded
Fix: Usar variável de ambiente SENDGRID_API_KEY
```

### Twilio Auth Token

```
Regex: (?:twilio).*["'][0-9a-f]{32}["']
Severidade: High
Descrição: Twilio auth token hardcoded
Fix: Usar variável de ambiente TWILIO_AUTH_TOKEN
```

### Arquivo .env Adicionado ao Repositório

```
Regex (filename): ^\.env$|^\.env\.local$|^\.env\.production$
Severidade: High
Descrição: Arquivo .env com credenciais commitado ao repositório
Exceção: .env.example, .env.template, .env.sample (sem valores reais)
Fix: Remover com git rm --cached, adicionar ao .gitignore, rotacionar secrets
```

### Heroku API Key

```
Regex: (?:heroku).*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
Severidade: High
Descrição: Heroku API Key hardcoded
Fix: Usar variável de ambiente HEROKU_API_KEY
```

---

## 🟡 Medium Patterns

### Log com Dados Pessoais (CPF)

```
Regex: (?:console\.log|logger\.\w+|print|log\.\w+)\s*\([^)]*(?:cpf|document|documento|identidade)[^)]*\)
Severidade: Medium
Descrição: Log que pode expor CPF ou número de documento
Exceção: Se o valor logado é claramente mascarado (***) ou é apenas o campo name
Fix: Remover dados pessoais do log ou mascarar (ex: ***.***.***-**)
```

### Log com Email

```
Regex: (?:console\.log|logger\.\w+|print|log\.\w+)\s*\([^)]*(?:email|e-mail|mail)[^)]*\)
Severidade: Medium
Descrição: Log que pode expor endereço de email
Fix: Usar apenas ID do usuário em logs, nunca email
```

### Log com Telefone

```
Regex: (?:console\.log|logger\.\w+|print|log\.\w+)\s*\([^)]*(?:phone|telefone|celular|tel)[^)]*\)
Severidade: Medium
Descrição: Log que pode expor número de telefone
Fix: Remover dados pessoais do log
```

### Log com Endereço

```
Regex: (?:console\.log|logger\.\w+|print|log\.\w+)\s*\([^)]*(?:address|endereco|endereço|cep)[^)]*\)
Severidade: Medium
Descrição: Log que pode expor endereço físico
Fix: Remover dados pessoais do log
```

### Log com Nome Completo em Contexto Sensível

```
Regex: (?:console\.log|logger\.\w+|print|log\.\w+)\s*\([^)]*(?:fullName|nome_completo|full_name)[^)]*\)
Severidade: Medium
Descrição: Log que pode expor nome completo do usuário
Fix: Usar apenas ID ou iniciais em logs
```

### Variável de Ambiente com Valor Hardcoded

```
Regex: (?:process\.env\.\w+\s*\|\|\s*["'][A-Za-z0-9+/=_\-]{16,}["'])|(?:ENV\[["']\w+["']\]\s*\|\|\s*["'][^"']{16,}["'])
Severidade: Medium
Descrição: Fallback de variável de ambiente com valor sensível hardcoded
Fix: Remover fallback ou usar valor não-sensível para desenvolvimento
```

### Comentário com Informação Confidencial

```
Regex: (?:\/\/|#|\/\*)\s*(?:TODO|FIXME|HACK|NOTE)?\s*(?:password|senha|secret|token|key|credential).*[:=]\s*\S+
Severidade: Medium
Descrição: Comentário no código contendo possível credencial
Fix: Remover comentário com informações sensíveis
```

### Firebase Config com API Key

```
Regex: apiKey\s*:\s*["']AIza[0-9A-Za-z\-_]{35}["']
Severidade: Medium
Descrição: Firebase config com API key (menor risco pois é restrita por domínio, mas deve ser protegida)
Fix: Mover config para variáveis de ambiente
```

---

## 🔵 Low Patterns

### Debug/Verbose Mode Habilitado

```
Regex: (?:debug|verbose|DEBUG)\s*[:=]\s*(?:true|1|["']true["'])
Severidade: Low
Descrição: Modo debug habilitado (pode expor informações internas em produção)
Exceção: Arquivos de teste, configuração de desenvolvimento
Fix: Garantir que debug está desabilitado em produção (usar env var)
```

### Console.log com Objeto Completo

```
Regex: console\.log\s*\(\s*(?:JSON\.stringify\s*\()?\s*(?:req|request|user|session|auth|token|credentials)
Severidade: Low
Descrição: Log de objeto que pode conter informações sensíveis
Exceção: Arquivos de teste
Fix: Logar apenas campos específicos necessários, não o objeto inteiro
```

### TODO/FIXME Referenciando Segurança

```
Regex: (?:\/\/|#)\s*(?:TODO|FIXME|HACK)\s*.*(?:security|segurança|auth|secret|credential|vulnerab)
Severidade: Low
Descrição: Comentário indicando problema de segurança pendente
Fix: Resolver o TODO de segurança antes do merge
```

### Disable SSL/TLS Verification

```
Regex: (?:rejectUnauthorized|verify_ssl|VERIFY_SSL|SSL_VERIFY)\s*[:=]\s*(?:false|0|False)
Severidade: Low
Descrição: Verificação SSL/TLS desabilitada
Exceção: Ambiente de desenvolvimento local
Fix: Nunca desabilitar verificação SSL em produção
```

---

## Heurísticas Adicionais

### Detecção por Entropia

Para strings longas (>20 caracteres) atribuídas a variáveis com nomes sugestivos, calcule a entropia de Shannon:

- Entropia > 4.5 em string alfanumérica → provável secret
- Entropia < 3.0 → provavelmente texto normal

### Detecção por Contexto de Arquivo

| Arquivo / Path | Comportamento |
|----------------|---------------|
| `*.test.*`, `*.spec.*` | Reduzir severidade em 1 nível |
| `tests/`, `__tests__/` | Reduzir severidade em 1 nível |
| `docs/`, `examples/` | Reduzir severidade em 2 níveis |
| `*.md`, `*.txt` | Verificar se é documentação (pode ser exemplo) |
| `.env`, `.env.*` | Verificar status do arquivo (added = high severity) |
| `docker-compose.*` | Verificar se environment tem secrets hardcoded |
| `*config*`, `*settings*` | Alta probabilidade de conter secrets |

### Lista de Valores Placeholder (NÃO marcar)

Estes valores são claramente placeholders e devem ser ignorados:

- `YOUR_API_KEY`, `YOUR_SECRET`, `YOUR_TOKEN`
- `CHANGE_ME`, `REPLACE_ME`, `INSERT_HERE`
- `example`, `sample`, `placeholder`, `dummy`
- `test_`, `fake_`, `mock_`
- `xxx`, `yyy`, `zzz`, `abc123`
- `sk_test_*` (Stripe test keys são OK)
- `pk_test_*` (Stripe test keys são OK)
- Qualquer valor que contenha `example`, `test`, `fake`, `mock`, `dummy`, `placeholder`

### Padrões de Arquivo Ignorados (skip analysis)

Não analise estes arquivos:

- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `*.min.js`, `*.min.css` (minificados)
- `*.map` (source maps)
- `*.png`, `*.jpg`, `*.gif`, `*.svg`, `*.ico` (binários/imagens)
- `*.woff`, `*.woff2`, `*.ttf`, `*.eot` (fonts)
- `dist/`, `build/`, `node_modules/` (gerados)

---

## Notas de Implementação

### Ordem de Execução

1. Primeiro, verifique se o arquivo deve ser analisado (não está na lista de ignorados)
2. Identifique o contexto do arquivo (teste, docs, config, etc.)
3. Execute os padrões da severidade mais alta para a mais baixa
4. Aplique reduções de severidade baseadas no contexto
5. Filtre falsos positivos com a lista de placeholders
6. Registre findings finais

### Agrupamento

Se múltiplos patterns dão match na mesma linha:
- Use o de maior severidade
- Mencione os outros no corpo do comment
- Não crie comments duplicados na mesma linha

### Rate Limiting

A API do GitHub tem limites:
- Max 50 comments por review
- Se houver mais de 50 findings, agrupe os de menor severidade e mencione no body
- Priorize sempre os de maior severidade para comments inline
