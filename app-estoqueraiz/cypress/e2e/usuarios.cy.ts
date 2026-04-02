import { criarUsuarioSessao, visitarComSessao } from '../support/testHelpers';
import { usuariosFixtures, type Usuario } from '../fixtures/usuarios';
import { unidadesFixtures } from '../fixtures/unidades';

describe('Modulo de Usuarios', () => {
  const usuarioPendente = {
    id: 4,
    nome: 'Ana Oliveira',
  };

  const usuarioAprovado = {
    id: 2,
    nome: 'Maria Santos',
  };

  const gerenteLogado = criarUsuarioSessao({
    id: 10,
    nome: 'Gerente Atual',
    email: 'gerente@estoqueraiz.com',
    cargo: 'gerente',
    unidade_id: 1,
  });

  let usuariosMock: Usuario[];

  const resetarMocks = () => {
    usuariosMock = [
      {
        id: gerenteLogado.id,
        nome: gerenteLogado.nome,
        email: gerenteLogado.email,
        cargo: 'gerente',
        status: 'aprovado',
        unidade_id: 1,
      },
      ...usuariosFixtures.lista().filter((usuario) => usuario.id !== gerenteLogado.id),
    ];

    cy.intercept('GET', '**/api/usuarios', (req) => {
      req.reply([...usuariosMock]);
    }).as('listarUsuarios');

    cy.intercept('GET', '**/api/unidades', unidadesFixtures.lista()).as('listarUnidades');
  };

  const abrirPagina = () => {
    resetarMocks();
    visitarComSessao('/usuarios', gerenteLogado);
    cy.wait('@listarUsuarios');
    cy.wait('@listarUnidades');
  };

  const linhaDoUsuario = (nome: string) => cy.contains('tbody tr', nome);

  context('Aprovacao de Usuarios Pendentes', () => {
    it('exige cargo e unidade antes de aprovar um cadastro pendente', () => {
      abrirPagina();

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      linhaDoUsuario(usuarioPendente.nome).within(() => {
        cy.get('[title="Aprovar"]').click();
      });

      cy.get('@windowAlert').should('have.been.calledWithMatch', /selecione o CARGO/i);

      cy.get(`[data-testid="usuarios-select-cargo-${usuarioPendente.id}"]`).select('estoquista');

      linhaDoUsuario(usuarioPendente.nome).within(() => {
        cy.get('[title="Aprovar"]').click();
      });

      cy.get('@windowAlert').should('have.been.calledWithMatch', /selecione a UNIDADE/i);
    });

    it('aprova um usuario pendente e vincula a unidade selecionada', () => {
      cy.intercept('PATCH', `**/api/usuarios/${usuarioPendente.id}/aprovar`, (req) => {
        expect(req.body).to.deep.equal({
          dados: {
            cargo: 'estoquista',
            unidade_id: 1,
          },
        });

        usuariosMock = usuariosMock.map((usuario) =>
          usuario.id === usuarioPendente.id
            ? { ...usuario, cargo: 'estoquista', status: 'aprovado', unidade_id: 1 }
            : usuario
        );

        req.reply({ statusCode: 200, body: {} });
      }).as('aprovarUsuario');

      abrirPagina();

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.get(`[data-testid="usuarios-select-cargo-${usuarioPendente.id}"]`).select('estoquista');
      cy.get(`[data-testid="usuarios-select-unidade-${usuarioPendente.id}"]`).select('Matriz SP');

      linhaDoUsuario(usuarioPendente.nome).within(() => {
        cy.get('[title="Aprovar"]').click();
      });

      cy.wait('@aprovarUsuario');

      cy.get('@windowAlert').should('have.been.calledWithMatch', /aprovado e vinculado/i);
      linhaDoUsuario(usuarioPendente.nome).should('contain.text', 'Aprovado');
      cy.get(`[data-testid="usuarios-select-cargo-${usuarioPendente.id}"]`).should('have.value', 'estoquista');
      cy.get(`[data-testid="usuarios-select-unidade-${usuarioPendente.id}"]`).should('have.value', '1');
    });
  });

  context('Gerenciamento de Permissoes', () => {
    it('salva alteracoes de cargo e unidade em usuario aprovado', () => {
      cy.intercept('PUT', `**/api/usuarios/${usuarioAprovado.id}`, (req) => {
        expect(req.body).to.deep.equal({
          cargo: 'financeiro',
          unidade_id: 2,
        });

        usuariosMock = usuariosMock.map((usuario) =>
          usuario.id === usuarioAprovado.id
            ? { ...usuario, cargo: 'financeiro', unidade_id: 2 }
            : usuario
        );

        req.reply({ statusCode: 200, body: {} });
      }).as('salvarPermissoes');

      abrirPagina();

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.get(`[data-testid="usuarios-select-cargo-${usuarioAprovado.id}"]`).select('financeiro');
      cy.get(`[data-testid="usuarios-select-unidade-${usuarioAprovado.id}"]`).select('Filial Norte');

      linhaDoUsuario(usuarioAprovado.nome).within(() => {
        cy.get('[title="Salvar novo cargo"]').click();
      });

      cy.wait('@salvarPermissoes');

      cy.get('@windowAlert').should('have.been.calledWithMatch', /atualizadas com sucesso/i);
      cy.get(`[data-testid="usuarios-select-cargo-${usuarioAprovado.id}"]`).should('have.value', 'financeiro');
      cy.get(`[data-testid="usuarios-select-unidade-${usuarioAprovado.id}"]`).should('have.value', '2');
    });

    it('impede que o gerente exclua a propria conta', () => {
      abrirPagina();

      linhaDoUsuario('Gerente Atual').within(() => {
        cy.get('input[type="checkbox"]').should('be.disabled');
        cy.get('[title*="Apenas outro administrador"]').should('be.disabled');
      });
    });
  });

  context('Controle de Acesso', () => {
    it('bloqueia acesso direto para estoquista', () => {
      visitarComSessao('/usuarios', {
        cargo: 'estoquista',
        nome: 'Estoquista Teste',
        email: 'estoquista@estoqueraiz.com',
        unidade_id: 1,
      });

      cy.url().should('include', '/dashboard');
    });
  });
});
