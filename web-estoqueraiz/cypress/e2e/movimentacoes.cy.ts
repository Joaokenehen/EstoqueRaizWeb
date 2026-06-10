describe('CRUD de Movimentações - Teste E2E', () => {
  beforeEach(() => {
    // Fazemos o login real na aplicação usando os dados do seed do PostgreSQL.
    // Assim garantimos um Token JWT válido, resolvendo os erros 401 (Unauthorized).

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('gerente@estoqueraiz.com');
    cy.get('[data-testid="senha-input"]').type('Senha123!');
    cy.contains('button', 'Entrar no Sistema').click();

    // Aguarda até o redirecionamento ocorrer para garantir que a sessão foi salva
    cy.url().should('include', '/dashboard');

    // Navega para a tela do CRUD
    cy.visit('/movimentacoes');
  });

  it('1. Deve listar as movimentações na tabela (READ)', () => {
    // Verifica se o título da página carregou
    cy.get('h1').contains('Movimentações de Estoque').should('be.visible');

    // Verifica se a tabela de listagem carregou na tela
    cy.get('table').should('be.visible');
  });

  it('2. Deve criar uma nova movimentação de SAIDA (CREATE)', () => {
    // Clica no botão de criar novo
    cy.contains('button', 'Registrar Movimento').click();

    // Seleciona a opção de SAÍDA nos Radio Buttons customizados
    cy.contains('label', 'SAIDA').click();

    // Seleciona a Unidade de Origem (Aguardando carregar as opções)
    cy.contains('label', 'Unidade de Origem').parent().find('select').select('1'); // ID 1

    // Seleciona o Produto 
    cy.contains('label', 'Produto').parent().find('select').select('1'); // ID 1

    // Preenche a quantidade
    cy.contains('label', 'Quantidade').parent().find('input[type="number"]').type('10');
    
    // Clica no botão "+" para adicionar à lista
    cy.get('button[title="Adicionar à lista"]').click();

    // Intercepta a requisição da API para garantir que bateu no backend
    cy.intercept('POST', '**/api/movimentacoes').as('criarMovimentacao');
    cy.contains('button', 'Confirmar e Gravar Movimento').click();
    
    cy.wait('@criarMovimentacao').its('response.statusCode').should('eq', 201);
    
    // O sistema deve mostrar o toast (notificação) de sucesso na interface
    cy.contains('registrada com sucesso').should('be.visible');
  });

  it('3. Deve visualizar os detalhes completos da movimentação', () => {
    // Encontra o botão de "olho" da primeira linha da tabela e clica
    cy.get('table tbody tr').first().find('button[title="Ver Detalhes Completos"]').click();
    
    // Garante que o Modal de visualização abriu preenchido
    cy.contains('Detalhes da Movimentação').should('be.visible');
    cy.contains('Produto Movimentado').should('be.visible');
  });
});