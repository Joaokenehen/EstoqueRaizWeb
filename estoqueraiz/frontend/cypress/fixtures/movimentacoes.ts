/**
 * Fixtures de Movimentações
 * Dados mock para testes E2E do módulo de movimentações
 */

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';

export interface Movimentacao {
  id: number;
  tipo: TipoMovimentacao;
  produto_id: number;
  quantidade: number;
  documento?: string;
  observacao?: string;
  unidade_origem_id?: number;
  unidade_destino_id?: number;
  usuario_id: number;
  data_movimentacao: string;
}

export const movimentacoesFixtures = {
  lista: (): Movimentacao[] => [
    {
      id: 1,
      tipo: 'ENTRADA',
      produto_id: 1,
      quantidade: 50,
      documento: 'NF-001-2024',
      observacao: 'Compra do fornecedor X',
      unidade_destino_id: 1,
      usuario_id: 10,
      data_movimentacao: new Date().toISOString(),
    },
    {
      id: 2,
      tipo: 'SAIDA',
      produto_id: 2,
      quantidade: 5,
      documento: 'PED-001-2024',
      observacao: 'Venda para cliente',
      unidade_origem_id: 2,
      usuario_id: 10,
      data_movimentacao: new Date().toISOString(),
    },
    {
      id: 3,
      tipo: 'TRANSFERENCIA',
      produto_id: 3,
      quantidade: 20,
      documento: 'TR-001-2024',
      unidade_origem_id: 1,
      unidade_destino_id: 2,
      usuario_id: 10,
      data_movimentacao: new Date().toISOString(),
    },
  ],

  novaMovimentacao: {
    entrada: (): Omit<Movimentacao, 'id' | 'usuario_id' | 'data_movimentacao'> => ({
      tipo: 'ENTRADA',
      produto_id: 1,
      quantidade: 100,
      documento: 'NF-002-2024',
      observacao: 'Reposição de estoque',
      unidade_destino_id: 1,
    }),

    saida: (): Omit<Movimentacao, 'id' | 'usuario_id' | 'data_movimentacao'> => ({
      tipo: 'SAIDA',
      produto_id: 2,
      quantidade: 10,
      documento: 'PED-002-2024',
      observacao: 'Venda para cliente Y',
      unidade_origem_id: 1,
    }),

    transferencia: (): Omit<Movimentacao, 'id' | 'usuario_id' | 'data_movimentacao'> => ({
      tipo: 'TRANSFERENCIA',
      produto_id: 1,
      quantidade: 25,
      observacao: 'Regularização entre filiais',
      unidade_origem_id: 1,
      unidade_destino_id: 2,
    }),

    ajuste: (): Omit<Movimentacao, 'id' | 'usuario_id' | 'data_movimentacao'> => ({
      tipo: 'AJUSTE',
      produto_id: 3,
      quantidade: 5,
      observacao: 'Ajuste de inventário',
      unidade_origem_id: 1,
    }),
  },
};
