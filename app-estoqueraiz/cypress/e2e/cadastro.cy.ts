/// <reference types="cypress" />

import { gerarCpfValido } from '../support/utils';

describe('Página de Cadastro - Estoque Raiz', () => {
  it('Deve cadastrar um novo usuário com dados dinâmicos', () => {
    cy.visit('/cadastro');

    const cpfDinamico = gerarCpfValido();
    const emailDinamico = `teste_${Date.now()}@estoqueraiz.com`;  
    const senhaValida = 'Senha123!';
    
    cy.get('[data-testid="nome-input"]').type('João Teste');
    cy.get('[data-testid="email-input"]').type(emailDinamico);
    cy.get('[data-testid="senha-input"]').type(senhaValida);
    cy.get('[data-testid="cpf-input"]').type(cpfDinamico); // Preenche o novo campo
    cy.get('button[type="submit"]').click();
    cy.contains('Usuário criado com sucesso', { timeout: 10000 }).should('be.visible');
  });
});