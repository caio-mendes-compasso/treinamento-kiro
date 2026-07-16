---
inclusion: fileMatch
fileMatchPattern: "tests/**"
---
# Padrões de Teste
## Framework
- Vitest para testes unitários
- Supertest para testes de integração (HTTP)
## Nomenclatura
- Arquivo: [modulo].test.js (mesmo nome do módulo)
- describe: nome do módulo ou função
- it: "deve [resultado esperado] quando [condição]"
## Estrutura (AAA)
```javascript
it('deve retornar erro quando título é vazio', () => {
  // Arrange - preparar dados
  const dados = { titulo: '' };
  // Act - executar ação
  const resultado = () => service.criar(dados);
  // Assert - verificar resultado
  expect(resultado).toThrow('Título deve ter no mínimo 3 caracteres');
});
```
## Regras
- Mínimo 3 cenários por função: sucesso, erro de validação, edge case
- Não depender de estado entre testes (cada teste é isolado)
- Usar mocks para dependências externas
- Limpar mocks no afterEach com jest.clearAllMocks()