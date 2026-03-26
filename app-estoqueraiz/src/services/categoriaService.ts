import api from './api';

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export type CriarCategoriaDTO = Omit<Categoria, 'id'>;

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
    return response.data.categoria; 
  },

  atualizar: async (id: number, dados: Partial<CriarCategoriaDTO>): Promise<Categoria> => {
    const response = await api.put(`/api/categorias/${id}`, dados);
    return response.data.categoria; 
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/categorias/${id}`);
  }
};