/**
 * Testes de integracao real de login com backend + banco.
 *
 * Esses cenarios usam requisicoes reais.
 * Para comportamento de interface, manter os testes mockados em login.cy.ts.
 */

import { gerarCpfValido } from '../../support/utils';

const API_BASE_URL = 'http://localhost:8081/api';

const promoverUsuarioViaSql = (
  email: string,
  cargo: 'gerente' | 'estoquista' | 'financeiro',
  unidadeId: number,
) => {
  const comandoSQL = [
    'UPDATE usuarios',
    "SET status = 'aprovado',",
    `cargo = '${cargo}',`,
    `unidade_id = ${unidadeId}`,
    `WHERE email = '${email}';`,
  ].join(' ');

  return cy.exec(
    `docker exec postgres-db psql -U admin -d estoque_raiz -c "${comandoSQL}"`,
    { failOnNonZeroExit: false },
  );
};

describe('Login - Testes de Integracao Real (Backend + DB)', () => {
  context('Requisicoes reais ao backend', () => {
    let emailDinamico = '';
    let tokenGerente = '';
    const senhaFirme = 'Senha123';

    before(() => {
      const emailGerente = `gerente_aprovador_${Date.now()}@estoqueraiz.com`;

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/usuarios`,
        body: {
          nome: 'Gerente Aprovador E2E',
          email: emailGerente,
          senha: senhaFirme,
          cpf: gerarCpfValido(),
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(201);
      });

      // Bootstrap minimo: promovemos o gerente por SQL para conseguir um JWT valido
      // e, a partir dele, aprovamos o usuario alvo usando a API protegida real.
      promoverUsuarioViaSql(emailGerente, 'gerente', 1).then((sqlRes) => {
        expect(sqlRes.exitCode).to.eq(0);
      });

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/auth/login`,
        body: {
          email: emailGerente,
          senha: senhaFirme,
        },
        failOnStatusCode: false,
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        expect(loginRes.body.token).to.be.a('string').and.not.be.empty;
        tokenGerente = loginRes.body.token;
      });

      emailDinamico = `testelogin_${Date.now()}@estoqueraiz.com`;

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/usuarios`,
        body: {
          nome: 'Usuario Teste Login',
          email: emailDinamico,
          senha: senhaFirme,
          cpf: gerarCpfValido(),
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(201);

        const usuarioId = response.body.usuario?.id;
        expect(usuarioId, 'id do usuario criado').to.be.a('number');

        cy.request({
          method: 'PATCH',
          url: `${API_BASE_URL}/usuarios/${usuarioId}/aprovar`,
          headers: {
            Authorization: `Bearer ${tokenGerente}`,
          },
          body: {
            cargo: 'gerente',
            unidade_id: 1,
          },
          failOnStatusCode: false,
        }).then((approveRes) => {
          expect(approveRes.status).to.be.oneOf([200, 201]);
        });
      });
    });

    it('faz login com sucesso via requisicao real e salva JWT', () => {
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

  context('Validacao de status no backend', () => {
    it('bloqueia login de usuario pendente', () => {
      const emailNaoAprovado = `bloqueado_${Date.now()}@estoqueraiz.com`;
      const senhaTeste = 'Senha123';

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/usuarios`,
        body: {
          nome: 'Usuario Bloqueado',
          email: emailNaoAprovado,
          senha: senhaTeste,
          cpf: gerarCpfValido(),
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(201);
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
