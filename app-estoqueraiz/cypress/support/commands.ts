/// <reference types="cypress" />

export {};

type CargoUsuario = 'gerente' | 'estoquista' | 'financeiro' | null;

interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  unidade_id: number | null;
  status: 'aprovado' | 'pendente' | 'rejeitado';
}

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, senha: string): Chainable<void>;
      visitAuthenticated(path: string, usuario?: Partial<UsuarioSessao>): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, senha: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="senha-input"]').type(senha);
  cy.contains('button', 'Entrar no Sistema').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('visitAuthenticated', (path: string, usuarioParcial: Partial<UsuarioSessao> = {}) => {
  const usuario: UsuarioSessao = {
    id: 1,
    nome: 'Usuario Teste',
    email: 'usuario@estoqueraiz.com',
    cargo: 'gerente',
    unidade_id: 1,
    status: 'aprovado',
    ...usuarioParcial,
  };

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.localStorage.setItem('@EstoqueRaiz:token', 'token-falso');
      win.localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuario));
    },
  });
});
