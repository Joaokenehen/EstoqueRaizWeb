import api from './api';

export interface Unidade {
  id: number;
  nome: string;
  descricao?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export type CriarUnidadeDTO = Omit<Unidade, 'id'>;

export const unidadeService = {
  listarTodas: async (): Promise<Unidade[]> => {
    const response = await api.get('/api/unidades'); 
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Unidade> => {
    const response = await api.get(`/api/unidades/${id}`);
    return response.data;
  },

  criar: async (dados: CriarUnidadeDTO): Promise<Unidade> => {
    const response = await api.post('/api/unidades', dados);
    return response.data.unidade;
  },

  atualizar: async (id: number, dados: Partial<CriarUnidadeDTO>): Promise<Unidade> => {
    const response = await api.put(`/api/unidades/${id}`, dados);
    return response.data.unidade;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/unidades/${id}`);
  },

  buscarCep: async (cep: string): Promise<{ rua: string, bairro: string, cidade: string, estado: string, cep: string }> => {
    const response = await api.get(`/api/unidades/cep/${cep}`);
    return response.data;
  }
};