import { criarUsuarioSessao, visitarComSessao } from '../support/testHelpers';
import { usuariosFixtures, type Usuario } from '../fixtures/usuarios';
import { unidadesFixtures } from '../fixtures/unidades';

describe('Modulo de Usuarios', () => {
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
      ...usuariosFixtures.lista().filter((u) => u.id !== gerenteLogado.id),
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

  // ----------------------------------------------------------------
  context('Aprovação de Usuários Pendentes', () => {

  it('exige cargo e unidade antes de aprovar um cadastro pendente', () => {
    abrirPagina();

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('tr', 'Ana Pendente').within(() => {
      cy.get('[title="Aprovar"]').click();
    });

    cy.get('@windowAlert').should('have.been.calledWithMatch', /selecione o CARGO/i);

    cy.get('[data-testid="usuarios-select-cargo-20"]').select('estoquista');

    cy.contains('tr', 'Ana Pendente').within(() => {
      cy.get('[title="Aprovar"]').click();
    });

    cy.get('@windowAlert').should('have.been.calledWithMatch', /selecione a UNIDADE/i);
  });

  it('aprova um usuario pendente e vincula a unidade selecionada', () => {
    cy.intercept('PATCH', '**/api/usuarios/20/aprovar', (req) => {
      expect(req.body).to.deep.equal({
        dados: {
          cargo: 'estoquista',
          unidade_id: 1,
        },
      });

      usuariosMock = usuariosMock.map((usuario) =>
        usuario.id === 20
          ? { ...usuario, cargo: 'estoquista', status: 'aprovado', unidade_id: 1 }
          : usuario,
      );

      req.reply({ statusCode: 200, body: {} });
    }).as('aprovarUsuario');

    abrirPagina();

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('[data-testid="usuarios-select-cargo-20"]').select('estoquista');
    cy.get('[data-testid="usuarios-select-unidade-20"]').select('Matriz SP');

    cy.contains('tr', 'Ana Pendente').within(() => {
      cy.get('[title="Aprovar"]').click();
    });

    cy.wait('@aprovarUsuario');
    cy.wait('@listarUsuarios');

    cy.get('@windowAlert').should('have.been.calledWithMatch', /aprovado e vinculado/i);
    cy.contains('tr', 'Ana Pendente').within(() => {
      cy.contains('Aprovado').should('be.visible');
    });
    cy.get('[data-testid="usuarios-select-cargo-20"]').should('have.value', 'estoquista');
    cy.get('[data-testid="usuarios-select-unidade-20"]').should('have.value', '1');
  });
  });

  // ----------------------------------------------------------------
  context('Gerenciamento de Permissões', () => {

  it('salva alteracoes de cargo e unidade em usuario aprovado', () => {
    cy.intercept('PUT', '**/api/usuarios/30', (req) => {
      expect(req.body).to.deep.equal({
        cargo: 'financeiro',
        unidade_id: 2,
      });

      usuariosMock = usuariosMock.map((usuario) =>
        usuario.id === 30
          ? { ...usuario, cargo: 'financeiro', unidade_id: 2 }
          : usuario,
      );

      req.reply({ statusCode: 200, body: {} });
    }).as('salvarPermissoes');

    abrirPagina();

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('[data-testid="usuarios-select-cargo-30"]').select('financeiro');
    cy.get('[data-testid="usuarios-select-unidade-30"]').select('Filial Norte');

    cy.contains('tr', 'Carlos Estoquista').within(() => {
      cy.get('[title="Salvar novo cargo"]').click();
    });

    cy.wait('@salvarPermissoes');
    cy.wait('@listarUsuarios');

    cy.get('@windowAlert').should('have.been.calledWithMatch', /atualizadas com sucesso/i);
    cy.get('[data-testid="usuarios-select-cargo-30"]').should('have.value', 'financeiro');
    cy.get('[data-testid="usuarios-select-unidade-30"]').should('have.value', '2');
  });

  it('impede que o gerente exclua a propria conta', () => {
    abrirPagina();

    cy.contains('tr', 'Gerente Atual').within(() => {
      cy.get('input[type="checkbox"]').should('be.disabled');
      cy.get('[title*="Apenas outro administrador"]').should('be.disabled');
    });
  });
  });

  // ----------------------------------------------------------------
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
