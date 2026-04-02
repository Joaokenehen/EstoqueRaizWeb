import { visitarComSessao } from '../support/testHelpers';
import { categoriasFixtures, type Categoria } from '../fixtures/categorias';
import { usuariosTesteSession } from '../fixtures/testData';

describe('Modulo de Categorias', () => {
  let categoriasMock: Categoria[];

  const resetarMocks = () => {
    categoriasMock = categoriasFixtures.lista();

    cy.intercept('GET', '**/api/categorias', (req) => {
      req.reply([...categoriasMock]);
    }).as('listarCategorias');
  };

  const abrirPagina = (cargo: 'gerente' | 'estoquista' = 'gerente') => {
    resetarMocks();
    visitarComSessao('/categorias', {
      cargo,
      nome: cargo === 'gerente' ? 'Gerente Teste' : 'Estoquista Teste',
      email: `${cargo}@estoqueraiz.com`,
      unidade_id: 1,
    });
    cy.wait('@listarCategorias');
  };

  // ----------------------------------------------------------------
  context('Criação de Categorias', () => {

  it('permite ao gerente criar uma nova categoria', () => {
    cy.intercept('POST', '**/api/categorias', (req) => {
      expect(req.body).to.deep.equal({
        nome: 'Automacao',
        descricao: 'Sensores, controladores e acionamentos',
      });

      const novaCategoria = {
        id: 4,
        nome: 'Automacao',
        descricao: 'Sensores, controladores e acionamentos',
      };

      categoriasMock = [...categoriasMock, novaCategoria];
      req.reply({ statusCode: 201, body: { categoria: novaCategoria } });
    }).as('criarCategoria');

    abrirPagina('gerente');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('button', 'Nova Categoria').click();
    cy.get('[data-testid="categorias-input-nome"]').type('Automacao');
    cy.get('[data-testid="categorias-textarea-descricao"]').type('Sensores, controladores e acionamentos');
    cy.contains('button', 'Guardar Categoria').click();

    cy.wait('@criarCategoria');
    cy.wait('@listarCategorias');

    cy.get('@windowAlert').should('have.been.calledWith', 'Categoria criada com sucesso!');
    cy.contains('td', 'Automacao').should('be.visible');
  });
  });

  // ----------------------------------------------------------------
  context('Edição, Filtro e Restrições', () => {

  it('permite filtrar e editar uma categoria existente', () => {
    cy.intercept('PUT', '**/api/categorias/2', (req) => {
      expect(req.body).to.deep.equal({
        nome: 'Papelaria Corporativa',
        descricao: 'Materiais de escritorio para uso interno',
      });

      categoriasMock = categoriasMock.map((categoria) =>
        categoria.id === 2
          ? {
              ...categoria,
              nome: 'Papelaria Corporativa',
              descricao: 'Materiais de escritorio para uso interno',
            }
          : categoria,
      );

      req.reply({
        statusCode: 200,
        body: {
          categoria: categoriasMock.find((categoria) => categoria.id === 2),
        },
      });
    }).as('atualizarCategoria');

    abrirPagina('gerente');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('[data-testid="barra-filtro-input-busca"]').type('Papel');
    cy.contains('Papelaria').should('be.visible');
    cy.contains('Ferragens').should('not.exist');

    cy.contains('tr', 'Papelaria').within(() => {
      cy.get('[title="Editar Categoria"]').click();
    });

    cy.get('[data-testid="categorias-input-nome"]').clear().type('Papelaria Corporativa');
    cy.get('[data-testid="categorias-textarea-descricao"]').clear().type('Materiais de escritorio para uso interno');
    cy.contains('button', 'Guardar Categoria').click();

    cy.wait('@atualizarCategoria');
    cy.wait('@listarCategorias');

    cy.get('@windowAlert').should('have.been.calledWith', 'Categoria atualizada com sucesso!');
    cy.contains('td', 'Papelaria Corporativa').should('be.visible');
  });

  it('exibe mensagem amigavel quando o backend bloqueia a exclusao de categoria ativa', () => {
    cy.intercept('DELETE', '**/api/categorias/1', {
      statusCode: 409,
      body: { message: 'Categoria atrelada a produtos ativos' },
    }).as('deletarCategoria');

    abrirPagina('gerente');

    cy.window().then((win) => {
      const confirmStub = cy.stub(win, 'confirm');
      confirmStub.returns(true);
      cy.wrap(confirmStub).as('windowConfirm');
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('tr', 'Ferragens').within(() => {
      cy.get('[title="Excluir Categoria"]').click();
    });

    cy.wait('@deletarCategoria');

    cy.get('@windowConfirm').should('have.been.called');
    cy.get('@windowAlert').should('have.been.calledWith', 'Categoria atrelada a produtos ativos');
  });

  it('permite exclusao em lote para gerente', () => {
    cy.intercept('DELETE', '**/api/categorias/*', (req) => {
      const id = Number(req.url.split('/').pop());
      categoriasMock = categoriasMock.filter((categoria) => categoria.id !== id);
      req.reply({ statusCode: 204, body: {} });
    }).as('deletarCategoria');

    abrirPagina('gerente');

    cy.window().then((win) => {
      const confirmStub = cy.stub(win, 'confirm');
      confirmStub.returns(true);
      cy.wrap(confirmStub).as('windowConfirm');
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('tbody input[type="checkbox"]').eq(0).check({ force: true });
    cy.get('tbody input[type="checkbox"]').eq(1).check({ force: true });

    cy.contains('2 categoria(s) selecionado(s)').should('be.visible');
    cy.contains('button', 'Excluir Selecionados').click();

    cy.wait('@deletarCategoria');
    cy.wait('@deletarCategoria');
    cy.wait('@listarCategorias');

    cy.get('@windowConfirm').should('have.been.called');
    cy.get('@windowAlert').should('have.been.calledWithMatch', /2 categoria/);
    cy.contains('Ferragens').should('not.exist');
    cy.contains('Papelaria').should('not.exist');
  });

  it('permite ao estoquista apenas listar e filtrar categorias', () => {
    abrirPagina('estoquista');

    cy.contains('button', 'Nova Categoria').should('not.exist');
    cy.get('[title="Editar Categoria"]').should('not.exist');
    cy.get('[title="Excluir Categoria"]').should('not.exist');

    cy.get('[data-testid="barra-filtro-input-busca"]').type('Limpeza');
    cy.contains('Material de Limpeza').should('be.visible');
    cy.contains('Ferragens').should('not.exist');
  });
  });
});
