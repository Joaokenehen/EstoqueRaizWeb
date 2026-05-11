# Estoque Raiz - Sistema WMS Multi-Unidade

![Logo do Estoque Raiz](web-estoqueraiz/src/assets/LogoEstoqueRaiz.png)

**Estoque Raiz** é um sistema WMS (Warehouse Management System) moderno desenvolvido para **Agrológica Agromercantil**, especializada em insumos agrícolas. O sistema gerencia 7 estoques independentes com rastreabilidade completa de lotes, validades e movimentações entre unidades.

## 📋 Visão Geral

O Estoque Raiz é uma solução de gestão de estoque com três frentes integradas:

- **API Backend** em microserviços para regras de negócio, persistência distribuída e observabilidade
- **Painel Web** para operação administrativa e análise de dados
- **App Mobile** para operações em campo e consultas rápidas

O projeto atende um cenário multiunidade com cadastro de usuários, aprovação de contas, catálogo de produtos, movimentações de estoque e relatórios gerenciais (Curva ABC, estatísticas).

## Estrutura do monorepo

| Diretório | Papel | Stack principal |
| --- | --- | --- |
| [api-estoqueraiz](api-estoqueraiz/README.md) | Backend, gateway, banco, cache e observabilidade | Node.js, TypeScript, Express, PostgreSQL, Redis, Nginx, Prometheus, Grafana |
| [web-estoqueraiz](web-estoqueraiz/README.md) | Painel administrativo em navegador | React, Vite, TypeScript, Tailwind CSS, Cypress |
| [app-estoqueraiz](app-estoqueraiz/README.md) | Aplicativo mobile | React Native, Expo, TypeScript, AsyncStorage |

---

## 🏗️ Arquitetura

### Tipo de Arquitetura: **Microserviços com Padrão Síncrono/Assíncrono**

#### Por que Microserviços?

1. **Escalabilidade independente**: Cada serviço pode ser escalado conforme sua demanda específica
2. **Isolamento de dados**: Cada serviço tem seu próprio acesso ao banco, evitando acoplamento
3. **Manutenção facilitada**: Serviços pequenos e focados são mais fáceis de manter e testar
4. **Deploy independente**: Possibilidade de atualizar um serviço sem impactar toda a plataforma
5. **Resiliência**: Falha em um serviço não derruba toda a aplicação (com tratamento adequado)

#### Padrões Implementados

- **API Gateway** (Nginx): Ponto único de entrada, roteamento e autenticação centralizada
- **Service-to-Service**: Comunicação síncrona via HTTP/REST
- **Event-Driven**: Publicação de eventos via Redis Pub/Sub para operações assíncronas
- **Circuit Breaker**: Proteção contra cascata de falhas
- **Cache Distribuído**: Redis para cache de relatórios e dados frequentes

### Fluxo Arquitetural

```
Internet
  ↓
Nginx Gateway (8081)
  ├→ Auth Service (3001)
  ├→ Usuarios Service (3002)
  ├→ Unidades Service (3003)
  ├→ Categorias Service (3004)
  ├→ Produtos Service (3005)
  ├→ Movimentacoes Service (3006)
  └→ Relatorios Service (3007)
  
Persistência:
  ├→ PostgreSQL (Dados transacionais)
  ├→ Redis (Cache + Pub/Sub)
  
Observabilidade:
  ├→ Prometheus (Métricas)
  ├→ Grafana (Dashboards)
  └→ Node Exporter (Métricas do SO)
```

---

## 🎯 Fluxo de Negócio Principal

### Diagrama de Movimentação de Estoque

O diagrama abaixo ilustra o fluxo completo de uma movimentação de estoque no sistema:

📊 **[Ver Diagrama Draw.io](api-estoqueraiz/docs/fluxo-negocio.drawio)**

**Resumo do Fluxo:**

1. **Autenticação**: Usuário se autentica no API Gateway (JWT)
2. **Validação**: Movimentações Service valida permissões por unidade e cargo
3. **Processamento**: Valida saldo suficiente e regras de transferência
4. **Persistência**: Registra movimentação no PostgreSQL
5. **Eventos**: Publica evento `MOVIMENTACAO_CRIADA` no Redis
6. **Atualização Assíncrona**: 
   - Produtos Service consome evento e atualiza estoque
   - Relatórios Service invalida cache
