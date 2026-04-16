import api from "./api"

export interface Movimentacao {
    id: number;
    tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
    quantidade: number;
    data_movimentacao: Date;
    observacao?: string;
    documento?: string;
    produto_id: number;
    usuario_id: number;
    unidade_origem_id?: number;
    unidade_destino_id?: number;
    Produto?: { nome: string };
    Usuario?: { nomer: string };
    UnidadeOrigem?: { nome: string };
    UnidadeDestino?: { nome: string };
}

export interface CriarMovimentacaoDTO {
    tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';
    quantidade: number;
    observacao?: string;
    documento?: string;
    produto_id: number;
    usuario_id?: number;
    unidade_origem_id?: number;
    unidade_destino_id?: number;
}

export interface FiltroMovimentacoesDTO {
    produto_id?: number;
    unidade_id?: number;
    tipo?: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';
    data_inicio?: string;
    data_fim?: string;
}

export const movimentacaoService = {
    listarTodas: async (filtros?: FiltroMovimentacoesDTO): Promise<Movimentacao[]> => {
        const response = await api.get('/api/movimentacoes', { params: filtros});
        return response.data;
    },

    buscarPorId: async (id: number): Promise<Movimentacao> => {
        const response = await api.get(`/api/movimentacoes/${id}`);
        return response.data;
    },

    registrarMovimentacao: async (dados: CriarMovimentacaoDTO): Promise<Movimentacao> => {
        const response = await api.post('/api/movimentacoes', dados);
        return response.data.movimentacao || response.data;
    }
};