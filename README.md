# EstoqueRaiz - Sistema de Gestão de Estoque

EstoqueRaiz é uma aplicação completa para gestão de inventário, desenvolvida com uma arquitetura moderna de microserviços e um frontend reativo. O projeto serve como um exemplo prático de implementação de diversos padrões de arquitetura e boas práticas de desenvolvimento.

## ✨ Features

- **Autenticação e Autorização:** Sistema de login com JWT.
- **Gestão de Entidades:** CRUD completo para Produtos, Categorias, Unidades e Usuários.
- **Controle de Inventário:** Registro de entradas e saídas de produtos.
- **Relatórios:** Geração de relatórios sobre o estado do estoque.
- **Observabilidade:** Monitoramento completo com Prometheus e Grafana.

## 🏗️ Arquitetura

O sistema é dividido em dois diretórios principais: `api-estoqueraiz` e `app-estoqueraiz`.

- **Backend (`api-estoqueraiz`):** Um monorepo contendo múltiplos microserviços em Node.js e TypeScript, orquestrados com Docker. Um gateway de API (Nginx) serve como ponto de entrada único para todos os serviços.
- **Frontend (`app-estoqueraiz`):** Uma aplicação de página única (SPA) desenvolvida com React, Vite e Tailwind CSS.

A documentação detalhada da arquitetura, incluindo diagramas C4 e ADRs (Architectural Decision Records), pode ser encontrada no diretório `api-estoqueraiz/docs`.

### 🚀 Tech Stack

| Categoria | Tecnologia |
| :--- | :--- |
| **Backend** | Node.js, TypeScript, Express.js |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **Banco de Dados** | PostgreSQL, Redis |
| **API Gateway** | Nginx |
| **Container & Orquestração** | Docker, Docker Compose |
| **Observabilidade** | Prometheus, Grafana, cAdvisor |
| **Testes (Frontend)** | Cypress |

## 🏁 Getting Started

Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

### ✅ Pré-requisitos

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 🛠️ Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd EstoqueRaizWeb
    ```

2.  **Configurar Variáveis de Ambiente do Backend:**
    Navegue até o diretório da API e crie um arquivo `.env` a partir do exemplo.
    ```bash
    cd api-estoqueraiz
    touch .env
    ```
    Preencha o arquivo `.env` com as variáveis necessárias. No mínimo, você precisará de:
    ```env
    # .env - api-estoqueraiz
    
    # Portas (pode usar os padrões do docker-compose)
    NGINX_PORT=8081
    
    # Banco de Dados PostgreSQL
    DATABASE_URL="postgresql://admin:admin123@postgres-db:5432/estoque_raiz?schema=public"
    
    # JWT Secret
    JWT_SECRET="SEU_SEGREDO_SUPER_SECRETO"
    
    # Variáveis de Email (se for usar o serviço de usuários)
    EMAIL_SERVICE="seu-servico-de-email"
    EMAIL_NOME="Nome Remetente"
    EMAIL_USER="usuario@email.com"
    EMAIL_PASS="senha-do-email"
    ```

3.  **Iniciar o Backend:**
    Ainda no diretório `api-estoqueraiz`, suba todos os contêineres do backend.
    ```bash
    docker-compose up -d
    ```
    Isso iniciará todos os microserviços, bancos de dados e a stack de observabilidade.

4.  **Iniciar o Frontend:**
    Abra um novo terminal, navegue até o diretório do app e instale as dependências.
    ```bash
    cd ../app-estoqueraiz
    npm install
    ```
    Em seguida, inicie o servidor de desenvolvimento.
    ```bash
    npm run dev
    ```

### 🌐 Acessando a Aplicação

- **Frontend:** [http://localhost:5173](http://localhost:5173) (Porta padrão do Vite, pode variar)
- **API Gateway (Backend):** [http://localhost:8081](http://localhost:8081)
- **Grafana (Observabilidade):** [http://localhost:3000](http://localhost:3000) (Login: admin/admin123)
- **Prometheus:** [http://localhost:9090](http://localhost:9090)

## 🧪 Testes

Para executar os testes end-to-end do frontend com Cypress:

```bash
cd app-estoqueraiz
npx cypress open
```

## 📚 Documentação da API

A documentação da API está disponível de duas formas no diretório `api-estoqueraiz/docs`:

- **OpenAPI:** `openapi-spec.yaml`
- **Postman:** `API Estoque Raiz - Microservices.postman_collection.json`

## 🖼️ Galeria do Sistema

<table>
  <tr>
    <td align="center"><strong>Página de Login</strong></td>
    <td align="center"><strong>Dashboard Principal</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f22e5b54-3f04-410d-9376-f0510caa5018" alt="Tela de Login"></td>
    <td><img src="https://github.com/user-attachments/assets/2ca4589d-bf72-4565-8a2e-398557e378da" alt="Dashboard Principal"></td>
  </tr>
  <tr>
    <td align="center"><strong>Cadastro de Produtos</strong></td>
    <td align="center"><strong>Categorias</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/67f5842a-9930-414e-afa0-b00cdb710d95" alt="Tela de Cadastro de Produtos"></td>
    <td><img src="https://github.com/user-attachments/assets/19483981-16bf-4d24-9fab-83e79a85f87b" alt="Tela de Categorias"></td>
  </tr>
</table>

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
