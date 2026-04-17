# Estoque Raiz API

Backend do Estoque Raiz organizado em microservicos. A stack foi montada para centralizar regras de negocio, persistencia, cache, eventos e observabilidade atras de um unico gateway HTTP.

## Visao geral

O ambiente e composto por:

- 7 microservicos em Node.js + TypeScript
- 1 gateway Nginx na porta `8081`
- PostgreSQL para persistencia
- Redis para cache e Pub/Sub
- Prometheus, Grafana, cAdvisor e Node Exporter para observabilidade

## Microservicos e responsabilidades

| Servico | Porta interna | Rotas base | Responsabilidade principal |
| --- | --- | --- | --- |
| `auth-service` | `3001` | `/api/auth` | Login, emissao de JWT e eventos de autenticacao |
| `usuarios-service` | `3002` | `/api/usuarios` | Cadastro, aprovacao de usuarios, troca de cargo e recuperacao de senha |
| `unidades-service` | `3003` | `/api/unidades` | CRUD de unidades e consulta por CEP |
| `categorias-service` | `3004` | `/api/categorias` | CRUD de categorias |
| `produtos-service` | `3005` | `/api/produtos` | Catalogo, upload de imagem, aprovacao e estoque por produto |
| `movimentacoes-service` | `3006` | `/api/movimentacoes` | Entradas, saidas, ajustes e transferencias |
| `relatorios-service` | `3007` | `/api/relatorios` | Curva ABC e estatisticas gerais |

## Fluxos de negocio verificados

### 1. Cadastro e aprovacao de usuario

- `POST /api/usuarios` cria a conta com `status = pendente`
- gerente aprova com `PATCH /api/usuarios/:id/aprovar`
- no login, o `auth-service` so libera token para usuarios com `status = aprovado`
- o `usuarios-service` envia emails de boas-vindas, aprovacao, rejeicao e recuperacao de senha
- existe uma limpeza diaria via `cron` que remove contas pendentes com mais de 7 dias

### 2. Cadastro e aprovacao de produto

- `POST /api/produtos` cria produto com `statusProduto = pendente` e `ativo = true`
- financeiro ou gerente aprova via `PATCH /api/produtos/:id/aprovar`
- rejeicao usa `PATCH /api/produtos/:id/rejeitar`
- exclusao e soft delete: o produto permanece no banco, mas recebe `ativo = false`

### 3. Movimentacoes e atualizacao de estoque

- `movimentacoes-service` registra `ENTRADA`, `SAIDA`, `TRANSFERENCIA` e `AJUSTE`
- para `SAIDA` e `TRANSFERENCIA`, a API valida estoque suficiente antes de criar a movimentacao
- para `TRANSFERENCIA`, origem e destino devem ser diferentes
- depois de criar a movimentacao, o servico publica `MOVIMENTACAO_CRIADA`
- o `produtos-service` consome esse evento e ajusta o estoque do produto
- quando a transferencia vai para uma unidade que ainda nao possui o item, o produto e clonado na unidade de destino

### 4. Relatorios

- `GET /api/relatorios/curva-abc` usa movimentacoes do tipo `SAIDA`
- `GET /api/relatorios/estatisticas` consolida movimentacoes, produtos, categorias, usuarios e unidades
- os caches de relatorio sao invalidados por eventos do dominio

## Regras e validacoes relevantes

### Usuarios

- email valido, CPF valido e senha forte
- email e CPF devem ser unicos
- gerente nao pode remover de si mesmo o cargo de gerente

### Unidades

- apenas gerente cria, atualiza e exclui
- a exclusao falha se houver produtos vinculados
- existe rota de consulta de CEP: `GET /api/unidades/cep/:cep`

### Categorias

- apenas gerente cria, atualiza e exclui
- a exclusao falha se houver produtos vinculados

### Produtos

- criacao exige `nome`, `categoria_id`, `unidade_id` e `usuario_id`
- upload de imagem usa `multer`
- aprovacao exige `preco_custo` e `preco_venda` nao negativos
- listagem geral hoje filtra `ativo = true`, nao `statusProduto`

### Movimentacoes

- `quantidade` deve ser maior que zero
- `TRANSFERENCIA` exige `unidade_destino_id`
- `TRANSFERENCIA` nao permite origem igual ao destino

## Autorizacao aplicada

O token JWT carrega `id`, `email`, `cargo` e `unidade_id`.

| Recurso | Regra observada no backend |
| --- | --- |
| Usuarios pendentes, aprovacao, rejeicao e alteracao de cargo | Apenas `gerente` |
| CRUD de unidades | Apenas `gerente` para escrita |
| CRUD de categorias | Apenas `gerente` para escrita |
| Criacao de produto | `estoquista` ou `gerente` |
| Aprovacao/rejeicao de produto | `financeiro` ou `gerente` |
| Atualizacao de produto | Exige autenticacao; para `estoquista`, o controller restringe a propria unidade |
| Criacao de movimentacao | Exige autenticacao e validacao de unidade no middleware |
| Relatorios | Exigem autenticacao |

Observacao importante:
Os clientes web e mobile restringem alguns modulos por cargo na interface. No backend, `relatorios-service` valida autenticacao, e `movimentacoes-service` valida autenticacao/acesso de unidade, mas nao faz bloqueio explicito por cargo alem disso.

## Eventos de dominio

Eventos publicados em `shared/eventos/publicador.ts`:

