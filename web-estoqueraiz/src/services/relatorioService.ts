import api from "./api";

export interface CurvaABCFiltros {
  data_inicio?: string;
  data_fim?: string;
  unidade_id?: number;
}

export interface ProdutoCurvaABC {
  produto_id: number;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade_vendida: number;
  valor_total: number;
  percentual_participacao: number;
  percentual_acumulado: number;
  classificacao: "A" | "B" | "C"; 
}

export interface ResumoCurvaABC {
  classe: "A" | "B" | "C";
  quantidade_produtos: number;
  valor_total: number;
  percentual_valor: number;
  percentual_produtos: number;
}

export interface EstatisticasCurvaABC {
  total_produtos: number;
  valor_total_geral: number;
  periodo: {
    data_inicio?: string;
    data_fim?: string;
  };
  unidade_id: string | number;
}

export interface ResultadoCurvaABC {
  produtos: ProdutoCurvaABC[];
  resumo: ResumoCurvaABC[];
  estatisticas: EstatisticasCurvaABC; 
}

export interface EstatisticasGeral {
  total_movimentacoes: number;
  total_saidas: number;
  total_entradas: number;
  total_transferencias: number;
  total_ajustes: number;
  total_produtos: number;
  total_produtos_ativos: number;
  total_categorias: number;
  total_usuarios: number;
  total_unidades: number;
  produtos_estoque_baixo: number;
  produtos_vencendo: number;
  valor_total_estoque: number;
}

export interface ResultadoEstatisticas {
  estatisticas_gerais: EstatisticasGeral;
  movimentacoes_por_mes: any[];
}

export const relatorioService = {
  gerarCurvaABC: async (filtros: CurvaABCFiltros): Promise<ResultadoCurvaABC> => {
    const params = new URLSearchParams();
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
    if (filtros.unidade_id) params.append('unidade_id', filtros.unidade_id.toString());
    
    const response = await api.get(`/api/relatorios/curva-abc?${params.toString()}`);
    const dados = response.data as ResultadoCurvaABC;

    // Workaround: Garante que se houver apenas 1 produto, ele seja classificado como 'A'
    if (dados?.produtos?.length === 1 && dados.produtos[0].classificacao !== 'A') {
      dados.produtos[0].classificacao = 'A';
      
      // Sobrescreve o resumo para refletir que 100% pertencem à Classe A
      dados.resumo = [
        {
          classe: 'A',
          quantidade_produtos: 1,
          valor_total: dados.produtos[0].valor_total,
          percentual_valor: 100,
          percentual_produtos: 100
        },
        { classe: 'B', quantidade_produtos: 0, valor_total: 0, percentual_valor: 0, percentual_produtos: 0 },
        { classe: 'C', quantidade_produtos: 0, valor_total: 0, percentual_valor: 0, percentual_produtos: 0 }
      ];
    }

    return dados;
  },

  obterEstatisticasGerais: async (unidade_id?: number): Promise<ResultadoEstatisticas> => {
    const url = unidade_id 
      ? `/api/relatorios/estatisticas?unidade_id=${unidade_id}` 
      : '/api/relatorios/estatisticas';
    const response = await api.get(url);
    return response.data;
  }
};