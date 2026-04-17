# Estoque Raiz Web

Painel administrativo do Estoque Raiz para operacao diaria no navegador. O projeto concentra autenticacao, consulta de indicadores, manutencao de cadastro e execucao dos fluxos administrativos por cargo.

## Stack

- React 19
- Vite 7
- TypeScript
- React Router 7
- Tailwind CSS 4
- Axios
- Cypress

## O que esta implementado

- Landing page publica
- Login, cadastro e recuperacao de senha
- Dashboard protegido por autenticacao
- Gestao de usuarios e aprovacoes de conta
- Gestao de unidades e categorias
- Gestao de produtos com upload de imagem
- Registro de movimentacoes
- Relatorios de Curva ABC e estatisticas gerais
- Testes E2E e UI com Cypress

## Rotas da aplicacao

| Rota | Acesso | Finalidade |
| --- | --- | --- |
| `/` | Publico | Landing page |
| `/login` | Publico | Autenticacao |
| `/cadastro` | Publico | Criacao de conta |
| `/esqueci-senha` | Publico | Recuperacao de senha |
| `/dashboard` | Autenticado | Visao geral do sistema |
| `/usuarios` | `gerente` | Aprovar contas, alterar cargo, excluir usuario |
| `/unidades` | `gerente` | CRUD de unidades |
| `/categorias` | `gerente`, `estoquista` | CRUD de categorias |
| `/produtos` | `gerente`, `estoquista`, `financeiro` | Cadastro, aprovacao e manutencao de produtos |
| `/movimentacoes` | `gerente`, `estoquista` | Registro e consulta de movimentacoes |
| `/relatorios` | `gerente`, `financeiro` | Curva ABC e estatisticas |

As restricoes acima sao aplicadas pelo `ProtectedRoute` com base no usuario salvo em `localStorage`.

## Integracao com a API

O frontend usa o arquivo `src/services/api.ts` para centralizar chamadas HTTP.

- `Authorization: Bearer <token>` e injetado automaticamente quando existe token salvo.
- Em respostas `401`, o token e removido do `localStorage`.
- A URL base e lida de `VITE_API_URL`; se a variavel nao estiver definida, o fallback e `http://localhost:8081`.
- Os dados de sessao sao gravados nas chaves `@EstoqueRaiz:token` e `@EstoqueRaiz:usuario`.

Servicos de integracao disponiveis em `src/services/`:

- `authService.ts`
- `usuarioService.ts`
- `unidadeService.ts`
- `categoriaService.ts`
- `produtoService.ts`
- `movimentacaoService.ts`
- `relatorioService.ts`

## Estrutura relevante

```text
web-estoqueraiz/
├─ src/
│  ├─ components/   # layout, modais, protecao de rota e UI reutilizavel
│  ├─ data/         # modulos, landing page e constantes de navegacao
│  ├─ pages/        # telas principais
│  ├─ services/     # camada HTTP
│  └─ styles/       # estilos globais
├─ cypress/
│  ├─ e2e/          # fluxos E2E
│  ├─ ui/           # cenarios por modulo
│  ├─ fixtures/     # massa de teste
│  └─ support/      # comandos e helpers
└─ vite.config.ts
```

## Como rodar

### Pre-requisitos

- Node.js LTS
- npm ou yarn
- Gateway da API disponivel em `http://localhost:8081` ou outra URL configurada

### Instalacao

```bash
cd web-estoqueraiz
npm install
```

### Configuracao opcional

Crie um `.env` na raiz de `web-estoqueraiz` se quiser sobrescrever a URL padrao da API:

```env
VITE_API_URL=http://localhost:8081
```

### Desenvolvimento

```bash
npm run dev
```

### Build de producao

```bash
npm run build
```

### Preview local do build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Testes

Configuracao principal em `cypress.config.ts`.

- Base URL do app em testes: `http://localhost:5173`
- Base URL da API em testes: `http://localhost:8081/api`

Para executar os testes manualmente:

```bash
npx cypress open
```

Ou em modo headless:

```bash
npx cypress run
```

## Observacoes verificadas no codigo

- O acesso por cargo e protegido no cliente via `ProtectedRoute`.
- O modulo de produtos envia `FormData` para upload de imagem.
- Recuperacao de senha e atualizacao de usuario/produto consomem a mesma API do backend, sem camada BFF adicional.
