type CargoUsuario = 'gerente' | 'estoquista' | 'financeiro' | null;

export interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
  cargo: CargoUsuario;
  unidade_id: number | null;
  status: 'aprovado' | 'pendente' | 'rejeitado';
}

export const criarUsuarioSessao = (
  overrides: Partial<UsuarioSessao> = {},
): UsuarioSessao => ({
  id: 1,
  nome: 'Usuario Teste',
  email: 'usuario@estoqueraiz.com',
  cargo: 'gerente',
  unidade_id: 1,
  status: 'aprovado',
  ...overrides,
});

export const visitarComSessao = (
  rota: string,
  overrides: Partial<UsuarioSessao> = {},
) => {
  cy.visitAuthenticated(rota, criarUsuarioSessao(overrides));
};