7. **Resposta**: Retorna confirmação ao cliente

### Regras de Negócio Principais

#### 1. Cadastro e Aprovação de Usuário
- ✅ Cadastro público (status = `pendente`)
- 👔 Gerente aprova e define cargo (status = `aprovado`)
- 🔐 Login bloqueado até aprovação
- ⏰ Limpeza automática: contas pendentes > 7 dias são removidas

#### 2. Cadastro e Aprovação de Produto
- 📦 Criação com status = `pendente`
- 💰 Financeiro aprova e define preços (custo + venda)
- 🏠 Soft delete: produtos inativos não aparecem em listagens
- ⚠️ Alerta: produtos vencendo (< 30 dias) destacados no dashboard

#### 3. Movimentação de Estoque
- **Tipos**: ENTRADA, SAÍDA, TRANSFERÊNCIA, AJUSTE
- 🔍 **Validações**:
  - Saldo suficiente (SAÍDA/TRANSFERÊNCIA)
  - Origem ≠ Destino (TRANSFERÊNCIA)
  - Permissão por unidade (estoquista)
- 📤 **Propagação de Eventos**: Atualiza estoque em tempo real
- 🔄 **Clonagem**: Produtos novos na unidade destino (TRANSFERÊNCIA)

#### 4. Relatórios e Análises
- 📊 **Curva ABC**: Análise de giro de produtos por movimentações de SAÍDA
- 📈 **Estatísticas Gerais**: Dashboard com KPIs principais
- ⚡ **Cache em Redis**: Invalidado por eventos de movimentação
- 🔄 **Atualização Automática**: Dashboard reflete alterações em tempo real

---

## 🛠️ Stack de Desenvolvimento

### Backend

| Tecnologia | Versão | Finalidade |
| --- | --- | --- |
| **Node.js** | 18+ | Runtime JavaScript/TypeScript |
| **TypeScript** | 5.3+ | Type safety e melhor DX |
| **Express** | 4.18+ | Framework HTTP minimalista |
| **Sequelize** | 6.35+ | ORM para PostgreSQL |
| **ioredis** | 5.3+ | Cliente Redis (eventos + cache) |
| **winston** | 3.11+ | Logging estruturado |
| **prom-client** | 15.1+ | Métricas Prometheus |

### Infraestrutura

| Componente | Versão | Finalidade |
| --- | --- | --- |
| **PostgreSQL** | 15 | Banco de dados principal (transacional) |
| **Redis** | 7 | Cache distribuído + Pub/Sub |
| **Nginx** | Alpine | API Gateway (roteamento + LB) |
| **Prometheus** | Latest | Coleta de métricas |
| **Grafana** | Latest | Visualização de métricas |
| **Docker Compose** | 3.8+ | Orquestração local |

### Frontend Web

| Tecnologia | Versão | Finalidade |
| --- | --- | --- |
| **React** | 19 | Framework UI |
| **Vite** | 7 | Build tool rápido |
| **TypeScript** | 5.3+ | Type safety |
| **React Router** | 7 | SPA routing |
| **Tailwind CSS** | 4 | Styling |
| **Axios** | Latest | Cliente HTTP |
| **Cypress** | Latest | Testes E2E |

### Frontend Mobile

| Tecnologia | Versão | Finalidade |
| --- | --- | --- |
| **React Native** | Latest | Framework mobile |
| **Expo** | Latest | Desenvolvimento rápido |
| **TypeScript** | 5.3+ | Type safety |
| **AsyncStorage** | Latest | Persistência local |

---

## 📁 Estrutura de Diretórios

### Raiz do Projeto

