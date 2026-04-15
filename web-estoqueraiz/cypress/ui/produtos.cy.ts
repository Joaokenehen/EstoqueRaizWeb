import { visitarComSessao } from '../support/testHelpers';
import { produtosFixtures, type Produto } from '../fixtures/produtos';
import { unidadesFixtures } from '../fixtures/unidades';

describe('Modulo de Produtos', () => {
  let produtosMock: Produto[];
  const categoriasMock = [
    { id: 1, nome: 'Ferragens' },
    { id: 2, nome: 'Seguranca' },
  ];

  const resetarMocks = () => {
    produtosMock = produtosFixtures.lista();

    cy.intercept('GET', '**/api/produtos', (req) => {
      req.reply([...produtosMock]);
    }).as('listarProdutos');

    cy.intercept('GET', '**/api/categorias', categoriasMock).as('listarCategorias');
    cy.intercept('GET', '**/api/unidades', unidadesFixtures.lista()).as('listarUnidades');
  };

  const abrirPagina = (cargo: 'gerente' | 'estoquista' | 'financeiro') => {
    resetarMocks();
    visitarComSessao('/produtos', {
      cargo,
      nome: `${cargo} teste`,
      email: `${cargo}@estoqueraiz.com`,
      unidade_id: cargo === 'estoquista' ? 1 : 2,
    });
    cy.wait('@listarProdutos');
    cy.wait('@listarCategorias');
    cy.wait('@listarUnidades');
  };

  context('Criação de Produtos', () => {

    it('permite ao financeiro aprovar um item pendente e mantem o filtro inicial em pendentes', () => {
      cy.intercept('PATCH', '**/api/produtos/1/aprovar', (req) => {
        expect(req.body).to.deep.equal({
          preco_custo: 25.5,
          preco_venda: 39.9,
        });

        // Atualiza o mock simulando o banco de dados
        produtosMock = produtosMock.map((produto) =>
          produto.id === 1
            ? {
                ...produto,
                statusProduto: 'aprovado',
                preco_venda: 39.9,
              }
            : produto,
        );

        req.reply({
          statusCode: 200,
          body: {
            produto: produtosMock.find((produto) => produto.id === 1),
          },
        });
      }).as('aprovarProduto');

      abrirPagina('financeiro');

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.contains('button', 'Novo Produto').should('not.exist');
      cy.contains('Parafuso 10mm').should('be.visible');
      cy.contains('Luva Nitrilica').should('be.visible');
      cy.contains('Furadeira Industrial').should('not.exist');

      cy.contains('tr', 'Parafuso 10mm').within(() => {
        cy.get('[title="Aprovar e Precificar"]').click();
      });

      cy.contains('Aprovar Item').should('be.visible');
      
      cy.get('input[placeholder="0.00"]').eq(0).type('25.50');
      cy.get('input[placeholder="0.00"]').eq(1).type('39.90');
      cy.contains('button', 'Finalizar e Aprovar').click();

      cy.wait('@aprovarProduto');
      cy.wait('@listarProdutos');

      cy.get('@windowAlert').should('have.been.calledWith', 'Produto Aprovado!');
      
      cy.contains('Parafuso 10mm').should('not.exist');
    });

    it('restringe a lista de unidades para o estoquista ao criar um novo produto', () => {

      abrirPagina('estoquista');

      cy.contains('button', 'Novo Produto').click();
      cy.contains('Novo Produto').should('be.visible');
      cy.get('[data-testid="produtos-select-unidade"]')
        .find('option')
        .should('have.length', 2);
      cy.get('[data-testid="produtos-select-unidade"]').should('not.be.disabled');
    });
  });

  context('Aprovação e Precificação', () => {

  it('permite ao financeiro aprovar um item pendente e mantem o filtro inicial em pendentes', () => {
    cy.intercept('PATCH', '**/api/produtos/1/aprovar', (req) => {
      expect(req.body).to.deep.equal({
        preco_custo: 25.5,
        preco_venda: 39.9,
      });

      produtosMock = produtosMock.map((produto) =>
        produto.id === 1
          ? {
              ...produto,
              statusProduto: 'aprovado',
              preco_venda: 39.9,
            }
          : produto,
      );

      req.reply({
        statusCode: 200,
        body: {
          produto: produtosMock.find((produto) => produto.id === 1),
        },
      });
    }).as('aprovarProduto');

    abrirPagina('financeiro');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('button', 'Novo Produto').should('not.exist');
    cy.contains('Parafuso 10mm').should('be.visible');
    cy.contains('Luva Nitrilica').should('be.visible');
    cy.contains('Furadeira Industrial').should('not.exist');

    cy.contains('tr', 'Parafuso 10mm').within(() => {
      cy.get('[title="Aprovar e Precificar"]').click();
    });

    cy.contains('Aprovar Item').should('be.visible');
    cy.get('input[placeholder="0.00"]').eq(0).type('25.50');
    cy.get('input[placeholder="0.00"]').eq(1).type('39.90');
    cy.contains('button', 'Finalizar e Aprovar').click();

    cy.wait('@aprovarProduto');
    cy.wait('@listarProdutos');

    cy.get('@windowAlert').should('have.been.calledWith', 'Produto Aprovado!');
    cy.contains('Parafuso 10mm').should('not.exist');
  });
  });

  context('Exclusão em Lote e Permissões', () => {

  it('permite exclusao em lote para gerente', () => {
    cy.intercept('DELETE', '**/api/produtos/*', (req) => {
      const id = Number(req.url.split('/').pop());
      produtosMock = produtosMock.filter((produto) => produto.id !== id);
      req.reply({ statusCode: 204, body: {} });
    }).as('deletarProduto');

    abrirPagina('gerente');

    cy.window().then((win) => {
      const confirmStub = cy.stub(win, 'confirm');
      confirmStub.returns(true);
      cy.wrap(confirmStub).as('windowConfirm');
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('tbody input[type="checkbox"]').eq(0).check({ force: true });
    cy.get('tbody input[type="checkbox"]').eq(1).check({ force: true });

    cy.get('[data-testid="barra-acoes-lote"]').should('be.visible');
    cy.get('[data-testid="barra-acoes-lote-quantidade"]').should('have.text', '2');
    cy.get('[data-testid="barra-acoes-lote-texto"]').should('contain', 'produto(s) selecionado(s)');
    cy.get('[data-testid="barra-acoes-lote-excluir"]').click();

    cy.wait('@deletarProduto');
    cy.wait('@deletarProduto');
    cy.wait('@listarProdutos');

    cy.get('@windowConfirm').should('have.been.called');
    cy.get('@windowAlert').should('have.been.calledWithMatch', /2 produto/);
    cy.contains('Parafuso 10mm').should('not.exist');
    cy.contains('Furadeira Industrial').should('not.exist');
  });

  it('mantem o estoquista sem acoes de aprovacao', () => {
    abrirPagina('estoquista');

    cy.contains('button', 'Novo Produto').should('be.visible');
    cy.get('[title="Aprovar e Precificar"]').should('not.exist');
    cy.get('[title="Rejeitar Produto"]').should('not.exist');
  });
  });
});
