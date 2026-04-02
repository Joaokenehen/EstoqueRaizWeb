/**
 * Testes de Integração Real - Login com Backend + Database
 * 
 * ⚠️ IMPORTANTE: Estes testes fazem requisições REAIS ao backend e banco de dados.
 * 
 * Pré-requisitos:
 * - Backend rodando em localhost:8081
 * - PostgreSQL rodando e acessível
 * - Variable de ambiente API_BASE_URL configurada no cypress.config.ts
 * 
 * Usar apenas para testar fluxos críticos que dependem do backend real.
 * Para testes de UI, use mocks (veja login.cy.ts).
 */

import { gerarCpfValido } from '../../support/utils';

describe('Login - Testes de Integração Real (Backend + DB)', () => {
  context('Requisições Reais ao Backend', () => {
    let emailDinamico = '';
    const senhaFirme = 'Senha123';

    before(() => {
      // Criar usuário de teste via API (não SQL direto)
      emailDinamico = `testelogin_${Date.now()}@estoqueraiz.com`;
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL') || 'http://localhost:8081/api'}/usuarios`,
        body: {
          nome: 'Usuario Teste Login',
          email: emailDinamico,
          senha: senhaFirme,
          cpf: gerarCpfValido(),
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(201);
        
        // ⚠️ NOTA: Se o seu backend não tiver endpoint para aprovar usuários,
        // você pode usar SQL apenas neste case específico.
        // Melhor: Adicionar endpoint POST /api/usuarios/{id}/aprovar ao backend
        if (Cypress.env('ALLOW_SQL_IN_TESTS')) {
          const comandoSQL = `UPDATE usuarios SET status = 'aprovado' WHERE email = '${emailDinamico}';`;
          cy.exec(`docker exec postgres-db psql -U admin -d estoque_raiz -c "${comandoSQL}"`);
        }
      });
    });

    it('faz login com sucesso via requisição real e salva JWT', () => {
      cy.visit('/login');

      cy.get('[data-testid="email-input"]').type(emailDinamico);
      cy.get('[data-testid="senha-input"]').type(senhaFirme);

      cy.intercept('POST', '**/api/auth/login').as('pedidoLogin');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@pedidoLogin').its('response.statusCode').should('eq', 200);
      cy.url().should('include', '/dashboard');

      cy.window().then((window) => {
        const token = window.localStorage.getItem('@EstoqueRaiz:token');
        expect(token).to.not.be.null;
      });
    });
  });

  context('Validação de Status no Backend', () => {
    it('bloqueia login de usuário pendente', () => {
      const emailNaoAprovado = `bloqueado_${Date.now()}@estoqueraiz.com`;
      const senhaTeste = 'Senha123';

      // Criar usuário via API
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_BASE_URL') || 'http://localhost:8081/api'}/usuarios`,
        body: {
          nome: 'Usuario Bloqueado',
          email: emailNaoAprovado,
          senha: senhaTeste,
          cpf: gerarCpfValido(),
        },
        failOnStatusCode: false,
      });

      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(emailNaoAprovado);
      cy.get('[data-testid="senha-input"]').type(senhaTeste);

      cy.intercept('POST', '**/api/auth/login').as('loginBloqueado');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginBloqueado').its('response.statusCode').should('eq', 403);
      cy.url().should('include', '/login');
    });
  });
});
