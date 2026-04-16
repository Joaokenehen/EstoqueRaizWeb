import api from './api';

export interface LoginDTO {
    email: string;
    senha: string;
}

export interface LoginResponseDTO {
    token: string;
    usuario: {
        id: number;
        nome: string;
        email: string;
        cargo: string;
        unidade_id: string;
        status: string;
    };
}

export const authService = {
    login: async (dados: LoginDTO): Promise<LoginResponseDTO> => {
        const response = await api.post('/api/auth/login', dados);
        return response.data;
    },

    logOut: () => {
        localStorage.removeItem('@EstoqueRaiz:token');
        localStorage.removeItem('@EstoqueRaiz:usuario');    
    },
};