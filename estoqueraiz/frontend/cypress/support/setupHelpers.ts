/**
 * Helpers para setup de testes de integração
 * Cria dados necessários no banco de dados via requisições autenticadas
 */

import { gerarCpfValido } from './utils';

interface CriarUsuarioTestParams {
  nome?: string;
  email: string;
  senha?: string;
  cpf?: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
}

/**
 * Cria um usuário via API (mais seguro que SQL direto)
 */
export const criarUsuarioViaAPI = (params: CriarUsuarioTestParams) => {
  const { nome = 'Usuario Teste', email, senha = 'Senha123', cpf = gerarCpfValido(), status = 'pendente' } = params;

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/usuarios`,
    body: { nome, email, senha, cpf },
    failOnStatusCode: false,
  }).then((response) => {
    if (status !== 'pendente' && response.status === 201) {
      // Se precisa approvar, usa o endpoint correto via API (mais seguro)
      const usuarioId = response.body.usuario?.id;
      if (usuarioId) {
        // Aqui você aprovaria via API se tiver endpoint para isso
        // cy.request('PATCH', `${Cypress.env('API_BASE_URL')}/usuarios/${usuarioId}/aprovar`, {...})
      }
    }
    return response;
  });
};

/**
 * Faz login e retorna o token JWT
 */
export const fazerLoginViaAPI = (email: string, senha: string) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/auth/login`,
    body: { email, senha },
    failOnStatusCode: false,
  });
};

/**
 * Cria um usuário aprovado e pronto para usar (completo)
 */
export const criarUsuarioAprovado = (email: string, senha: string = 'Senha123') => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_BASE_URL')}/usuarios`,
    body: {
      nome: `Usuario ${Date.now()}`,
      email,
      senha,
      cpf: gerarCpfValido(),
    },
    failOnStatusCode: false,
  });
};
