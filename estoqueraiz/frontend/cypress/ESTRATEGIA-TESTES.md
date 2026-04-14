# 🧪 Estratégia de Testes E2E - Cypress

## 📋 Resumo da Arquitetura de Testes

Este documento explica a estrutura implementada de testes E2E e as melhores práticas adotadas no projeto EstoqueRaiz.

---

## 🎯 Três Camadas de Testes

### 1️⃣ **Fixtures** - Dados Reutilizáveis para Mocks
**Localização:** `cypress/fixtures/*.ts`

Armazenam dados fake que são usados para mockar APIs. São a base para testes de UI rápidos e isolados.

**Como funcionam:**
```typescript
// cypress/fixtures/produtos.ts
export const produtosFixtures = {
  lista: (): Produto[] => [
    { id: 1, nome: 'Parafuso 10mm', quantidade_estoque: 80, ... },
    { id: 2, nome: 'Furadeira Industrial', quantidade_estoque: 8, ... },
  ],
  
  novoProduto: (): Omit<Produto, 'id'> => ({
    nome: 'Novo Produto',
    quantidade_estoque: 50,
    ...
  }),
};
```

**Uso nos testes:**
```typescript
import { produtosFixtures } from '../fixtures/produtos';

describe('Produtos', () => {
  it('exibe lista de produtos', () => {
    // Mocka a API com dados da fixture
    cy.intercept('GET', '**/api/produtos', produtosFixtures.lista());
    
    cy.visit('/produtos');
    cy.contains('Parafuso 10mm').should('be.visible');
  });
});
```

**Vantagens:**
- ✅ Rápido - sem requisições reais
- ✅ Isolado - não depende do BD
- ✅ Determinístico - sempre mesmos dados
- ✅ DRY - dados em um lugar

---

### 2️⃣ **Setup Helpers** - Criar Dados REAIS para Integração
**Localização:** `cypress/support/setupHelpers.ts`

Ferramentas para criar dados NO BANCO REAL via API. Usadas para testes de integração.

**Como funcionam:**
```typescript
// cypress/support/setupHelpers.ts
export const criarUsuarioViaAPI = (params: CriarUsuarioTestParams) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/usuarios`,  // ← API REAL
    body: { nome, email, senha, cpf },
  });
};

export const fazerLoginViaAPI = (email: string, senha: string) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/auth/login`,  // ← API REAL
    body: { email, senha },
  });
};
```

**Quando usar:**
- ⚠️ Testes de integração real (backend + DB)
- ⚠️ Fluxos críticos que precisam de BD real
- ⚠️ Validações antes de deploy

**Exemplo de uso:**
```typescript
// Criar usuário no BD real
cy.request({
  method: 'POST',
  url: `${Cypress.env('API_BASE_URL')}/usuarios`,
  body: { 
    nome: 'Usuario Teste', 
    email: `teste_${Date.now()}@teste.com`,
    senha: 'Senha123',
    cpf: gerarCpfValido()
  },
});

// Depois testar login
cy.visit('/login');
cy.get('[data-testid="email-input"]').type('teste@teste.com');
cy.contains('button', 'Entrar').click();
```

---

### 3️⃣ **Testes de Integração** - Fluxo Completo Real
**Localização:** `cypress/e2e/auth/*.integration.cy.ts`

Testes que combinam setupHelpers para criar dados REAIS + UI actions + validações.

