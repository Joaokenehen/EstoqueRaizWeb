import api from './api';

export interface CriarCategoriaDTO {
  nome: string;
  descricao?: string;
}

export interface AtualizarCategoriaDTO {
  nome?: string;
  descricao?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export const categoriaService = {
  listarTodas: async (): Promise<Categoria[]> => {
    const response = await api.get('/api/categorias');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Categoria> => {
    const response = await api.get(`/api/categorias/${id}`);
    return response.data;
  },

  criar: async (dados: CriarCategoriaDTO): Promise<Categoria> => {
    const response = await api.post('/api/categorias', dados);
    return response.data.categoria || response.data;  
  },

  atualizar: async (id: number, dados: AtualizarCategoriaDTO): Promise<Categoria> => {
    const response = await api.put(`/api/categorias/${id}`, dados);
    return response.data.categoria || response.data; 
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/categorias/${id}`);
  }
};