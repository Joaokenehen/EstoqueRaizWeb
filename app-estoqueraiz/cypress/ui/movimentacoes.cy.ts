import { visitarComSessao } from '../support/testHelpers';
import { movimentacoesFixtures, type Movimentacao } from '../fixtures/movimentacoes';
import { unidadesFixtures } from '../fixtures/unidades';
import { produtosFixtures, type Produto } from '../fixtures/produtos';

/**
 * Classificacao desta spec:
 * - UI/integracao com backend mockado via intercept.
 * - Autenticacao simulada com localStorage; nao e E2E real.
 */

describe('Modulo de Movimentacoes - UI com API mockada e sessao simulada', () => {
  let movimentacoesMock: Movimentacao[];
  let produtosMock: Produto[];

  const criarProdutosMock = (): Produto[] =>
    produtosFixtures.lista().map((produto) =>
      produto.id === 1
        ? { ...produto, statusProduto: 'aprovado' }
        : produto
    );

  const resetarMocks = () => {
    produtosMock = criarProdutosMock();
    movimentacoesMock = movimentacoesFixtures.lista();

    cy.intercept('GET', '**/api/movimentacoes*', (req) => {
      req.reply([...movimentacoesMock]);
    }).as('listarMovimentacoes');

    cy.intercept('GET', '**/api/produtos', (req) => {
      req.reply([...produtosMock]);
    }).as('listarProdutos');

    cy.intercept('GET', '**/api/unidades', unidadesFixtures.lista()).as('listarUnidades');
  };

  const abrirPagina = (cargo: 'gerente' | 'estoquista', unidade_id: number) => {
    resetarMocks();
    visitarComSessao('/movimentacoes', {
      cargo,
      nome: `${cargo} teste`,
      email: `${cargo}@estoqueraiz.com`,
      unidade_id,
    });
    cy.wait('@listarMovimentacoes');
    cy.wait('@listarProdutos');
    cy.wait('@listarUnidades');
  };

  const selectPorLabel = (label: string) =>
    cy.contains('label', label).parent().find('select');

  context('[Mockado: cy.intercept] Validação de Formulário e Restrições', () => {

    it('bloqueia o seletor de produto ate a escolha da unidade e mostra apenas itens aprovados da unidade', () => {
      abrirPagina('gerente', 1);

      cy.contains('button', 'Registrar Movimento').click();

      selectPorLabel('Produto (Aprovados) *').should('be.disabled');
      selectPorLabel('Unidade de Destino *').select('Filial Norte');

      selectPorLabel('Produto (Aprovados) *').should('not.be.disabled');
      selectPorLabel('Produto (Aprovados) *')
        .find('option')
        .then(($options) => {
          const textos = [...$options].map((option) => option.textContent || '').join(' ');

          expect(textos).to.contain('Furadeira Industrial');
          expect(textos).not.to.contain('Parafuso 10mm');
          expect(textos).not.to.contain('Luva Nitrilica');
        });
    });

    it('restringe o estoquista a operar somente na propria unidade e mostra erro amigavel para estoque insuficiente', () => {
      cy.intercept('POST', '**/api/movimentacoes', (req) => {
        expect(req.body).to.include({
          tipo: 'SAIDA',
          produto_id: 1,
          quantidade: 999,
          unidade_origem_id: 1,
        });
        expect(req.body).not.to.have.property('documento');
        expect(req.body).not.to.have.property('observacao');
        expect(req.body).not.to.have.property('unidade_destino_id');

        req.reply({
          statusCode: 400,
          body: { message: 'Estoque insuficiente' },
        });
      }).as('registrarMovimentacao');

      abrirPagina('estoquista', 1);

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.contains('button', 'Registrar Movimento').click();
      cy.contains('label', 'SAIDA').click();

      selectPorLabel('Unidade de Origem *')
        .find('option')
        .then(($options) => {
          const textos = [...$options].map((option) => option.textContent || '').join(' ');

          expect(textos).to.contain('Matriz SP');
          expect(textos).not.to.contain('Filial Norte');
        });

      selectPorLabel('Unidade de Origem *').select('Matriz SP');

      selectPorLabel('Produto (Aprovados) *')
        .find('option')
        .then(($options) => {
          const textos = [...$options].map((option) => option.textContent || '').join(' ');

          expect(textos).to.contain('Parafuso 10mm');
          expect(textos).not.to.contain('Furadeira Industrial');
        });

      selectPorLabel('Produto (Aprovados) *').select('1');
      cy.get('[data-testid="movimentacoes-input-quantidade"]').type('999');
      cy.contains('button', 'Confirmar e Gravar Movimento').click();

      cy.wait('@registrarMovimentacao');
      cy.get('@windowAlert').should('have.been.calledWithMatch', /estoque insuficiente/i);
    });
  });

  context('[Mockado: cy.intercept] Registrar Movimentos', () => {

    it('registra uma entrada com sucesso e atualiza o historico', () => {
      cy.intercept('POST', '**/api/movimentacoes', (req) => {
        expect(req.body).to.include({
          tipo: 'ENTRADA',
          produto_id: 2,
          quantidade: 15,
          documento: 'NF-999',
          observacao: 'Reposicao emergencial',
          unidade_destino_id: 2,
        });
        expect(req.body).not.to.have.property('unidade_origem_id');

        const novaMovimentacao = {
          id: 2,
          tipo: 'ENTRADA' as const,
          quantidade: 15,
          data_movimentacao: '2026-04-02T10:30:00.000Z',
          observacao: 'Reposicao emergencial',
          documento: 'NF-999',
          produto_id: 2,
          usuario_id: 10,
          unidade_destino_id: 2,
          Produto: { nome: 'Furadeira Industrial' },
          UnidadeDestino: { nome: 'Filial Norte' },
        };

        movimentacoesMock = [novaMovimentacao, ...movimentacoesMock];
        req.reply({ statusCode: 201, body: { movimentacao: novaMovimentacao } });
      }).as('registrarMovimentacao');

      abrirPagina('gerente', 1);

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.contains('button', 'Registrar Movimento').click();
      selectPorLabel('Unidade de Destino *').select('Filial Norte');
      selectPorLabel('Produto (Aprovados) *').select('2');
      cy.get('[data-testid="movimentacoes-input-quantidade"]').type('15');
      cy.get('[data-testid="movimentacoes-input-documento"]').type('NF-999');
      cy.get('[data-testid="movimentacoes-input-observacao"]').type('Reposicao emergencial');
      cy.contains('button', 'Confirmar e Gravar Movimento').click();

      cy.wait('@registrarMovimentacao');
      cy.wait('@listarMovimentacoes');

      cy.get('@windowAlert').should('have.been.calledWithMatch', /ENTRADA registrada com sucesso/i);
      cy.contains('NF-999').should('be.visible');
      cy.contains('Furadeira Industrial').should('be.visible');
    });

    it('envia a transferencia invalida para validacao do backend e exibe erro amigavel', () => {
      cy.intercept('POST', '**/api/movimentacoes', (req) => {
        expect(req.body).to.include({
          tipo: 'TRANSFERENCIA',
          produto_id: 1,
          quantidade: 5,
          unidade_origem_id: 1,
          unidade_destino_id: 1,
        });
        expect(req.body).not.to.have.property('documento');
        expect(req.body).not.to.have.property('observacao');

        req.reply({
          statusCode: 400,
          body: { message: 'A unidade de origem deve ser diferente da de destino' },
        });
      }).as('registrarMovimentacao');

      abrirPagina('gerente', 1);

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      cy.contains('button', 'Registrar Movimento').click();
      cy.contains('label', 'TRANSFERENCIA').click();
      selectPorLabel('Unidade de Origem *').select('Matriz SP');
      selectPorLabel('Unidade de Destino *').select('Matriz SP');
      selectPorLabel('Produto (Aprovados) *').select('1');
      cy.get('[data-testid="movimentacoes-input-quantidade"]').type('5');
      cy.contains('button', 'Confirmar e Gravar Movimento').click();

      cy.wait('@registrarMovimentacao');
      cy.get('@windowAlert').should('have.been.calledWithMatch', /origem.*diferente.*destino/i);
    });
  });
});