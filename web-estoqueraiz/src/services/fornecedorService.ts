import api from './api';

export interface Fornecedor {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export const fornecedorService = {
  listarTodos: async (): Promise<Fornecedor[]> => {
    const response = await api.get('/api/fornecedores');
    return response.data;
  },
  criar: async (dados: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.post('/api/fornecedores', dados);
    return response.data;
  },
  atualizar: async (id: number, dados: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.put(`/api/fornecedores/${id}`, dados);
    return response.data;
  },
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/fornecedores/${id}`);
  }
};