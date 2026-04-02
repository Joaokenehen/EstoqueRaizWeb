import { visitarComSessao } from '../support/testHelpers';

describe('Pagina de Relatorios', () => {
  const unidadesMock = [
    {
      id: 1,
      nome: 'Matriz SP',
      descricao: 'Unidade principal',
      rua: 'Rua A',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01001-000',
    },
    {
      id: 2,
      nome: 'Filial Norte',
      descricao: 'Unidade secundaria',
      rua: 'Rua B',
      numero: '200',
      bairro: 'Centro',
      cidade: 'Manaus',
      estado: 'AM',
      cep: '69000-000',
    },
  ];

  const relatorioGeral = {
    produtos: [
      {
        produto_id: 1,
        nome: 'Furadeira Industrial',
        categoria: 'Ferragens',
        unidade: 'Matriz SP',
        quantidade_vendida: 12,
        valor_total: 3600,
        percentual_participacao: 72,
        percentual_acumulado: 72,
        classificacao: 'A' as const,
      },
      {
        produto_id: 2,
        nome: 'Luva Nitrilica',
        categoria: 'Seguranca',
        unidade: 'Filial Norte',
        quantidade_vendida: 8,
        valor_total: 1400,
        percentual_participacao: 28,
        percentual_acumulado: 100,
        classificacao: 'B' as const,
      },
    ],
    resumo: [
      {
        classe: 'A' as const,
        quantidade_produtos: 1,
        valor_total: 3600,
        percentual_valor: 72,
        percentual_produtos: 50,
      },
      {
        classe: 'B' as const,
        quantidade_produtos: 1,
        valor_total: 1400,
        percentual_valor: 28,
        percentual_produtos: 50,
      },
      {
        classe: 'C' as const,
        quantidade_produtos: 0,
        valor_total: 0,
        percentual_valor: 0,
        percentual_produtos: 0,
      },
    ],
    estatisticas: {
      total_produtos: 2,
      valor_total_geral: 5000,
      periodo: {},
      unidade_id: 'todas',
    },
  };

  const relatorioFilial = {
    produtos: [
      {
        produto_id: 2,
        nome: 'Luva Nitrilica',
        categoria: 'Seguranca',
        unidade: 'Filial Norte',
        quantidade_vendida: 8,
        valor_total: 1400,
        percentual_participacao: 100,
        percentual_acumulado: 100,
        classificacao: 'A' as const,
      },
    ],
    resumo: [
      {
        classe: 'A' as const,
        quantidade_produtos: 1,
        valor_total: 1400,
        percentual_valor: 100,
        percentual_produtos: 100,
      },
      {
        classe: 'B' as const,
        quantidade_produtos: 0,
        valor_total: 0,
        percentual_valor: 0,
        percentual_produtos: 0,
      },
      {
        classe: 'C' as const,
        quantidade_produtos: 0,
        valor_total: 0,
        percentual_valor: 0,
        percentual_produtos: 0,
      },
    ],
    estatisticas: {
      total_produtos: 1,
      valor_total_geral: 1400,
      periodo: {
        data_inicio: '2026-01-01',
        data_fim: '2026-03-31',
      },
      unidade_id: 2,
    },
  };

  const interceptarRelatorio = (respostaVazia = false) => {
    cy.intercept('GET', '**/api/unidades', unidadesMock).as('listarUnidades');
    cy.intercept('GET', '**/api/relatorios/curva-abc*', (req) => {
      if (respostaVazia) {
        req.reply({
          statusCode: 200,
          body: {
            produtos: [],
            resumo: [],
            estatisticas: {
              total_produtos: 0,
              valor_total_geral: 0,
              periodo: {},
              unidade_id: 'todas',
            },
          },
        });
        return;
      }

      if (req.query.unidade_id === '2') {
        req.reply({ statusCode: 200, body: relatorioFilial });
        return;
      }

      req.reply({ statusCode: 200, body: relatorioGeral });
    }).as('gerarRelatorio');
  };

  // ----------------------------------------------------------------
  context('Geração e Filtros de Relatório', () => {

  it('gera o relatorio ao carregar e permite refiltrar por periodo e unidade', () => {
    interceptarRelatorio();
    visitarComSessao('/relatorios', {
      cargo: 'gerente',
      nome: 'Gerente Teste',
      email: 'gerente@estoqueraiz.com',
      unidade_id: 1,
    });

    cy.wait('@listarUnidades');
    cy.wait('@gerarRelatorio');

    cy.contains('Classe A').should('be.visible');
    cy.contains('Furadeira Industrial').should('be.visible');
    cy.contains('Luva Nitrilica').should('be.visible');

    cy.get('input[type="date"]').eq(0).type('2026-01-01');
    cy.get('input[type="date"]').eq(1).type('2026-03-31');
    cy.contains('label', 'Unidade').parent().find('select').select('Filial Norte');
    cy.contains('button', 'Gerar').click();

    cy.wait('@gerarRelatorio').then((interception) => {
      expect(interception.request.query).to.deep.equal({
        data_inicio: '2026-01-01',
        data_fim: '2026-03-31',
        unidade_id: '2',
      });
    });

    cy.contains('Luva Nitrilica').should('be.visible');
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

    cy.contains('Nenhuma venda registrada para os filtros aplicados.').should('be.visible');
  });
  });

  // ----------------------------------------------------------------
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
