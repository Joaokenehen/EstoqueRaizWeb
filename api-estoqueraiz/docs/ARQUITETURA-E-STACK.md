# Arquitetura e Stack do Estoque Raiz

## 📐 Visão Geral da Arquitetura

O **Estoque Raiz** utiliza uma **arquitetura de microserviços** com padrões síncrono e assíncrono de comunicação.

### Por que Microserviços?

| Benefício | Descrição |
|-----------|-----------|
| **Escalabilidade Independente** | Cada serviço pode escalar conforme sua demanda específica |
| **Isolamento de Dados** | Cada serviço tem seu próprio acesso ao BD, evitando acoplamento |
| **Manutenção Facilitada** | Serviços pequenos e focados são mais fáceis de manter e testar |
| **Deploy Independente** | Atualizar um serviço sem impactar toda a plataforma |
| **Resiliência** | Falha em um serviço não derruba toda a aplicação |
| **Equipes Autônomas** | Cada equipe pode trabalhar em um serviço independentemente |

## 🔗 Padrões Arquiteturais

### 1. API Gateway (Nginx)
- **Responsabilidade**: Ponto único de entrada, roteamento e autenticação centralizada
- **Porta**: 8081
- **Funções**:
  - Roteamento baseado em caminhos (`/api/auth`, `/api/usuarios`, etc.)
  - Load balancing entre instâncias
  - Rate limiting (futuro)
  - CORS handling

### 2. Service-to-Service (Síncrono)
- Chamadas HTTP/REST entre serviços
- Exemplo: Productos Service chamando validações do Estoque
- Implementa retry e timeout

### 3. Event-Driven (Assíncrono)
- **Message Broker**: Redis Pub/Sub
- **Evento Principal**: `MOVIMENTACAO_CRIADA`
- **Subscribers**:
  - `produtos-service`: Atualiza estoque
  - `relatorios-service`: Invalida cache

### 4. Circuit Breaker
- Proteção contra cascata de falhas
- Implementado em chamadas entre serviços (futuro)

### 5. Cache Distribuído
- **Redis**: Cache de relatórios e dados frequentes
- **Invalidação**: Por eventos de movimentação

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                        │
│  ┌──────────────┐                                                   │
│  │  Web (React) │                                                   │
│  │ http://5173  │                                                   │
│  └──────────────┘                                                   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE API                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              API Gateway (Nginx - 8081)                      │  │
│  │  - Autenticação JWT                                          │  │
│  │  - Roteamento de requisições                                 │  │
│  │  - Rate limiting / CORS                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
    ┌────────▼────────┐  ┌─────────▼──────┐  ┌───────────▼────────┐
    │  Auth Service   │  │ Usuarios Svc   │  │ Unidades Service   │
    │     (3001)      │  │     (3002)     │  │     (3003)         │
    └─────────────────┘  └────────────────┘  └────────────────────┘

    ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │Categorias Svc  │  │ Produtos Service │  │ Movimentações Svc│
    │     (3004)     │  │     (3005)       │  │      (3006)      │
    └────────────────┘  └──────────────────┘  └──────────────────┘

    ┌──────────────────────┐
    │ Relatórios Service   │
    │      (3007)          │
    └──────────────────────┘
└─────────────────────────────────────────────────────────────────────┘
              │
              │ (Evento-Driven)
              │
┌─────────────┼───────────────────────────────────────────────────────┐
│             │           CAMADA DE INFRAESTRUTURA                    │
│  ┌──────────▼───────────┐      ┌─────────────────────────────────┐ │
│  │  Redis Pub/Sub       │      │  PostgreSQL (5432)              │ │
│  │  - Cache             │      │  - Dados transacionais          │ │
│  │  - Eventos           │      │  - Sequelize ORM                │ │
│  │  - Session store     │      │  - Migrations                   │ │
│  └──────────────────────┘      └─────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │        CAMADA DE OBSERVABILIDADE                              │ │
│  │  ┌─────────────┐  ┌──────────┐  ┌────────────────────────┐  │ │
│  │  │ Prometheus  │  │ Grafana  │  │ Node Exporter cAdvisor │  │ │
│  │  │  (9090)     │  │ (3000)   │  │  (9100, 8080)          │  │ │
│  │  └─────────────┘  └──────────┘  └────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack de Tecnologias

### Backend

#### Runtime & Linguagem
- **Node.js** (18+): Runtime JavaScript
- **TypeScript** (5.3+): Type safety e melhor experiência de desenvolvimento