```
EstoqueRaizWeb/
├── api-estoqueraiz/          # Backend em microserviços
│   ├── auth-service/         # Autenticação (JWT)
│   ├── usuarios-service/     # Gestão de usuários
│   ├── unidades-service/     # Gestão de unidades
│   ├── categorias-service/   # Gestão de categorias
│   ├── produtos-service/     # Catálogo de produtos
│   ├── movimentacoes-service/# Fluxo de movimentações
│   ├── relatorios-service/   # Curva ABC e estatísticas
│   ├── shared/               # Código compartilhado
│   ├── nginx/                # Configuração do gateway
│   ├── prometheus/           # Configuração de métricas
│   ├── grafana/              # Dashboards de observabilidade
│   ├── redis/                # Configuração Redis
│   ├── docker-compose.yml    # Orquestração completa
│   └── docs/                 # Documentação técnica
│       ├── ADR-*.md          # Decisões arquiteturais
│       ├── DDD-*.md          # Análise de domínios
│       ├── DIAGRAMAS-C4.md   # Diagramas C4
│       └── fluxo-negocio.drawio  # Diagrama do fluxo
├── web-estoqueraiz/          # Frontend web
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas/rotas
│   │   ├── services/         # Integração com API
│   │   └── hooks/            # Custom React hooks
│   ├── cypress/              # Testes E2E
│   └── public/               # Arquivos estáticos
└── Regras De Negócio.md      # Especificação de regras
```

### Estrutura de um Microserviço

```
<service-name>/
├── src/
│   ├── index.ts              # Entry point
│   ├── controllers/          # HTTP handlers (request/response)
│   ├── services/             # Lógica de negócio
│   ├── models/               # Modelos Sequelize (se houver)
│   ├── routes/               # Definição de rotas
│   ├── dto/                  # Data Transfer Objects
│   ├── middleware/           # Middlewares Express
│   └── utils/                # Utilitários
├── package.json
├── tsconfig.json
├── Dockerfile                # Imagem Docker
└── .env.example              # Variáveis de exemplo
```

---

## 🚀 Como Subir o Ambiente

### Pré-requisitos

- Docker & Docker Compose
- Node.js 18+
- npm ou yarn

### 1. Clonar o Repositório

```bash
git clone https://github.com/Joaokenehen/EstoqueRaizWeb.git
cd EstoqueRaizWeb
```

### 2. Configurar Variáveis de Ambiente

```bash
cd api-estoqueraiz
cp .env.example .env  # Ajuste as variáveis conforme necessário
```

### 3. Subir a Stack Completa (Backend)

```bash
cd api-estoqueraiz
docker compose up -d --build
```

**Serviços iniciados:**
- 🔀 **Nginx Gateway**: http://localhost:8081
- 🗄️ **PostgreSQL**: localhost:5432
- ⚡ **Redis**: localhost:6379
- 📊 **Prometheus**: http://localhost:9090
- 📈 **Grafana**: http://localhost:3000 (admin/admin)

Verificar saúde:
```bash
curl http://localhost:8081/health
```

### 4. Painel Web

```bash
cd web-estoqueraiz
npm install
npm run dev
```

Acesse: **http://localhost:5173**

### 5. App Mobile (Opcional)

```bash
cd app-estoqueraiz
npm install
npx expo start
```

---

## 🔗 Endereços Úteis

### Produção

| Serviço | URL | Descrição |
| --- | --- | --- |
| **Gateway da API** | http://localhost:8081 | Ponto único de entrada |
| **Health Check** | http://localhost:8081/health | Status dos serviços |

### Observabilidade

| Ferramenta | URL | Credenciais |
| --- | --- | --- |
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | N/A |

### Desenvolvimento

| Ferramenta | URL | Descrição |
| --- | --- | --- |
| **Painel Web Dev** | http://localhost:5173 | Frontend React |
| **PostgreSQL** | localhost:5432 | BD principal |
| **Redis CLI** | localhost:6379 | Cache + Pub/Sub |

---

## 📖 Documentação Técnica

### Guias Principais

- [📚 Documentação da API Backend](api-estoqueraiz/README.md)
- [💻 Documentação do Painel Web](web-estoqueraiz/README.md)
- [📱 Documentação do App Mobile](app-estoqueraiz/README.md)
- [📋 Regras de Negócio Detalhadas](Regras%20De%20Negócio.md)

### Documentação Técnica Avançada

