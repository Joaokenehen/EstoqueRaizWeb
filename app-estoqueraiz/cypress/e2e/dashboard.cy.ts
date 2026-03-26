describe('Dashboard e Controle de Acesso (RBAC)', () => {
  
  const fazerLoginMock = (cargo: string | null) => {
    cy.visit('/login');
    cy.window().then((win) => { 
      win.localStorage.setItem('@EstoqueRaiz:token', 'token-falso');
      win.localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify({ 
        id: 1, 
        nome: 'Usuário Teste', 
        email: 'teste@teste.com', 
        cargo: cargo 
      }));
    });
    cy.visit('/dashboard');
  };

  it('Gerente deve ver todos os módulos, incluindo "Usuários"', () => {
    fazerLoginMock('gerente');
    cy.contains('gerente', {matchCase: false}).should('be.visible');
    cy.contains('h3', 'Usuários').should('be.visible');
    cy.contains('h3', 'Produtos').should('be.visible');
    cy.contains('h3', 'Categorias').should('be.visible');
    cy.contains('h3', 'Movimentações').should('be.visible');   
    cy.contains('h3', 'Unidades').should('be.visible');
    cy.contains('h3', 'Relatórios').should('be.visible');
  });

  it('Estoquista NÃO deve ver o módulo "Usuários", "Unidades", e "Relatórios"', () => {
    fazerLoginMock('estoquista');
    cy.contains('estoquista', {matchCase:false}).should('be.visible');
    cy.contains('h3', 'Usuários').should('not.exist');
    cy.contains('h3', 'Unidades').should('not.exist');
    cy.contains('h3', 'Relatórios').should('not.exist');
    cy.contains('h3', 'Categorias').should('be.visible');
    cy.contains('h3', 'Produtos').should('be.visible');
    cy.contains('h3', 'Movimentações').should('be.visible');
  });

    it('Financeiro NÃO deve ver o módulo "Usuários", "Categorias", "Unidades" e "Movimentações', () => {
    fazerLoginMock('financeiro');
    cy.contains('financeiro', {matchCase:false}).should('be.visible');
    cy.contains('h3', 'Usuários').should('not.exist');
    cy.contains('h3', 'Unidades').should('not.exist');
    cy.contains('h3', 'Categorias').should('not.exist');
    cy.contains('h3', 'Movimentações').should('not.exist');
    cy.contains('h3', 'Produtos').should('be.visible');
    cy.contains('h3', 'Relatórios').should('be.visible');
  });

  it('Usuário sem permissões deve ver a tela de "Acesso Restrito" (Cadeado)', () => {
    fazerLoginMock(null);
    cy.contains('Acesso Restrito').should('be.visible');
    cy.contains('Você ainda não possui permissões associadas à sua conta').should('be.visible');
    cy.get('button').contains('Produtos').should('not.exist');
  });

  it('Deve abrir e fechar o Menu Lateral (Sidebar) em telas pequenas', () => {
    fazerLoginMock('gerente');
    cy.viewport('iphone-x');
    cy.get('header').find('button').first().click(); 
    cy.contains('Estoque Raiz').should('be.visible');
  });
});