**Exemplo real do projeto:**
```typescript
// cypress/e2e/auth/login.integration.cy.ts

describe('Login - Testes de Integração Real (Backend + DB)', () => {
  it('faz login com sucesso e salva JWT', () => {
    const emailDinamico = `testelogin_${Date.now()}@estoqueraiz.com`;
    
    // 1️⃣ Cria usuário REAL no BD via API
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_BASE_URL')}/usuarios`,
      body: {
        nome: 'Usuario Teste Login',
        email: emailDinamico,
        senha: 'Senha123',
        cpf: gerarCpfValido(),
      },
    });
    
    // 2️⃣ Navega para login
    cy.visit('/login');
    
    // 3️⃣ Faz login na UI
    cy.get('[data-testid="email-input"]').type(emailDinamico);
    cy.get('[data-testid="senha-input"]').type('Senha123');
    cy.contains('button', 'Entrar no Sistema').click();
    
    // 4️⃣ Valida resultado
    cy.url().should('include', '/dashboard');
    cy.window().then((window) => {
      const token = window.localStorage.getItem('@EstoqueRaiz:token');
      expect(token).to.not.be.null;
    });
  });
});
```

---

## 📁 Estrutura de Pastas Implementada

```
cypress/
├── e2e/                              
│   ├── categorias.cy.ts              # ✅ UI Tests (com fixtures)
│   ├── produtos.cy.ts                # ✅ UI Tests (com fixtures)
│   ├── movimentacoes.cy.ts           # ✅ UI Tests (com fixtures)
│   ├── usuarios.cy.ts                # ✅ UI Tests (com fixtures)
│   ├── dashboard.cy.ts               # ✅ UI Tests
│   ├── login.cy.ts                   # ✅ UI Tests (com mocks)
│   ├── esqueci-senha.cy.ts           # ✅ UI Tests
│   ├── cadastro.cy.ts                # ✅ UI Tests (integração real)
│   │
│   └── auth/                         
│       └── login.integration.cy.ts   # ⚠️ Integração Real (Backend + DB)
│
├── fixtures/                         # 📚 Dados Reutilizáveis
│   ├── products.ts                   # Dados de produtos
│   ├── categorias.ts                 # Dados de categorias
│   ├── unidades.ts                   # Dados de unidades
│   ├── movimentacoes.ts              # Dados de movimentações
│   ├── usuarios.ts                   # Dados de usuários
│   ├── testData.ts                   # Dados compartilhados (usuários, endpoints, timeouts)
│   └── README.md                     # Documentação das fixtures
│
└── support/
    ├── e2e.ts                        # Configuração global do Cypress
    ├── testHelpers.ts                # Funções auxiliares (visitarComSessao, criarUsuarioSessao)
    ├── setupHelpers.ts               # ✨ Helpers para criar dados via API
    └── utils.ts                      # Utilidades (gerarCpfValido, etc)
```

---

## ❌ O Que NÃO Fazer

### ❌ Não Misture UI + Integração
```typescript
// ❌ ERRADO
describe('Login', () => {
  before(() => {
    // Criar dados de teste
    cy.request('POST', 'http://localhost:8081/api/usuarios', {...});
  });

  it('mostra erro', () => {
    // Testar UI
    cy.intercept('POST', '**/api/auth/login', {...});
  });
});
```

### ❌ Não Use SQL Direto
```typescript
// ❌ ERRADO - SQL injection!
const email = `usuario_${Date.now()}@teste.com`;
cy.exec(`psql UPDATE usuarios SET status='aprovado' WHERE email='${email}'`);
```

### ❌ Não use URLs hardcoded
```typescript
// ❌ ERRADO
cy.request('POST', 'http://localhost:8081/api/usuarios', {...});

// ✅ CERTO
cy.request('POST', `${Cypress.env('API_BASE_URL')}/usuarios`, {...});
```

---

## ✅ Melhores Práticas Implementadas

### 1. Usar Fixtures para Dados Comuns
```typescript
// ❌ ERRADO - Hardcoded em todo lugar
const produtos = [{ id: 1, nome: 'Parafuso'... }];

// ✅ CERTO - Centralizado em fixture
import { produtosFixtures } from '../fixtures/produtos';
const produtos = produtosFixtures.lista();
```

### 2. Separar UI Tests de Integration Tests
```typescript
// ❌ ERRADO - misturado
describe('Login', () => {
  before(() => cy.exec('psql UPDATE...')});  // SQL direto
  
  it('login', () => cy.intercept(...)};  // UI mock
});

// ✅ CERTO - separado
// cypress/e2e/login.cy.ts - apenas UI com fixtures
// cypress/e2e/auth/login.integration.cy.ts - integração real
```

### 3. Usar Variáveis de Ambiente
```typescript
// ❌ ERRADO - hardcoded
cy.request('POST', 'http://localhost:8081/api/usuarios', {...});

