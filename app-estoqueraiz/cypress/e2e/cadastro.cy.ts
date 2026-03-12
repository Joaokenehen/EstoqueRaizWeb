/// <reference types="cypress" />

describe('Fluxo de Cadastro', () => {
  it('Deve cadastrar um novo usuário com sucesso', () => {
    cy.visit('/cadastro');
    cy.get('[data-test="input-nome"]').type('Usuário Teste');
    cy.get('[data-test="input-email"]').type('teste@estoqueraiz.com');
    cy.get('[data-test="input-password"]').type('123456');
    cy.get('[data-test="button-submit"]').click();
    
    cy.contains('Usuário criado com sucesso').should('be.visible');
  });
});