import api from "./api";

export interface RedefinirSenhaDTO {
    email: string;
    codigoRecuperacao: string;
    novaSenha: string;
}

export const usuarioService = {
    solicitarRecuperacaoSenha: async (email: string) => {
        const response = await api.post('/api/usuarios/solicitar-recuperacao-senha', { email });
        return response.data;
    },

    redefinirSenha: async (dados: RedefinirSenhaDTO) => {
        const response = await api.post('/api/usuarios/redefinir-senha', dados);
        return response.data;
    }
};