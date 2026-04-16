export type CargoUsuario = 'gerente' | 'estoquista' | 'financeiro';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo?: CargoUsuario;
  unidade_id?: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

export const usuariosFixtures = {
  lista: (): Usuario[] => [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@estoqueraiz.com',
      cargo: 'gerente',
      unidade_id: 1,
      status: 'aprovado',
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@estoqueraiz.com',
      cargo: 'estoquista',
      unidade_id: 1,
      status: 'aprovado',
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@estoqueraiz.com',
      cargo: 'financeiro',
      unidade_id: 2,
      status: 'pendente',
    },
    {
      id: 4,
      nome: 'Ana Oliveira',
      email: 'ana@estoqueraiz.com',
      status: 'pendente',
    },
  ],

  novoUsuario: (): Omit<Usuario, 'id'> => ({
    nome: 'Carlos Mendes',
    email: 'carlos@estoqueraiz.com',
    status: 'pendente',
  }),

  usuarioParaAprovar: (): Omit<Usuario, 'id'> => ({
    nome: 'Fernando Dias',
    email: 'fernando@estoqueraiz.com',
    status: 'pendente',
  }),

  usuarioComCargo: (cargo: CargoUsuario): Omit<Usuario, 'id'> => ({
    nome: `Usuario ${cargo}`,
    email: `usuario.${cargo}@estoqueraiz.com`,
    cargo,
    unidade_id: 1,
    status: 'aprovado',
  }),

  usuarioRejeitado: (): Omit<Usuario, 'id'> => ({
    nome: 'Lucas Martins',
    email: 'lucas@estoqueraiz.com',
    status: 'rejeitado',
  }),
};
