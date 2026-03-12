/// <reference types="cypress" />

describe('Página de Cadastro - Estoque Raiz', () => {
  const emailUnico = `teste_${Date.now()}@estoque.com`;

  it('Deve cadastrar um novo usuário com sucesso', () => {
    cy.visit('/cadastro');
    
    // Preenche os dados
    cy.get('input[type="text"]').type('João Teste');
    cy.get('input[type="email"]').type(emailUnico);
    cy.get('input[type="password"]').type('SenhaSegura123');
    
    // Clica no botão (ajuste o seletor conforme seu botão)
    cy.get('button[type="submit"]').click();
    
    // Valida se a mensagem de sucesso do backend apareceu
    cy.contains('Usuário criado com sucesso').should('be.visible');
  });

  it('Deve mostrar erro ao tentar cadastrar sem preencher campos', () => {
    cy.visit('/cadastro');
    cy.get('button[type="submit"]').click();
    
    // Como os inputs tem "required", o navegador bloqueia. 
    // Você pode testar se a URL continua sendo a de cadastro.
    cy.url().should('include', '/cadastro');
  });
});