import api from "./api"

export interface Movimentacao {
    id: number;
    tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
    status: "pendente" | "aprovado" | "rejeitado";
    valor_custo?: number;
    valor_venda?: number;
    quantidade: number;
    data_movimentacao: Date;
    observacao?: string;
    documento?: string;
    produto_id: number;
    usuario_id: number;
    unidade_origem_id?: number;
    unidade_destino_id?: number;
    produto?: { nome: string; fornecedor_id?: number };
    usuario?: { nome: string };
    unidade_origem?: { nome: string };
    unidade_destino?: { nome: string };
}

export interface CriarMovimentacaoDTO {
    tipo: 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';
    quantidade: number;
    status?: "pendente" | "aprovado" | "rejeitado";
    valor_custo?: number;
    valor_venda?: number;
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
    status?: "pendente" | "aprovado" | "rejeitado";
}

export interface AprovarMovimentacaoDTO {
    valor_custo: number;
    valor_venda: number;
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
    },

    aprovar: async (id: number, dados: AprovarMovimentacaoDTO): Promise<Movimentacao> => {
        const response = await api.patch(`/api/movimentacoes/${id}/aprovar`, dados);
        return response.data.movimentacao || response.data;
    },

    rejeitar: async (id: number): Promise<Movimentacao> => {
        const response = await api.patch(`/api/movimentacoes/${id}/rejeitar`);
        return response.data.movimentacao || response.data;
    }
};