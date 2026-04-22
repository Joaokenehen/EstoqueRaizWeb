# Estoque Raiz

![Logo do Estoque Raiz](web-estoqueraiz/src/assets/LogoEstoqueRaiz.png)

O Estoque Raiz e um sistema de gestao de estoque com tres frentes integradas:

- uma API em microservicos para regras de negocio, persistencia e observabilidade;
- um painel web para operacao administrativa;
- um aplicativo mobile para uso em campo e consultas rapidas.

O projeto atende um cenario multiunidade e trabalha com cadastro de usuarios, aprovacao de contas, catalogo de produtos, movimentacoes de estoque e relatorios gerenciais.

## Estrutura do monorepo

| Diretório | Papel | Stack principal |
| --- | --- | --- |
| [api-estoqueraiz](api-estoqueraiz/README.md) | Backend, gateway, banco, cache e observabilidade | Node.js, TypeScript, Express, PostgreSQL, Redis, Nginx, Prometheus, Grafana |
| [web-estoqueraiz](web-estoqueraiz/README.md) | Painel administrativo em navegador | React, Vite, TypeScript, Tailwind CSS, Cypress |
| [app-estoqueraiz](app-estoqueraiz/README.md) | Aplicativo mobile | React Native, Expo, TypeScript, AsyncStorage |

## Fluxos principais

1. Cadastro de usuario
Usuários se cadastram publicamente e entram como `pendente`. Um gerente aprova, define cargo e unidade, e só então o login passa a ser permitido.

2. Cadastro de produto
Produtos são criados com `statusProduto = pendente`. Financeiro ou gerente aprova definindo `preco_custo` e `preco_venda`.

3. Movimentacao de estoque
Entradas, saidas, ajustes e transferencias sao registradas no `movimentacoes-service`. O `produtos-service` consome o evento publicado e atualiza o estoque.

4. Relatorios
Curva ABC e estatisticas gerais sao calculadas a partir das movimentacoes e do catalogo de produtos, com cache em Redis e invalidacao por eventos.

## Arquitetura resumida

- O acesso externo passa pelo gateway Nginx em `http://localhost:8081`.
- A API e dividida em 7 servicos: autenticacao, usuarios, unidades, categorias, produtos, movimentacoes e relatorios.
- PostgreSQL centraliza a persistencia.
- Redis e usado como cache distribuido e tambem como barramento Pub/Sub.
- Prometheus, Grafana, cAdvisor e Node Exporter compoem a camada de observabilidade.

## Como subir o ambiente

### 1. API

Entre em `api-estoqueraiz`, configure o `.env` e suba a stack:

```bash
cd api-estoqueraiz
docker compose up -d --build
```

Documentacao detalhada: [api-estoqueraiz/README.md](api-estoqueraiz/README.md)

### 2. Web

O frontend web pode usar `VITE_API_URL` para apontar para o gateway. Se a variavel nao existir, ele usa `http://localhost:8081`.

```bash
cd web-estoqueraiz
npm install
npm run dev
```

Documentacao detalhada: [web-estoqueraiz/README.md](web-estoqueraiz/README.md)

### 3. App mobile

O app usa uma `baseURL` configurada diretamente em `app-estoqueraiz/src/services/api.tsx`. Antes de rodar em outro ambiente, ajuste esse host para o IP/hostname do gateway acessivel pelo dispositivo.

```bash
cd app-estoqueraiz
npm install
npx expo start
```

Documentacao detalhada: [app-estoqueraiz/README.md](app-estoqueraiz/README.md)

## Enderecos uteis

- Gateway da API: `http://localhost:8081`
- Health do gateway: `http://localhost:8081/health`
- Painel web em dev: `http://localhost:5173`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`

## Para detalhes aprofundados sobre a arquitetura e execução de cada frente do projeto, consulte as respectivas documentações:

- ⚙️ **API (Backend e Infraestrutura)**: Configuração de microserviços, gateway, variáveis de ambiente, cache e observabilidade.
- 💻 **Painel Web**: Frontend em React/Vite, estrutura de rotas, scripts e testes E2E.
- 📱 **App Mobile**: Aplicativo em React Native/Expo, fluxos de tela e consumo da API no dispositivo.

## Observacoes verificadas no codigo

- O backend de produtos lista hoje todos os produtos `ativos`, independentemente de `statusProduto`; o fluxo de aprovacao continua existindo e e tratado por telas especificas e pelo endpoint de pendentes.
- A API expõe `PUT /api/produtos/:id` para atualizacao geral; nao existe `PATCH` generico para esse recurso.
- No app mobile, parte da busca, filtragem e paginação e feita no cliente porque a API retorna listas completas em alguns fluxos.
