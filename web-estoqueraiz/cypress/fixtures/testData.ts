export const usuariosTesteSession = {
  gerente: {
    cargo: 'gerente',
    nome: 'Gerente Teste',
    email: 'gerente@estoqueraiz.com',
    unidade_id: 1,
  },
  estoquista: {
    cargo: 'estoquista',
    nome: 'Estoquista Teste',
    email: 'estoquista@estoqueraiz.com',
    unidade_id: 1,
  },
  financeiro: {
    cargo: 'financeiro',
    nome: 'Financeiro Teste',
    email: 'financeiro@estoqueraiz.com',
    unidade_id: 1,
  },
};

export const timeouts = {
  API: 5000,
  ESPERA_INTERCEPT: 2000,
  ESPERA_ANIMACAO: 500,
};

export const endpoints = {
  CATEGORIAS: '**/api/categorias',
  UNIDADES: '**/api/unidades',
  PRODUTOS: '**/api/produtos',
  MOVIMENTACOES: '**/api/movimentacoes',
  USUARIOS: '**/api/usuarios',
};
