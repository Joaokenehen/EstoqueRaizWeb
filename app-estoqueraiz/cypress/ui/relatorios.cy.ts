import { visitarComSessao } from '../support/testHelpers';
import { relatoriosFixtures } from '../fixtures/relatorios'; 

describe('Pagina de Relatorios', () => {

  const interceptarRelatorio = (respostaVazia = false) => {
    cy.intercept('GET', '**/api/unidades', relatoriosFixtures.unidadesMock).as('listarUnidades');
    
    cy.intercept('GET', '**/api/relatorios/curva-abc*', (req) => {
      const url = new URL(req.url);
      const unidadeId = url.searchParams.get('unidade_id');

      req.alias = unidadeId === '2' ? 'gerarRelatorioFiltrado' : 'gerarRelatorio';

      if (respostaVazia) {
        req.reply({ statusCode: 200, body: { produtos: [], resumo: [] } });
        return;
      }

      if (unidadeId === '2') {
        req.reply({ statusCode: 200, body: relatoriosFixtures.relatorioFilial });
        return;
      }

      req.reply({ statusCode: 200, body: relatoriosFixtures.relatorioGeral });
    });

    cy.intercept('GET', '**/api/relatorios/estatisticas*', (req) => {
      const url = new URL(req.url);
      const unidadeId = url.searchParams.get('unidade_id');
      
      req.alias = unidadeId === '2' ? 'obterEstatisticasFiltrado' : 'obterEstatisticas';

      if (respostaVazia) {
        req.reply({ statusCode: 200, body: relatoriosFixtures.estatisticasVaziasMock });
        return;
      }

      req.reply({ statusCode: 200, body: relatoriosFixtures.estatisticasMock });
    });
  };

  context('Geração e Filtros de Relatório', () => {
    it('gera o relatorio ao carregar e exibe painel de BI, permitindo refiltrar', () => {
      interceptarRelatorio();
      visitarComSessao('/relatorios', {
        cargo: 'gerente',
        nome: 'Gerente Teste',
        email: 'gerente@estoqueraiz.com',
        unidade_id: 1,
      });

      cy.wait('@listarUnidades');
      cy.wait('@gerarRelatorio');
      cy.wait('@obterEstatisticas');

      cy.contains('Valor total em estoque').should('be.visible');
      cy.contains('342').should('be.visible'); 
      cy.contains('Tendência mensal de movimentações').scrollIntoView().should('exist');
      cy.contains('Insights para apresentação').scrollIntoView().should('exist');
      
      cy.contains('Classe A').scrollIntoView().should('exist');
      cy.contains('Furadeira Industrial').should('exist');
      cy.contains('Luva Nitrilica').should('exist');

      cy.get('input[type="date"]').eq(0).clear({ force: true }).type('2026-01-01', { force: true }).should('have.value', '2026-01-01');
      cy.get('input[type="date"]').eq(1).clear({ force: true }).type('2026-03-31', { force: true }).should('have.value', '2026-03-31');
      cy.contains('label', 'Unidade').parent().find('select').select('Filial Norte', { force: true }).should('have.value', '2');
      cy.contains('button', 'Gerar Relatório').click({ force: true });

      cy.wait('@gerarRelatorioFiltrado').then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('data_inicio')).to.equal('2026-01-01');
        expect(url.searchParams.get('data_fim')).to.equal('2026-03-31');
        expect(url.searchParams.get('unidade_id')).to.equal('2');
      });

      cy.wait('@obterEstatisticasFiltrado');

      cy.contains('Luva Nitrilica').should('exist');
      cy.contains('Furadeira Industrial').should('not.exist');
    });

    it('mostra estado vazio quando nao ha vendas para os filtros', () => {
      interceptarRelatorio(true);
      visitarComSessao('/relatorios', {
        cargo: 'financeiro',
        nome: 'Financeiro Teste',
        email: 'financeiro@estoqueraiz.com',
        unidade_id: 2,
      });

      cy.wait('@listarUnidades');
      cy.wait('@gerarRelatorio');
      cy.wait('@obterEstatisticas');

      cy.contains('Sem dados mensais para o período selecionado.').should('exist');
      cy.contains('Nenhuma venda registrada para os filtros aplicados.').should('exist');
    });
  });

  context('Controle de Acesso', () => {
    it('bloqueia acesso direto para estoquista', () => {
      visitarComSessao('/relatorios', {
        cargo: 'estoquista',
        nome: 'Estoquista Teste',
        email: 'estoquista@estoqueraiz.com',
        unidade_id: 1,
      });

      cy.url().should('include', '/dashboard');
    });
  });
});