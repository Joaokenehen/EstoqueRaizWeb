/**
 * Testes da pagina de login - comportamento da interface.
 *
 * Estes testes mockam o backend e focam apenas na UI.
 * Para integracao real com backend + banco, veja:
 * cypress/e2e/auth/login.integration.cy.ts
 */

describe('Pagina de Login - Testes de UI', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  context('Validacao de Entrada', () => {
    it('mostra erro generico para credenciais invalidas', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { message: 'Email ou senha incorretos' },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('hacker@teste.com');
      cy.get('[data-testid="senha-input"]').type('senhaErrada123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginRequest');
      cy.contains('Email ou senha incorretos').should('be.visible');
    });

    it('mostra aviso amigavel para conta pendente', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 403,
        body: { message: 'Conta nao aprovada' },
      }).as('loginPendente');

      cy.get('[data-testid="email-input"]').type('novo@teste.com');
      cy.get('[data-testid="senha-input"]').type('SenhaCorreta123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginPendente');
      cy.contains('Sua conta').should('be.visible');
    });

    it('mostra erro para servidor indisponivel', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 503,
        body: { message: 'Servico indisponivel' },
      }).as('servicoIndisponivel');

      cy.get('[data-testid="email-input"]').type('usuario@teste.com');
      cy.get('[data-testid="senha-input"]').type('Senha123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@servicoIndisponivel');
      cy.contains(/erro|indispon/i).should('be.visible');
    });
  });

  context('Comportamento de Sucesso', () => {
    it('faz login com sucesso e redireciona para dashboard', () => {
      const usuarioMock = {
        id: 1,
        nome: 'Usuario Teste',
        email: 'teste@estoqueraiz.com',
        cargo: 'gerente',
        unidade_id: 1,
      };

      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          usuario: usuarioMock,
          token: 'jwt-token-mock-12345',
        },
      }).as('loginSucesso');

      cy.get('[data-testid="email-input"]').type('teste@estoqueraiz.com');
      cy.get('[data-testid="senha-input"]').type('SenhaCorreta123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginSucesso');
      cy.url().should('include', '/dashboard');

      cy.window().then((window) => {
        const token = window.localStorage.getItem('@EstoqueRaiz:token');
        expect(token).to.equal('jwt-token-mock-12345');
      });
    });

    it('salva dados do usuario no localStorage apos login', () => {
      const usuarioMock = {
        id: 42,
        nome: 'Joao Silva',
        email: 'joao@estoqueraiz.com',
        cargo: 'estoquista',
        unidade_id: 2,
      };

      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: { usuario: usuarioMock, token: 'token-123' },
      }).as('loginSucesso');

      cy.get('[data-testid="email-input"]').type(usuarioMock.email);
      cy.get('[data-testid="senha-input"]').type('Senha123');
      cy.contains('button', 'Entrar no Sistema').click();

      cy.wait('@loginSucesso');

      cy.window().then((window) => {
        const usuarioSalvo = JSON.parse(window.localStorage.getItem('@EstoqueRaiz:usuario') || '{}');
        expect(usuarioSalvo.nome).to.equal('Joao Silva');
        expect(usuarioSalvo.cargo).to.equal('estoquista');
      });
    });
  });

  context('Navegacao e Links', () => {
    it('abre a tela de recuperacao de senha pelo link do formulario', () => {
      cy.get('[data-testid="login-link-esqueci-senha"]').click();

      cy.url().should('include', '/esqueci-senha');
      cy.get('[data-testid="esqueci-input-email"]').should('be.visible');
    });

    it('permite voltar para login a partir de esqueci-senha', () => {
      cy.get('[data-testid="login-link-esqueci-senha"]').click();
      cy.url().should('include', '/esqueci-senha');

      cy.get('[data-testid="esqueci-btn-voltar-login"]').click();
      cy.url().should('include', '/login');
    });

    it('abre pagina de cadastro', () => {
      cy.get('[data-testid="login-link-cadastro"]').click();

      cy.url().should('include', '/cadastro');
    });
  });

  context('Validacao de Campos', () => {
    it('limpa campo de email sem quebrar', () => {
      cy.get('[data-testid="email-input"]').type('teste@email.com');
      cy.get('[data-testid="email-input"]').clear();
      cy.get('[data-testid="email-input"]').should('have.value', '');
    });

    it('limpa campo de senha sem quebrar', () => {
      cy.get('[data-testid="senha-input"]').type('senhaForte123');
      cy.get('[data-testid="senha-input"]').clear();
      cy.get('[data-testid="senha-input"]').should('have.value', '');
    });

    it('mantem focus correto entre campos', () => {
      cy.get('[data-testid="email-input"]').focus().should('have.focus');
      cy.get('[data-testid="senha-input"]').focus().should('have.focus');
    });
  });
});
