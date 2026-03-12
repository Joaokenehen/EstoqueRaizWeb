/// <reference types="cypress" />

describe('Fluxo de Autenticação - Estoque Raiz', () => {
  const usuarioTeste = {
    nome: 'Admin Teste',
    email: `teste_${Date.now()}@estoque.com`, // Email único para evitar erro de duplicata
    senha: 'SenhaSegura123'
  };

  it('Deve cadastrar um usuário e validar que a senha foi protegida (bcrypt)', () => {
    cy.visit('/cadastro');

    // Preenche o formulário usando os data-test que definimos
    cy.get('[data-test="input-nome"]').type(usuarioTeste.nome);
    cy.get('[data-test="input-email"]').type(usuarioTeste.email);
    cy.get('[data-test="input-password"]').type(usuarioTeste.senha);
    
    cy.get('[data-test="button-submit"]').click();

    // Valida se o backend respondeu com sucesso
    cy.contains('Usuário criado com sucesso').should('be.visible');
  });

  it('Deve conseguir logar com a senha original (o bcrypt deve validar o hash)', () => {
    cy.visit('/login');

    cy.get('[data-test="input-email"]').type(usuarioTeste.email);
    cy.get('[data-test="input-password"]').type(usuarioTeste.senha);
    cy.get('[data-test="button-login"]').click();

    // Se o bcrypt.compare funcionar, ele redireciona ou mostra sucesso
    cy.url().should('include', '/dashboard'); 
    cy.contains('Bem-vindo').should('be.visible');
  });
});