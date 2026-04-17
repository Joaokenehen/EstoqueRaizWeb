# Estoque Raiz App

Aplicativo mobile do Estoque Raiz, construido com React Native e Expo. Ele cobre login, consulta operacional, aprovacoes, cadastro e acompanhamento de estoque a partir das mesmas APIs usadas pelo painel web.

## Stack

- Expo 54
- React Native 0.81
- TypeScript
- React Navigation
- Axios
- AsyncStorage
- React Native Toast Message

## Fluxos implementados

- Landing page, login, cadastro e recuperacao de senha
- Dashboard com resumo do usuario, alertas e atalhos
- Cadastro e edicao de produtos
- Lista de produtos com filtros
- Cadastro de categorias e unidades
- Mapa de unidades
- Consulta e cadastro de movimentacoes
- Aprovacao financeira de produtos pendentes
- Gestao de usuarios do sistema
- Relatorio de Curva ABC

## Navegacao principal

As telas registradas em `App.tsx` sao:

| Tela | Finalidade |
| --- | --- |
| `LandingPage` | Entrada inicial |
| `Login` | Autenticacao |
| `Cadastro` | Criacao de conta |
| `EsqueciSenha` | Recuperacao de senha |
| `Dashboard` | Visao geral e acesso aos modulos |
| `CadastroProduto` | Criacao e edicao de produto |
| `ListaProdutos` | Consulta, filtro e exclusao de produto |
| `CadastroCategoria` | Cadastro de categoria |
| `CadastroUnidade` | Cadastro de unidade |
| `MapaUnidades` | Visualizacao de unidades |
| `Movimentacoes` | Consulta de movimentacoes |
| `CadastroMovimentacao` | Criacao de movimentacao |
| `UsuariosSistema` | Aprovacao e manutencao de usuarios |
| `Financeiro` | Aprovacao de produtos e edicao de precos |
| `RelatorioCurvaABC` | Analise gerencial |

O dashboard decide quais atalhos exibir com base no `cargo` salvo no `AsyncStorage`.

## Integracao com a API

O arquivo `src/services/api.tsx` centraliza a comunicacao HTTP.

- `token`, `usuario`, `nome` e `cargo` sao persistidos no `AsyncStorage`.
- O token e enviado automaticamente no header `Authorization`.
- A `baseURL` esta configurada diretamente no codigo.
- O app mantem um cache em memoria para respostas `GET`.

Detalhes importantes do comportamento atual:

- Cache geral de `GET`: 30 segundos
- Cache de movimentacoes: 15 segundos
- Listas de produtos e produtos pendentes nao sao cacheadas para evitar dados defasados
- Parte da filtragem e da paginacao de produtos e movimentacoes e feita no cliente

## Configurando a URL da API

Antes de executar em outro ambiente, ajuste a `baseURL` em `src/services/api.tsx` para o host acessivel pelo dispositivo ou emulador.

Exemplo:

```ts
const api = axios.create({
  baseURL: "http://SEU_IP_OU_HOST:8081",
  timeout: 10000,
});
```

Se voce estiver usando celular fisico, o aparelho precisa estar na mesma rede do computador onde o gateway da API esta rodando.

## Estrutura relevante

```text
app-estoqueraiz/
├─ App.tsx
├─ src/
│  ├─ components/   # header, inputs, modais e cards
│  ├─ config/       # configuracao de toast
│  ├─ screens/      # telas do aplicativo
│  ├─ services/     # integracao HTTP e helpers de cache
│  ├─ assets/       # imagens e fontes
│  └─ types/        # tipos de navegacao e suporte
└─ app.json
```

## Como rodar

### Pre-requisitos

- Node.js LTS
- npm
- Expo Go no celular ou emulador Android/iOS configurado

### Instalacao

```bash
cd app-estoqueraiz
npm install
```

### Desenvolvimento

```bash
npx expo start
```

### Atalhos uteis

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Observacoes verificadas no codigo

- O fluxo de login salva os dados de sessao localmente e navega para `Dashboard`.
- A tela `Financeiro` aprova produtos pendentes definindo preco de custo e preco de venda.
- O app consulta a API diretamente; nao existe camada intermediaria entre mobile e backend.
- Como a API retorna listas completas em alguns endpoints, filtros como busca, unidade e paginacao sao complementados no proprio app.
