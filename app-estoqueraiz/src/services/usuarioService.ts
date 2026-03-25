import { api } from "./api"

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    cargo: 'gerente' | 'estoquista' | 'financeiro' | null;
    status: 'aprovado' | 'pendente' | 'rejeitado';
    criado_em?: string;
}

export const usuarioService = {
    // Corrigido para /api/usuarios
    listarTodos: async (): Promise<Usuario[]> => {
        const response = await api.get('/api/usuarios');
        return response.data;
    },

    listarPendentes: async (): Promise<Usuario[]> => {
        const response = await api.get('/api/usuarios/pendentes');
        return response.data;
    },

    aprovar: async(id: number, cargo: string) => {
        const response = await api.patch(`/api/usuarios/${id}/aprovar`, { cargo });
        return response.data;
    },

    rejeitar: async (id: number) => {
        const response = await api.patch(`/api/usuarios/${id}/rejeitar`);
        return response.data;
    },

    alterarCargo: async (id: number, cargo: string) => {
        const response = await api.put(`/api/usuarios/${id}/alterar-cargo`, { cargo });
        return response.data;
    },

    deletar: async (id: number) => {
        const response = await api.delete(`/api/usuarios/${id}`);
        return response.data;
    }
};