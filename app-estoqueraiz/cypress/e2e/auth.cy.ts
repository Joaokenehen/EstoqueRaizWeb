/// <reference types="cypress" />

describe('Fluxo de Autenticação (Login) - Estoque Raiz', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Deve renderizar o ecrã de login corretamente', () => {
    cy.get('h1').contains('Login').should('be.visible');
    cy.get('[data-test="input-email"]').should('be.visible');
    cy.get('[data-test="input-password"]').should('be.visible');
    cy.get('[data-test="button-login"]').should('be.visible');
    cy.get('[data-test="link-cadastro"]').should('be.visible');
  });

  it('Deve realizar o login com sucesso e guardar o token', () => {
    cy.intercept('POST', '/api/auth/login').as('pedidoLogin');
    cy.get('[data-test="input-email"]').type('teste@estoqueraiz.com');
    cy.get('[data-test="input-password"]').type('123456');
    cy.get('[data-test="button-login"]').click();
    cy.wait('@pedidoLogin').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
    cy.window().then((window) => {
      const token = window.localStorage.getItem('@EstoqueRaiz:token');
      expect(token).to.not.be.null;
    });
  });

  it('Deve exibir um erro ao tentar entrar com credenciais inválidas', () => {
    cy.intercept('POST', '/api/auth/login').as('loginFalhado');

    cy.get('[data-test="input-email"]').type('utilizador_falso@estoque.com');
    cy.get('[data-test="input-password"]').type('senha_errada');
    cy.get('[data-test="button-login"]').click();
    cy.wait('@loginFalhado').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([401, 404, 400]);
    });
    cy.on('window:alert', (textoDoAlerta) => {
      expect(textoDoAlerta).to.contains('Email ou senha incorretos!');
    });
  });
});