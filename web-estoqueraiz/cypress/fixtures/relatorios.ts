// cypress/fixtures/relatorios.ts

export const relatoriosFixtures = {
  unidadesMock: [
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
  ],

  estatisticasMock: {
    estatisticas_gerais: {
      valor_total_estoque: 150000.50,
      total_movimentacoes: 342,
      produtos_estoque_baixo: 5,
      produtos_vencendo: 2,
      total_entradas: 200,
      total_saidas: 142
    },
    movimentacoes_por_mes: [
      { mes: '2026-01-01T00:00:00.000Z', total: 100, tipo: 'ENTRADA' },
      { mes: '2026-01-01T00:00:00.000Z', total: 50, tipo: 'SAIDA' },
      { mes: '2026-02-01T00:00:00.000Z', total: 120, tipo: 'ENTRADA' }
    ]
  },

  estatisticasVaziasMock: {
    estatisticas_gerais: {
      valor_total_estoque: 0,
      total_movimentacoes: 0,
      produtos_estoque_baixo: 0,
      produtos_vencendo: 0,
      total_entradas: 0,
      total_saidas: 0
    },
    movimentacoes_por_mes: []
  },

  relatorioGeral: {
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
    ]
  },

  relatorioFilial: {
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
    ]
  }
};