- usuarios: `usuario:criado`, `usuario:atualizado`, `usuario:deletado`, `usuario:aprovado`, `usuario:rejeitado`
- autenticacao: `login:realizado`, `login:falhou`
- unidades: `unidade:criada`, `unidade:atualizada`, `unidade:deletada`
- categorias: `categoria:criada`, `categoria:atualizada`, `categoria:deletada`
- produtos: `produto:criado`, `produto:atualizado`, `produto:deletado`, `produto:aprovado`, `produto:rejeitado`
- movimentacoes: `movimentacao:criada`, `movimentacao:deletada`

## Cache e observabilidade

### Cache

Redis e usado como cache distribuido. Os servicos trabalham com namespaces, por exemplo:

- `usuarios`
- `unidades`
- `categorias`
- `produtos`
- `movimentacoes`
- `relatorios`

O padrao dominante e `buscarOuExecutar`, que tenta ler do cache e, em caso de miss, executa a consulta e armazena o resultado.

### Health e metricas

Todos os servicos expõem:

- `/health`
- `/liveness`
- `/readiness`
- `/metrics`

O gateway responde em:

- `GET /health`

### Gateway

O `nginx.conf` ja inclui:

- proxy reverso para todos os servicos
- CORS por rota
- rate limiting diferenciado para autenticacao e relatorios
- encaminhamento de uploads em `/uploads`

## Estrutura do repositorio da API

```text
api-estoqueraiz/
├─ auth-service/
├─ usuarios-service/
├─ unidades-service/
├─ categorias-service/
├─ produtos-service/
├─ movimentacoes-service/
├─ relatorios-service/
├─ shared/
│  ├─ config/
│  ├─ eventos/
│  ├─ types/
│  └─ utils/
├─ nginx/
├─ redis/
├─ prometheus/
├─ grafana/
├─ docs/
└─ docker-compose.yml
```

## Variaveis de ambiente

As variaveis abaixo sao usadas pela stack. As mais importantes para iniciar o ambiente sao:

| Variavel | Uso |
| --- | --- |
| `DATABASE_URL` | String de conexao do PostgreSQL |
| `JWT_SECRET` | Segredo para emissao e validacao de JWT |
| `REDIS_HOST` | Host do Redis |
| `REDIS_PORT` | Porta do Redis |
| `EMAIL_SERVICE` | Provedor SMTP do `usuarios-service` |
| `EMAIL_NOME` | Nome exibido no remetente |
| `EMAIL_USER` | Usuario SMTP |
| `EMAIL_PASS` | Senha ou app password SMTP |
| `NGINX_PORT` | Porta externa do gateway |
| `AUTH_SERVICE_PORT` | Override opcional da porta externa do auth |
| `USUARIOS_SERVICE_PORT` | Override opcional da porta externa do usuarios |
| `UNIDADES_SERVICE_PORT` | Override opcional da porta externa do unidades |
| `CATEGORIAS_SERVICE_PORT` | Override opcional da porta externa do categorias |
| `MOVIMENTACOES_SERVICE_PORT` | Override opcional da porta externa do movimentacoes |
| `RELATORIOS_SERVICE_PORT` | Override opcional da porta externa do relatorios |

Exemplo minimo de `.env` para o ambiente Docker Compose:

```env
NODE_ENV=production
NGINX_PORT=8081
DATABASE_URL=postgresql://admin:admin123@postgres:5432/estoque_raiz
JWT_SECRET=troque-por-um-segredo-forte
REDIS_HOST=redis
REDIS_PORT=6379
EMAIL_SERVICE=gmail
EMAIL_NOME=Estoque Raiz
EMAIL_USER=seu-email@dominio.com
EMAIL_PASS=sua-app-password
```

## Como rodar com Docker Compose

### 1. Instale dependencias da infraestrutura

- Docker
- Docker Compose

### 2. Configure o `.env`

Crie o arquivo `.env` na raiz de `api-estoqueraiz` com base no exemplo acima.

### 3. Suba a stack

```bash
cd api-estoqueraiz
docker compose up -d --build
```

### 4. Verifique o status

```bash
docker compose ps
```

### 5. Veja logs

```bash
docker compose logs -f
```

## Enderecos uteis

- Gateway: `http://localhost:8081`
- Health do gateway: `http://localhost:8081/health`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`

Credenciais padrao do Grafana no `docker-compose.yml`:

- usuario: `admin`
- senha: `admin123`

## Desenvolvimento local por servico

Cada microservico possui seu proprio `package.json`. Exemplo:

```bash
cd api-estoqueraiz/auth-service
npm install
npm run dev
```

Scripts padrao encontrados na maioria dos servicos:

- `npm run dev`
- `npm run build`
- `npm start`

## Endpoints mais usados

```http
POST /api/auth/login
POST /api/usuarios
POST /api/usuarios/solicitar-recuperacao-senha
POST /api/usuarios/redefinir-senha
GET  /api/unidades
GET  /api/categorias
GET  /api/produtos
GET  /api/produtos/pendentes
POST /api/movimentacoes
GET  /api/relatorios/curva-abc
GET  /api/relatorios/estatisticas
```

## Documentacao complementar

O diretorio `docs/` ja possui material arquitetural e operacional mais profundo:

- [docs/README.md](docs/README.md)
- `docs/openapi-spec.yaml`
- `docs/AUTENTICACAO-AUTORIZACAO.md`
- `docs/DDD-CONTEXT-MAP.md`
- `docs/DDD-TACTICAL-DESIGN.md`
- `docs/DIAGRAMAS-C4.md`
- `docs/RESILIENCIA-E-OBSERVABILIDADE.md`
- `docs/runbook-incidentes.md`
