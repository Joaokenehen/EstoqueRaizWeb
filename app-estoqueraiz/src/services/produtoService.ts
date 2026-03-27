import api from './api';

export interface AprovarProdutoDTO {
  preco_custo: number;
  preco_venda: number;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  codigo_barras?: string;
  quantidade_estoque: number;
  quantidade_minima?: number;
  data_validade?: string;
  lote?: string;
  localizacao?: string;
  imagem_url?: string;
  preco_custo?: number;
  preco_venda?: number;
  statusProduto: 'pendente' | 'aprovado' | 'rejeitado';
  ativo: boolean;
  categoria_id: number;
  unidade_id: number;
  usuario_id: number;
  criado_em?: string;    
  atualizado_em?: string; 
}

export const produtoService = {
  listarTodos: async (unidade_id?: number): Promise<Produto[]> => {
    const url = unidade_id ? `/api/produtos?unidade_id=${unidade_id}` : '/api/produtos';
    const response = await api.get(url);
    return response.data;
  },

  listarPendentes: async (): Promise<Produto[]> => {
    const response = await api.get('/api/produtos/pendentes');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Produto> => {
    const response = await api.get(`/api/produtos/${id}`);
    return response.data;
  },

  criar: async (formData: FormData): Promise<Produto> => {
    const response = await api.post('/api/produtos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.produto || response.data; 
  },

  atualizar: async (id: number, formData: FormData): Promise<Produto> => {
    const response = await api.put(`/api/produtos/${id}`, formData, { 
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.produto || response.data; 
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/produtos/${id}`);
  },

  aprovar: async (id: number, precos: AprovarProdutoDTO): Promise<Produto> => {
    const response = await api.patch(`/api/produtos/${id}/aprovar`, precos);
    return response.data.produto || response.data; 
  },

  rejeitar: async (id: number): Promise<Produto> => {
    const response = await api.patch(`/api/produtos/${id}/rejeitar`);
    return response.data.produto || response.data; 
  }
};