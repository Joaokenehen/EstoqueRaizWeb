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
    return response.data;
  },

  obterEstatisticasGerais: async (unidade_id?: number): Promise<ResultadoEstatisticas> => {
    const url = unidade_id 
      ? `/api/relatorios/estatisticas?unidade_id=${unidade_id}` 
      : '/api/relatorios/estatisticas';
    const response = await api.get(url);
    return response.data;
  }
};