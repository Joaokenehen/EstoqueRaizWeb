import { api } from "./api"

export interface CriarUsuarioDTO {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
}

export interface AtualizarUsuarioDTO {
    nome?: string;
    email?: string;
    senha?: string;
    cargo?: 'gerente' | 'estoquista' | 'financeiro';
    unidade_id?: number;
}

export interface RedefinirSenhaDTO {
    email: string;
    codigoRecuperacao: string;
    novaSenha: string;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    cargo: 'gerente' | 'estoquista' | 'financeiro' | null;
    status: 'aprovado' | 'pendente' | 'rejeitado';
    criado_em?: string;
    unidade_id: number | null;
}

export const usuarioService = {

    listarTodos: async (): Promise<Usuario[]> => {
            // Removido os headers problemáticos
            const response = await api.get('/api/usuarios');
            return response.data;
        },

    listarPendentes: async (): Promise<Usuario[]> => {
            // Removido os headers problemáticos
            const response = await api.get('/api/usuarios/pendentes');
            return response.data;
        },

    aprovar: async(id: number, dados: { cargo: string, unidade_id: number }) => {
        const response = await api.patch(`/api/usuarios/${id}/aprovar`, { dados });
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
    },

    cadastrar: async (dados: CriarUsuarioDTO) => {
        const response = await api.post('/api/usuarios', dados);
        return response;
    },

    solicitarRecuperacaoSenha: async (email: string) => {
        const response = await api.post('/api/usuarios/solicitar-recuperacao-senha', { email });
        return response.data
    },

    redefinirSenha: async (dados: RedefinirSenhaDTO) => {
    const response = await api.post('/api/usuarios/redefinir-senha', dados);
    return response.data;
    },

    atualizar: async (id: number, dados: AtualizarUsuarioDTO) => {
        const response = await api.put (`/api/usuarios/${id}`, dados);
        return response.data;
    }
};