// ✅ CERTO - variável de ambiente
cy.request('POST', `${Cypress.env('API_BASE_URL')}/usuarios`, {...});
```

### 4. Usar data-testid para Selectors
```typescript
// ❌ ERRADO - frágil
cy.get('form > input:first');

// ✅ CERTO - robusto
cy.get('[data-testid="produtos-input-nome"]');
```

### 5. Tipagem com TypeScript
```typescript
// ❌ ERRADO - sem tipos
const produto = { id: 1, nome: 'Parafuso' };

// ✅ CERTO - com tipos
export interface Produto {
  id: number;
  nome: string;
  quantidade_estoque: number;
  // ...
}

export const produtosFixtures = {
  lista: (): Produto[] => [...],
};
```

---

## 🔄 Fluxo Completo de Implementação

```
1. CRIAR FIXTURE
   fixtures/produtos.ts
   ├── Interface Produto
   ├── produtosFixtures.lista()
   ├── produtosFixtures.novoProduto()
   └── produtosFixtures.getProdutoComId()

   ↓

2. CRIAR TESTE UI
   e2e/produtos.cy.ts
   ├── Import da fixture
   ├── cy.intercept() com dados da fixture
   ├── Interações com UI
   └── Validações

   ↓

3. (OPCIONAL) CRIAR TESTE INTEGRAÇÃO
   e2e/auth/produtos.integration.cy.ts
   ├── cy.request() para criar dados REAIS
   ├── Interações com UI
   └── Validações contra BD real
```

---

## 📊 Matriz de Decisão

| Aspecto | Fixtures + Mocks | Setup Helpers | Integration |
|---------|------------------|---------------|-------------|
| **Local** | `/fixtures/*.ts` | `/support/setupHelpers.ts` | `/e2e/auth/*.integration.cy.ts` |
| **O quê** | Dados fake | Funções para criar dados reais | Testes com dados reais |
| **Backend** | Mock | Real | Real |
| **BD** | Não | Sim | Sim |
| **Velocidade** | ⚡ Rápido | 🐢 Lento | 🐢 Lento |
| **Isolamento** | ✅ Perfeito | ❌ Ruim | ❌ Ruim |
| **Confiabilidade** | ✅ Alta | ⚠️ Média | ⚠️ Média |
| **Setup** | ✅ Simples | ⚠️ Moderado | ⚠️ Complexo |
| **CI/CD** | ✅ Fácil | ❌ Difícil | ❌ Difícil |
| **Ideal para** | 90% testes | Integração | Críticos |

---

## � Estrutura de uma Fixture Completa

```typescript
// cypress/fixtures/produtos.ts

import type { Produto } from '../fixtures/produtos';  // ← Tipo exportado

export interface Produto {
  id: number;
  nome: string;
  codigo_barras?: string;
  quantidade_estoque: number;
  statusProduto: 'pendente' | 'aprovado' | 'rejeitado';
  // mais campos...
}

export const produtosFixtures = {
  // 1. Lista padrão
  lista: (): Produto[] => [
    { id: 1, nome: 'Parafuso 10mm', ... },
    { id: 2, nome: 'Furadeira Industrial', ... },
  ],

  // 2. Template para novo item
  novoProduto: (): Omit<Produto, 'id'> => ({
    nome: 'Chave de Fenda',
    quantidade_estoque: 50,
    ...
  }),

  // 3. Variações específicas
  produtoValido: (): Omit<Produto, 'id'> => ({ ... }),
  
  produtoSemEstoque: (): Omit<Produto, 'id'> => ({ 
    quantidade_estoque: 0, 
    ...
  }),

  // 4. Factory function
  getProdutoComId: (id: number, nome: string): Produto => ({
    id,
    nome,
    ...
  }),
};
```

---

## 🚀 Executando Testes

```bash
# Rodar APENAS testes de UI (fixtures + mocks)
npm run cypress:run -- --spec "cypress/e2e/*.cy.ts"

# Rodar APENAS testes de integração
npm run cypress:run -- --spec "cypress/e2e/**/*.integration.cy.ts"

# Rodar tudo
npm run cypress:run

# Modo interativo
npm run cypress:open

# Rodar arquivo específico
npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"
```

---

## 📚 Referências

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Mocking](https://docs.cypress.io/guides/guides/network-requests)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