#### Framework Web
- **Express** (4.18+): Framework HTTP minimalista e modular
- **prom-client** (15.1+): Cliente Prometheus para métricas

#### Persistência
- **PostgreSQL** (15): Banco relacional principal
- **Sequelize** (6.35+): ORM para PostgreSQL com migrations
- **ioredis** (5.3+): Cliente Redis (cache + Pub/Sub)

#### Logging & Observabilidade
- **winston** (3.11+): Logging estruturado
- **Prometheus**: Coleta de métricas (timeseries)
- **Grafana**: Visualização de métricas e dashboards

### Infraestrutura

#### Containerização & Orquestração
- **Docker**: Containerização de serviços
- **Docker Compose** (3.8+): Orquestração local/desenvolvimento

#### Gateway & Balanceamento
- **Nginx** (Alpine): Reverse proxy, roteamento, load balancing

#### Bancos de Dados
- **PostgreSQL** (15-Alpine): Relacional, transacional, ACID
- **Redis** (7-Alpine): Cache em memória, Pub/Sub, sessionstore

### Frontend Web

#### Framework & Build
- **React** (19): Library para UI moderno
- **Vite** (7): Build tool rápido com HMR
- **React Router** (7): Roteamento SPA

#### Linguagem & Type Safety
- **TypeScript** (5.3+): Type safety

#### Styling
- **Tailwind CSS** (4): Utility-first CSS framework
- **PostCSS**: Processamento de CSS

#### HTTP Client
- **Axios**: Cliente HTTP com interceptadores

#### Testes
- **Cypress**: Testes E2E e UI
- **Cypress Command Console**: Inspetor de elementos

## 📁 Organização de Repositório

### Estrutura Geral

```
EstoqueRaizWeb/
├── api-estoqueraiz/
│   ├── auth-service/
│   ├── usuarios-service/
│   ├── unidades-service/
│   ├── categorias-service/
│   ├── produtos-service/
│   ├── movimentacoes-service/
│   ├── relatorios-service/
│   ├── shared/
│   ├── nginx/
│   ├── prometheus/
│   ├── grafana/
│   ├── redis/
│   ├── docs/
│   └── docker-compose.yml
├── web-estoqueraiz/
│   ├── src/
│   ├── public/
│   ├── cypress/
│   └── package.json
└── Regras De Negócio.md
```

### Estrutura de Microserviço

```
<service>/
├── src/
│   ├── index.ts                 # Entry point
│   ├── controllers/             # HTTP handlers (request/response)
│   ├── services/                # Lógica de negócio
│   ├── models/                  # Modelos Sequelize
│   ├── routes/                  # Definição de rotas
│   ├── dto/                     # Data Transfer Objects
│   ├── middleware/              # Middlewares Express
│   └── utils/                   # Utilitários
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

## 🔄 Fluxo de Requisição Típico

1. **Cliente** envia requisição para `Nginx` (8081)
2. **Nginx** autentica via JWT e roteia para o serviço apropriado
3. **Serviço** recebe, valida e processa a requisição
4. **Persistência**: Dados salvos no PostgreSQL
5. **Eventos** (se aplicável): Publica evento via Redis
6. **Subscribers**: Outros serviços consomem eventos assincronamente
7. **Resposta**: Cliente recebe resultado

## 🔐 Segurança

- **Autenticação**: JWT (JSON Web Tokens) centralizado no Auth Service
- **Autorização**: Validações por cargo e unidade no API Gateway
- **Comunicação**: Todo tráfego internal via Docker network
- **Dados**: PostgreSQL com constraint de integridade referencial

## 📊 Observabilidade

### Métricas (Prometheus)
- Latência de requisições
- Taxa de erro
- Uso de CPU/Memória
- Conectividade de bancos

### Logs (Winston)
- Estruturados em JSON
- Níveis: debug, info, warn, error

### Dashboards (Grafana)
- Visão geral do sistema
- Performance por serviço
- Alertas automáticos

## 🚀 Deployment

### Desenvolvimento
- Docker Compose para orchestração local
- Hot reload com Vite/nodemon

### Produção (Futuro)
- Kubernetes (recomendado)
- Terraform para IaC
- CI/CD com GitHub Actions

## 📚 Referências

- [Microservices Pattern](https://microservices.io/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [Prometheus Metrics](https://prometheus.io/docs/practices/naming/)
