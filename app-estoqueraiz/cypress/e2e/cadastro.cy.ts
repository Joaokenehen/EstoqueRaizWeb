/// <reference types="cypress" />
import { gerarCpfValido } from '../support/utils';

describe('Página de Cadastro', () => {

  beforeEach(() => {
    cy.visit('/cadastro');
  });

  // ----------------------------------------------------------------
  context('Criação de Usuário', () => {

    it('Deve cadastrar um novo usuário com sucesso (Caminho Feliz)', () => {
      const nomeTeste = 'Usuário Teste E2E';
      const emailTeste = `sucesso_${Date.now()}@estoqueraiz.com`;
      const cpfTeste = gerarCpfValido();
      const senhaTeste = 'SenhaForte123!';

      cy.get('[data-testid="nome-input"]').type(nomeTeste);
      cy.get('[data-testid="email-input"]').type(emailTeste);
      cy.get('[data-testid="cpf-input"]').type(cpfTeste);
      cy.get('[data-testid="senha-input"]').type(senhaTeste);
      cy.get('[data-testid="confirmar-senha-input"]').type(senhaTeste);

      cy.get('[data-testid="btn-finalizar-cadastro"]').click();

      cy.get('[data-testid="mensagem-feedback"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Usuário criado com sucesso')
        .and('have.class', 'bg-green-500');

      cy.get('[data-testid="nome-input"]').should('have.value', '');
    });
  });

  // ----------------------------------------------------------------
  context('Testes de Validação', () => {

    context('Duplicidade', () => {

      it('Deve impedir o cadastro de um e-mail duplicado', () => {
        const emailDuplicado = `duplicado_${Date.now()}@estoqueraiz.com`;
        const cpf1 = gerarCpfValido();
        const cpf2 = gerarCpfValido();

        cy.get('[data-testid="nome-input"]').type('Primeiro Usuario Teste');
        cy.get('[data-testid="email-input"]').type(emailDuplicado);
        cy.get('[data-testid="cpf-input"]').type(cpf1);
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();
        cy.get('[data-testid="mensagem-feedback"]').should('contain', 'sucesso');

        cy.visit('/cadastro');

        cy.get('[data-testid="nome-input"]').type('Segundo Usuario');
        cy.get('[data-testid="email-input"]').type(emailDuplicado);
        cy.get('[data-testid="cpf-input"]').type(cpf2);
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'Email já está em uso');
      });

      it('Deve impedir o cadastro de um CPF duplicado', () => {
        const cpfDuplicado = gerarCpfValido();
        const email1 = `email1_${Date.now()}@test.com`;
        const email2 = `email2_${Date.now()}@test.com`;

        cy.get('[data-testid="nome-input"]').type('CPF duplicado Teste');
        cy.get('[data-testid="email-input"]').type(email1);
        cy.get('[data-testid="cpf-input"]').type(cpfDuplicado);
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();
        cy.get('[data-testid="mensagem-feedback"]').should('contain', 'sucesso');

        cy.visit('/cadastro');

        cy.get('[data-testid="nome-input"]').type('Impostor Teste');
        cy.get('[data-testid="email-input"]').type(email2);
        cy.get('[data-testid="cpf-input"]').type(cpfDuplicado);
        cy.get('[data-testid="senha-input"]').type('Senha123!');
        cy.get('[data-testid="confirmar-senha-input"]').type('Senha123!');
        cy.get('[data-testid="btn-finalizar-cadastro"]').click();

        cy.get('[data-testid="mensagem-feedback"]')
          .should('be.visible')
          .and('contain', 'CPF já está em uso');
      });
    });
  });
});
