describe('CRUD de Movimentações - Teste E2E', () => {
  beforeEach(() => {
    // Intercepta a chamada de login e "moka" o retorno para pularmos direto pra tela logada
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { usuario: { id: 1, cargo: 'gerente', unidade_id: 1 }, token: 'fake-jwt' }
    }).as('login');

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('gerente@estoqueraiz.com');
    cy.get('[data-testid="senha-input"]').type('Senha123!');
    cy.contains('button', 'Entrar no Sistema').click();
    cy.wait('@login');

    // Navega para a tela do CRUD
    cy.visit('/movimentacoes');
  });

  it('1. Deve listar as movimentações na tabela (READ)', () => {
    // Verifica se a tabela de listagem carregou na tela
    cy.get('table').should('be.visible');
    // Verifica se os botões de filtro existem
    cy.contains('Filtrar').should('be.visible');
  });

  it('2. Deve criar uma nova movimentação de SAIDA (CREATE)', () => {
    // Clica no botão de criar novo
    cy.contains('button', 'Nova Movimentação').click();

    // Preenche o formulário
    cy.get('select[name="tipo"]').select('SAIDA');
    cy.get('select[name="produto_id"]').select('1'); // Produto de ID 1
    cy.get('input[name="quantidade"]').type('10');
    
    // Salva e intercepta a requisição da API para garantir que bateu no backend
    cy.intercept('POST', '**/api/movimentacoes').as('criarMovimentacao');
    cy.contains('button', 'Salvar').click();
    
    cy.wait('@criarMovimentacao').its('response.statusCode').should('eq', 201);
    
    // O sistema deve mostrar a mensagem de sucesso na interface
    cy.contains('Movimentação criada com sucesso').should('be.visible');
  });

  it('3. Deve deletar uma movimentação (DELETE)', () => {
    cy.intercept('DELETE', '**/api/movimentacoes/*').as('deletarMovimentacao');
    
    // Encontra o botão de deletar (lixeira) da primeira linha da tabela e clica
    cy.get('table tbody tr').first().find('[data-testid="btn-excluir"]').click();
    
    cy.wait('@deletarMovimentacao').its('response.statusCode').should('eq', 200);
    cy.contains('Movimentação deletada').should('be.visible');
  });
});