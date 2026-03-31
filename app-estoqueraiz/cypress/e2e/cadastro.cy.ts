import { gerarCpfValido } from '../support/utils';

describe('Página de Cadastro - Fluxos de Exceção Dinâmicos', () => {
  
  beforeEach(() => {
    cy.visit('/cadastro');
  });

  // --- TESTE PRINCIPAL - CADASTRO DE USUÁRIO: SUCESSO ---
  it('Deve cadastrar um novo usuário com sucesso (Caminho Feliz)', () => {
    const nomeTeste = 'Usuário Teste E2E';
    const emailTeste = `sucesso_${Date.now()}@estoqueraiz.com`;
    const cpfTeste = gerarCpfValido();
    const senhaTeste = 'SenhaForte123!';

    cy.get('[input-testid="nome-input"]').type(nomeTeste);
    cy.get('[input-testid="email-input"]').type(emailTeste);
    cy.get('[input-testid="cpf-input"]').type(cpfTeste);
    cy.get('[input-testid="senha-input"]').type(senhaTeste);
    cy.get('[input-testid="confirmar-senha-input"]').type(senhaTeste);

    cy.get('[input-testid="btn-finalizar-cadastro"]').click();

    cy.get('[input-testid="mensagem-feedback"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Usuário criado com sucesso')
      .and('have.class', 'bg-green-500');

    cy.get('[input-testid="nome-input"]').should('have.value', '');
  });


  // --- TESTES DE VALIDAÇÃO E ERRO ---
  it('Deve impedir o cadastro de um e-mail duplicado criando o usuário na hora', () => {
    const emailDuplicado = `duplicado_${Date.now()}@estoqueraiz.com`;
    const cpf1 = gerarCpfValido();
    const cpf2 = gerarCpfValido();

    cy.get('[input-testid="nome-input"]').type('Primeiro Usuario');
    cy.get('[input-testid="email-input"]').type(emailDuplicado);
    cy.get('[input-testid="cpf-input"]').type(cpf1);
    cy.get('[input-testid="senha-input"]').type('Senha123!');
    cy.get('[input-testid="confirmar-senha-input"]').type('Senha123!');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();

    cy.get('[input-testid="mensagem-feedback"]').should('contain', 'sucesso');

    cy.visit('/cadastro'); 
    
    cy.get('[input-testid="nome-input"]').type('Segundo Usuario');
    cy.get('[input-testid="email-input"]').type(emailDuplicado);
    cy.get('[input-testid="cpf-input"]').type(cpf2);
    cy.get('[input-testid="senha-input"]').type('Senha123!');
    cy.get('[input-testid="confirmar-senha-input"]').type('Senha123!');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();

    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible')
      .and('contain', 'Email já está em uso');
  });

  it('Deve validar erro de CPF já cadastrado', () => {
    const cpfDuplicado = gerarCpfValido();
    const email1 = `email1_${Date.now()}@test.com`;
    const email2 = `email2_${Date.now()}@test.com`;

    cy.get('[input-testid="nome-input"]').type('CPF duplicado Teste');
    cy.get('[input-testid="email-input"]').type(email1);
    cy.get('[input-testid="cpf-input"]').type(cpfDuplicado);
    cy.get('[input-testid="senha-input"]').type('Senha123!');
    cy.get('[input-testid="confirmar-senha-input"]').type('Senha123!');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();
    cy.get('[input-testid="mensagem-feedback"]').should('contain', 'sucesso');

    cy.visit('/cadastro');
    cy.get('[input-testid="nome-input"]').type('Impostor Teste');
    cy.get('[input-testid="email-input"]').type(email2);
    cy.get('[input-testid="cpf-input"]').type(cpfDuplicado);
    cy.get('[input-testid="senha-input"]').type('Senha123!');
    cy.get('[input-testid="confirmar-senha-input"]').type('Senha123!');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();

    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible')
      .and('contain', 'CPF já está em uso');
  });

 it('Deve exibir o erro "As senhas não coincidem!" no topo ao tentar finalizar o cadastro', () => {
    cy.get('[input-testid="nome-input"]').type('Usuário Teste');
    cy.get('[input-testid="email-input"]').type('teste@email.com');
    cy.get('[input-testid="cpf-input"]').type('12345678901');

    cy.get('[input-testid="senha-input"]').type('SenhaValida123!');
    cy.get('[input-testid="confirmar-senha-input"]').type('SenhaErrada456!');

    cy.get('[input-testid="btn-finalizar-cadastro"]').click();

    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible')
      .and('contain', 'As senhas não coincidem!');
  });

it('Deve validar os requisitos de segurança da senha (6 caracteres, Maiúscula e Número)', () => {
    const emailBase = `senha_fraca_${Date.now()}@test.com`;
    const cpfBase = gerarCpfValido();

    // --- CENÁRIO 1: Senha Curta (menos de 6 caracteres) ---
    cy.visit('/cadastro'); // Garante o estado inicial limpo
    cy.get('[input-testid="nome-input"]').type('Usuario Senha Curta');
    cy.get('[input-testid="email-input"]').type(emailBase);
    cy.get('[input-testid="cpf-input"]').type(cpfBase);
    // Digita senha com apenas 3 caracteres
    cy.get('[input-testid="senha-input"]').type('Ab1'); 
    cy.get('[input-testid="confirmar-senha-input"]').type('Ab1');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();
    
    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible')
      .and('contain', 'pelo menos 6 caracteres');

    // --- CENÁRIO 2: Senha sem letra maiúscula ---
    cy.visit('/cadastro'); // Recarrega para limpar os alertas e inputs
    // Preenche TUDO de novo para passar na validação do HTML (required)
    cy.get('[input-testid="nome-input"]').type('Usuario Sem Maiuscula');
    cy.get('[input-testid="email-input"]').type(emailBase); // Pode reusar o e-mail, pois não cadastrou
    cy.get('[input-testid="cpf-input"]').type(cpfBase);
    // Digita senha inválida (tudo minúsculo)
    cy.get('[input-testid="senha-input"]').type('senha123'); 
    cy.get('[input-testid="confirmar-senha-input"]').type('senha123');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();
    
    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible') // Sempre bom garantir que está visível
      .and('contain', 'letra maiúscula');

    // --- CENÁRIO 3: Senha sem número ---
    cy.visit('/cadastro'); // Recarrega a página novamente
    // Preenche TUDO de novo
    cy.get('[input-testid="nome-input"]').type('Usuario Sem Numero');
    cy.get('[input-testid="email-input"]').type(emailBase);
    cy.get('[input-testid="cpf-input"]').type(cpfBase);
    // Digita senha inválida (sem números)
    cy.get('[input-testid="senha-input"]').type('SenhaMaiuscula'); 
    cy.get('[input-testid="confirmar-senha-input"]').type('SenhaMaiuscula');
    cy.get('[input-testid="btn-finalizar-cadastro"]').click();
    
    cy.get('[input-testid="mensagem-feedback"]')
      .should('be.visible')
      .and('contain', 'um número');
  });
});