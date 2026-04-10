describe('Dashboard e Controle de Acesso (RBAC)', () => {

  const fazerLoginMock = (cargo: string | null) => {
    cy.visit('/login');
    cy.window().then((win) => {
      win.localStorage.setItem('@EstoqueRaiz:token', 'token-falso');
      win.localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify({
        id: 1,
        nome: 'Usuário Teste',
        email: 'teste@teste.com',
        cargo: cargo,
      }));
    });
    cy.visit('/dashboard');
  };

  // ----------------------------------------------------------------
  context('Proteção de Rotas', () => {

    it('Deve redirecionar para /login ao acessar /dashboard sem autenticação', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('Deve redirecionar para /login ao acessar rota protegida sem autenticação', () => {
      cy.visit('/usuarios');
      cy.url().should('include', '/login');
    });

    it('Deve redirecionar para /login ao acessar /relatorios sem autenticação', () => {
      cy.visit('/relatorios');
      cy.url().should('include', '/login');
    });

    it('Deve redirecionar / para /login', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });
  });

  // ----------------------------------------------------------------
  context('Visibilidade de Módulos por Cargo', () => {

    context('Gerente', () => {

      beforeEach(() => fazerLoginMock('gerente'));

      it('Deve exibir o cargo "Gerente" no badge da sidebar', () => {
        cy.contains('Gerente').should('be.visible');
      });

      it('Deve ver todos os módulos do sistema', () => {
        cy.contains('h3', 'Usuários').should('be.visible');
        cy.contains('h3', 'Produtos').should('be.visible');
        cy.contains('h3', 'Categorias').should('be.visible');
        cy.contains('h3', 'Movimentações').should('be.visible');
        cy.contains('h3', 'Unidades').should('be.visible');
        cy.contains('h3', 'Relatórios').should('be.visible');
      });
    });

    context('Estoquista', () => {

      beforeEach(() => fazerLoginMock('estoquista'));

      it('Deve exibir o cargo "Estoquista" no badge da sidebar', () => {
        cy.contains('Estoquista').should('be.visible');
      });

      it('Deve ver apenas os módulos permitidos', () => {
        cy.contains('h3', 'Produtos').should('be.visible');
        cy.contains('h3', 'Categorias').should('be.visible');
        cy.contains('h3', 'Movimentações').should('be.visible');
      });

      it('Não deve ver os módulos restritos', () => {
        cy.contains('h3', 'Usuários').should('not.exist');
        cy.contains('h3', 'Unidades').should('not.exist');
        cy.contains('h3', 'Relatórios').should('not.exist');
      });
    });

    context('Financeiro', () => {

      beforeEach(() => fazerLoginMock('financeiro'));

      it('Deve exibir o cargo "Financeiro" no badge da sidebar', () => {
        cy.contains('Financeiro').should('be.visible');
      });

      it('Deve ver apenas os módulos permitidos', () => {
        cy.contains('h3', 'Produtos').should('be.visible');
        cy.contains('h3', 'Relatórios').should('be.visible');
      });

      it('Não deve ver os módulos restritos', () => {
        cy.contains('h3', 'Usuários').should('not.exist');
        cy.contains('h3', 'Unidades').should('not.exist');
        cy.contains('h3', 'Categorias').should('not.exist');
        cy.contains('h3', 'Movimentações').should('not.exist');
      });
    });

    context('Sem Cargo (Acesso Restrito)', () => {

      beforeEach(() => fazerLoginMock(null));

      it('Deve exibir a tela de Acesso Restrito com ícone de cadeado', () => {
        cy.contains('Acesso Restrito').should('be.visible');
        cy.contains('Você ainda não possui permissões associadas à sua conta').should('be.visible');
      });

      it('Não deve exibir nenhum card de módulo', () => {
        cy.contains('h3', 'Produtos').should('not.exist');
        cy.contains('h3', 'Categorias').should('not.exist');
        cy.contains('h3', 'Movimentações').should('not.exist');
        cy.contains('h3', 'Usuários').should('not.exist');
        cy.contains('h3', 'Unidades').should('not.exist');
        cy.contains('h3', 'Relatórios').should('not.exist');
      });
    });
  });

  // ----------------------------------------------------------------
  context('Navegação pelos Módulos', () => {

    it('Gerente deve navegar para /usuarios ao clicar no card', () => {
      fazerLoginMock('gerente');
      cy.contains('h3', 'Usuários').click();
      cy.url().should('include', '/usuarios');
    });

    it('Gerente deve navegar para /produtos ao clicar no card', () => {
      fazerLoginMock('gerente');
      cy.contains('h3', 'Produtos').click();
      cy.url().should('include', '/produtos');
    });

    it('Financeiro deve navegar para /relatorios ao clicar no card', () => {
      fazerLoginMock('financeiro');
      cy.contains('h3', 'Relatórios').click();
      cy.url().should('include', '/relatorios');
    });

    it('Estoquista deve navegar para /movimentacoes ao clicar no card', () => {
      fazerLoginMock('estoquista');
      cy.contains('h3', 'Movimentações').click();
      cy.url().should('include', '/movimentacoes');
    });
  });

  // ----------------------------------------------------------------
  context('Interface e Responsividade', () => {

    it('Deve abrir o Menu Lateral ao clicar no botão hambúrguer', () => {
      fazerLoginMock('gerente');
      cy.viewport('iphone-x');
      cy.get('header').find('button').first().click();
      cy.contains('Estoque Raiz').should('be.visible');
    });

    it('Deve fechar o Menu Lateral ao clicar no overlay escuro', () => {
      fazerLoginMock('gerente');
      cy.viewport('iphone-x');
      cy.get('header').find('button').first().click();
      cy.contains('Estoque Raiz').should('be.visible');
      
      cy.get('[data-testid="backdrop-sidebar"]').click({ force: true });
      
      cy.contains('Estoque Raiz').should('not.be.visible');
    });

    it('Deve fechar o Menu Lateral ao clicar no overlay escuro', () => {
      fazerLoginMock('gerente');
      cy.viewport('iphone-x');
      cy.get('header').find('button').first().click();
      cy.contains('Estoque Raiz').should('be.visible');

      cy.get('[data-testid="backdrop-sidebar"]').click({ force: true });      

      cy.contains('Estoque Raiz').should('not.be.visible');
    });

    it('Deve exibir o dashboard normalmente em tela desktop', () => {
      fazerLoginMock('gerente');
      cy.viewport(1280, 720);
      cy.contains('Visão Geral').should('be.visible');
    });
  });

  // ----------------------------------------------------------------
  context('Modal de Perfil', () => {

    beforeEach(() => fazerLoginMock('gerente'));

    it('Deve abrir o modal de perfil ao clicar em "Meu Perfil"', () => {
      cy.get('[data-testid="menu-usuario-btn"]').click();
      cy.contains('Meu Perfil').click();
      cy.contains('Dados Pessoais').should('be.visible');
      cy.contains('teste@teste.com').should('be.visible');
    });

    it('Deve fechar o modal ao clicar no botão X', () => {
      cy.get('[data-testid="menu-usuario-btn"]').click();
      cy.contains('Meu Perfil').click();
      cy.contains('Dados Pessoais').should('be.visible');
      
      cy.get('[data-testid="btn-fechar-modal"]').click();
      
      cy.contains('Dados Pessoais').should('not.exist');
    });

    it('Deve habilitar edição do nome ao clicar em "Editar Nome"', () => {
      cy.get('[data-testid="menu-usuario-btn"]').click();
      cy.contains('Meu Perfil').click();
      cy.contains('Editar Nome').click();
      cy.get('input[placeholder="Seu nome"]').should('be.visible').and('have.value', 'Usuário Teste');
    });

    it('Deve impedir salvar com nome vazio', () => {
      cy.get('[data-testid="menu-usuario-btn"]').click();
      cy.contains('Meu Perfil').click();
      cy.contains('Editar Nome').click();
      cy.get('input[placeholder="Seu nome"]').clear();
      cy.contains('Salvar Nome').click();
      cy.contains('O nome não pode ficar vazio.').should('be.visible');
    });

    it('Deve cancelar edição e restaurar o nome original', () => {
      cy.get('[data-testid="menu-usuario-btn"]').click();
      cy.contains('Meu Perfil').click();
      cy.contains('Editar Nome').click();
      cy.get('input[placeholder="Seu nome"]').clear().type('Nome Alterado');
      cy.contains('Cancelar').click();
      cy.contains('Usuário Teste').should('be.visible');
      cy.get('input[placeholder="Seu nome"]').should('not.exist');
    });
  });
});