- [🏗️ ADR-001: Escolha de PostgreSQL](api-estoqueraiz/docs/ADR-001-escolha-postgresql.md)
- [🎯 ADR-002: Arquitetura de Microserviços](api-estoqueraiz/docs/ADR-002%20-%20Arquitetura%20de%20Microserviços.md)
- [🔐 Autenticação e Autorização](api-estoqueraiz/docs/AUTENTICACAO-AUTORIZACAO.md)
- [📊 Estratégia de Observabilidade](api-estoqueraiz/docs/PLANO-OBSERVABILIDADE.md)
- [🛡️ Segurança](api-estoqueraiz/docs/CHECKLIST-SEGURANCA.md)
- [🔄 Resiliência](api-estoqueraiz/docs/ESTRATEGIAS-RESILIENCIA.md)
- [🎨 DDD: Context Mapping](api-estoqueraiz/docs/DDD-CONTEXT-MAP.md)
- [📐 Diagramas C4](api-estoqueraiz/docs/DIAGRAMAS-C4.md)
- [🚀 Estratégia de Deploy](api-estoqueraiz/docs/ESTRATEGIA-DEPLOY.md)
- [📈 SLOs e SLIs](api-estoqueraiz/docs/SLOs-SLIs.md)
- [⚠️ Threat Model](api-estoqueraiz/docs/THREAT-MODEL.md)

### Fluxos e Diagramas

- [🔄 Fluxo de Movimentação de Estoque](api-estoqueraiz/docs/fluxo-negocio.drawio) *(Draw.io)*
- [📚 Postman Collection](api-estoqueraiz/docs/API%20Estoque%20Raiz%20-%20Microservices.postman_collection.json)
- [🔌 OpenAPI Spec](api-estoqueraiz/docs/openapi-spec.yaml)

---

## 🔗 Links do Projeto

| Link | Descrição |
| --- | --- |
| **[GitHub](https://github.com/Joaokenehen/EstoqueRaizWeb)** | Repositório principal (público) |
| **[Grafana Dashboards](http://localhost:3000)** | Monitoramento em tempo real |
| **[Prometheus Targets](http://localhost:9090/targets)** | Status dos exporters |

---

## 📝 Notas Importantes

## 📝 Notas Importantes

- **API Gateway Centralizado**: Todo tráfego externo passa pelo Nginx (http://localhost:8081)
- **Frontend API URL**: O painel web busca pela variável `VITE_API_URL`, caso contrário usa `http://localhost:8081`
- **Mobile BaseURL**: O app mobile tem `baseURL` configurada em `app-estoqueraiz/src/services/api.tsx` - ajuste para o IP/hostname acessível pelo dispositivo
- **Soft Delete**: Produtos inativos (ativo=false) não aparecem em listagens mas permanecem no banco
- **Cache Inteligente**: Relatórios usam cache Redis invalidado por eventos de movimentação
- **Estoque Assíncrono**: Produtos Service consome eventos para atualizar estoque em tempo real

---

## 📊 Observações Verificadas no Código

- O backend lista produtos `ativos` independentemente de `statusProduto`; o fluxo de aprovação é tratado por telas específicas
- A API expõe `PUT /api/produtos/:id` para atualização geral; não existe `PATCH` genérico para esse recurso
- No app mobile, filtragem e paginação são parcialmente feitas no cliente (API retorna listas completas em alguns fluxos)
- JWT tokens são validados no API Gateway; serviços internos confiam na autenticação centralizada

---

## 🎓 Este é um Projeto do TCC

Este projeto foi desenvolvido como **Trabalho de Conclusão de Curso** e contempla:

✅ Análise e especificação de regras de negócio  
✅ Arquitetura de microserviços documentada  
✅ Stack moderno (TypeScript, React, Node.js)  
✅ Padrões de design (DDD, Design Patterns)  
✅ Infraestrutura com Docker & observabilidade  
✅ Testes automatizados (E2E, UI)  
✅ Documentação técnica completa  
✅ Diagrama de fluxos em Draw.io  

---

## 📄 Licença

Este projeto é de código aberto e está disponível em: **https://github.com/Joaokenehen/EstoqueRaizWeb**

---

## 👥 Contribuidores

- **João Araújo** - Lead Developer & Arquiteto
