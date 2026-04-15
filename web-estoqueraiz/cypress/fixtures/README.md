# Cypress E2E Test Fixtures

## 📁 Estrutura de Fixtures

Este diretório contém dados de teste (fixtures) reutilizáveis e compartilhados entre os testes E2E do Cypress.

### Arquivos de Fixture

#### `testData.ts`
Dados compartilhados entre todos os testes:
- **usuariosTesteSession**: Objetos de usuário para diferentes cargos (gerente, estoquista, financeiro)
- **timeouts**: Constantes de timeout para esperas
- **endpoints**: URLs dos endpoints da API

**Uso:**
```typescript
import { usuariosTesteSession, timeouts, endpoints } from '../fixtures/testData';
```

---

#### `categorias.ts`
Dados para testes do módulo de categorias:
- **lista()**: Array de 3 categorias de exemplo
- **novaCategoria()**: Template de categoria para criar
- **categoriaValida()**: Categoria com dados válidos
- **categoriaSemDescricao()**: Categoria sem descrição (apenas nome)
- **getCategoriaComId()**: Função auxiliar para criar categoria com ID específico

**Uso:**
```typescript
import { categoriasFixtures } from '../fixtures/categorias';

const categorias = categoriasFixtures.lista();
const nova = categoriasFixtures.novaCategoria();
```

---

#### `unidades.ts`
Dados para testes do módulo de unidades:
- **lista()**: Array de 3 unidades de exemplo
- **novaUnidade()**: Template de unidade para criar
- **unidadeValida()**: Unidade com dados completos
- **enderecoParaCEP**: Mapa de CEPs e endereços para testes de preenchimento automático

**Uso:**
```typescript
import { unidadesFixtures } from '../fixtures/unidades';

const unidades = unidadesFixtures.lista();
const endereco = unidadesFixtures.enderecoParaCEP['01001000'];
```

---

#### `produtos.ts`
Dados para testes do módulo de produtos:
- **lista()**: Array de 3 produtos de exemplo
- **novoProduto()**: Template de produto para criar
- **produtoValido()**: Produto com dados válidos
- **produtoSemCodigoBarras()**: Produto sem código de barras
- **getProdutoComId()**: Função auxiliar para criar produto com ID específico

**Uso:**
```typescript
import { produtosFixtures } from '../fixtures/produtos';

const produtos = produtosFixtures.lista();
const novo = produtosFixtures.novoProduto();
```

---

#### `movimentacoes.ts`
Dados para testes do módulo de movimentações:
- **lista()**: Array de 3 movimentações de exemplo
- **novaMovimentacao.entrada()**: Template de movimentação de entrada
- **novaMovimentacao.saida()**: Template de movimentação de saída
- **novaMovimentacao.transferencia()**: Template de transferência entre unidades
- **novaMovimentacao.ajuste()**: Template de ajuste de estoque

**Uso:**
```typescript
import { movimentacoesFixtures } from '../fixtures/movimentacoes';

const movimentacoes = movimentacoesFixtures.lista();
const entrada = movimentacoesFixtures.novaMovimentacao.entrada();
```

---

#### `usuarios.ts`
Dados para testes do módulo de usuários:
- **lista()**: Array de 4 usuários de exemplo (mais realistas)
- **novoUsuario()**: Template de usuário para criar
- **usuarioParaAprovar()**: Usuário pendente de aprovação
- **usuarioComCargo()**: Função auxiliar para criar usuário com cargo específico
- **usuarioRejeitado()**: Usuário com status rejeitado

**Uso:**
```typescript
import { usuariosFixtures } from '../fixtures/usuarios';

const usuarios = usuariosFixtures.lista();
const gerente = usuariosFixtures.usuarioComCargo('gerente');
```

---

## 🔄 Padrão de Uso nos Testes

### Antes (hardcoded no .cy.ts):
```typescript
describe('Modulo de Produtos', () => {
  const categoriasMock = [
    { id: 1, nome: 'Ferragens' },
    { id: 2, nome: 'Seguranca' },
  ];
  
  const produtosMock = [
    { id: 1, nome: 'Parafuso 10mm', ... },
    // ... mais dados
  ];
  
  const resetarMocks = () => {
    // Lógica de mock
  };
});
```

### Depois (usando fixtures):
```typescript
import { produtosFixtures } from '../fixtures/produtos';
import { categoriasFixtures } from '../fixtures/categorias';

describe('Modulo de Produtos', () => {
  let produtosMock = produtosFixtures.lista();
  const categoriasMock = categoriasFixtures.lista();
  
  const resetarMocks = () => {
    produtosMock = produtosFixtures.lista();
    // Lógica de mock
  };
});
```

---

## ✅ Benefícios da Nova Estrutura

1. **Separação de Responsabilidades**: Dados de teste separados do código de teste
2. **Reutilização**: Mesmos dados podem ser usados em múltiplos testes
3. **Manutenção Simplificada**: Alterar dados de teste em um único lugar
4. **Tipo-seguro**: Interfaces TypeScript definem a estrutura de cada entidade
5. **Consistência**: Garante que os dados de teste sejam consistentes entre testes
6. **Escalabilidade**: Fácil adicionar novos objetos de teste ou variações

---

## 📝 Adicionar Novos Dados de Teste

Para adicionar novos dados de teste, siga este padrão:

1. **Crie um novo arquivo** em `cypress/fixtures/[entidade].ts`
2. **Defina a interface** de tipagem TypeScript
3. **Exporte um objeto fixture** com métodos para diferentes cenários:

```typescript
export interface MinhaEntidade {
  id: number;
  nome: string;
  // mais campos...
}

export const meuFixture = {
  lista: (): MinhaEntidade[] => [...],
  novo: (): Omit<MinhaEntidade, 'id'> => ({...}),
  comCondicao: (): MinhaEntidade => ({...}),
};
```

4. **Importe e use nos testes**

---

## 🔗 Referências

- Arquivos de teste: `cypress/e2e/*.cy.ts`
- Helpers de teste: `cypress/support/testHelpers.ts`
- Configuração do Cypress: `cypress.config.ts`
