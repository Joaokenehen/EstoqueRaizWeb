import { visitarComSessao } from '../support/testHelpers';
import { unidadesFixtures, type Unidade } from '../fixtures/unidades';
import { usuariosTesteSession } from '../fixtures/testData';

describe('Modulo de Unidades', () => {
  let unidadesMock: Unidade[];

  const resetarMocks = () => {
    unidadesMock = unidadesFixtures.lista();

    cy.intercept('GET', '**/api/unidades', (req) => {
      req.reply([...unidadesMock]);
    }).as('listarUnidades');
  };

  const abrirPagina = (cargo: 'gerente' | 'estoquista' = 'gerente') => {
    resetarMocks();
    visitarComSessao('/unidades', {
      cargo,
      nome: `${cargo} teste`,
      email: `${cargo}@estoqueraiz.com`,
      unidade_id: 1,
    });

    if (cargo === 'gerente') {
      cy.wait('@listarUnidades');
    }
  };

  context('Criação de Unidades', () => {

  it('permite ao gerente criar unidade com preenchimento automatico via CEP', () => {
    const cepTeste = '01001000';
    const enderecoCEP = unidadesFixtures.enderecoParaCEP['01001000'];

    cy.intercept('GET', '**/api/unidades/cep/01001000', {
      statusCode: 200,
      body: enderecoCEP,
    }).as('buscarCep');

    cy.intercept('POST', '**/api/unidades', (req) => {
      expect(req.body).to.deep.equal({
        nome: 'Filial Centro',
        descricao: 'Nova unidade comercial',
        cep: cepTeste,
        rua: enderecoCEP.rua,
        numero: '45',
        bairro: enderecoCEP.bairro,
        cidade: enderecoCEP.cidade,
        estado: enderecoCEP.estado,
      });

      const novaUnidade = {
        id: 4,
        nome: 'Filial Centro',
        descricao: 'Nova unidade comercial',
        cep: cepTeste,
        rua: enderecoCEP.rua,
        numero: '45',
        bairro: enderecoCEP.bairro,
        cidade: enderecoCEP.cidade,
        estado: enderecoCEP.estado,
      };

      unidadesMock = [...unidadesMock, novaUnidade];
      req.reply({ statusCode: 201, body: { unidade: novaUnidade } });
    }).as('criarUnidade');

    abrirPagina('gerente');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('button', 'Nova Unidade').click();
    cy.get('[data-testid="unidades-input-nome"]').type('Filial Centro');
    cy.get('[data-testid="unidades-input-descricao"]').type('Nova unidade comercial');
    cy.get('[data-testid="unidades-input-cep"]').type(cepTeste);

    cy.wait('@buscarCep');

    cy.get('[data-testid="unidades-input-rua"]').should('have.value', enderecoCEP.rua);
    cy.get('[data-testid="unidades-input-bairro"]').should('have.value', enderecoCEP.bairro);
    cy.get('[data-testid="unidades-input-cidade"]').should('have.value', enderecoCEP.cidade);
    cy.get('[data-testid="unidades-input-estado"]').should('have.value', enderecoCEP.estado);

    cy.get('[data-testid="unidades-input-numero"]').type('45');
    cy.contains('button', 'Guardar Unidade').click();

    cy.wait('@criarUnidade');
    cy.wait('@listarUnidades');

    cy.get('@windowAlert').should('have.been.calledWith', 'Unidade criada com sucesso!');
    cy.contains('Filial Centro').should('be.visible');
  });
  });

  context('Exclusão e Restrições', () => {

  it('exibe mensagem amigavel ao bloquear exclusao de unidade com produtos', () => {
    cy.intercept('DELETE', '**/api/unidades/1', {
      statusCode: 409,
      body: { message: 'Unidade atrelada a produtos com estoque' },
    }).as('deletarUnidade');

    abrirPagina('gerente');

    cy.window().then((win) => {
      const confirmStub = cy.stub(win, 'confirm');
      confirmStub.returns(true);
      cy.wrap(confirmStub).as('windowConfirm');
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.contains('tr', 'Matriz SP').within(() => {
      cy.get('[title="Excluir Unidade"]').click();
    });

    cy.wait('@deletarUnidade');

    cy.get('@windowConfirm').should('have.been.called');
    cy.get('@windowAlert').should('have.been.calledWith', 'Unidade atrelada a produtos com estoque');
  });

  it('permite exclusao em lote de unidades para gerente', () => {
    cy.intercept('DELETE', '**/api/unidades/*', (req) => {
      const id = Number(req.url.split('/').pop());
      unidadesMock = unidadesMock.filter((unidade) => unidade.id !== id);
      req.reply({ statusCode: 204, body: {} });
    }).as('deletarUnidade');

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
    cy.get('[data-testid="barra-acoes-lote-texto"]').should('contain', 'unidade(s) selecionado(s)');
    cy.get('[data-testid="barra-acoes-lote-excluir"]').click();

    cy.wait('@deletarUnidade');
    cy.wait('@deletarUnidade');
    cy.wait('@listarUnidades');

    cy.get('@windowConfirm').should('have.been.called');
    cy.get('@windowAlert').should('have.been.calledWithMatch', /2 unidade/);
    cy.contains('Matriz SP').should('not.exist');
    cy.contains('Filial Norte').should('not.exist');
  });

  it('bloqueia acesso direto para estoquista', () => {
    abrirPagina('estoquista');

    cy.url().should('include', '/dashboard');
  });
  });
});
