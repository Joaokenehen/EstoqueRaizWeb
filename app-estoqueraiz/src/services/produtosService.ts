import api from './api';

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
  statusProduto: 'pendente' | 'aprovado' | 'rejeitado'; // Nome exato vindo do seu back-end
  ativo: boolean;
  categoria_id: number;
  unidade_id: number;
  usuario_id: number;
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

  // FormData é necessário por causa do upload de imagem (Multer)
  criar: async (formData: FormData): Promise<Produto> => {
    const response = await api.post('/api/produtos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.produto;
  },

  atualizar: async (id: number, formData: FormData): Promise<Produto> => {
    const response = await api.post(`/api/produtos/${id}`, formData, { // O Multer prefere POST para arquivos em alguns casos, ou PUT se configurado
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.produto;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/produtos/${id}`);
  },

  aprovar: async (id: number, precos: { preco_custo: number, preco_venda: number }): Promise<Produto> => {
    const response = await api.patch(`/api/produtos/${id}/aprovar`, precos);
    return response.data.produto;
  },

  rejeitar: async (id: number): Promise<Produto> => {
    const response = await api.patch(`/api/produtos/${id}/rejeitar`);
    return response.data.produto;
  }
};