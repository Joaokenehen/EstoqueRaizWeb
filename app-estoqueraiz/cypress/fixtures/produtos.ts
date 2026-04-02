/**
 * Fixtures de Produtos
 * Dados mock para testes E2E do módulo de produtos
 */

export interface Produto {
  id: number;
  nome: string;
  codigo_barras?: string;
  quantidade_estoque: number;
  quantidade_minima?: number;
  preco_venda?: number;
  statusProduto: 'pendente' | 'aprovado' | 'rejeitado';
  ativo: boolean;
  categoria_id: number;
  unidade_id: number;
  usuario_id: number;
}

export const produtosFixtures = {
  lista: (): Produto[] => [
    {
      id: 1,
      nome: 'Parafuso 10mm',
      codigo_barras: '789100000001',
      quantidade_estoque: 80,
      quantidade_minima: 10,
      statusProduto: 'pendente',
      ativo: true,
      categoria_id: 1,
      unidade_id: 1,
      usuario_id: 10,
    },
    {
      id: 2,
      nome: 'Furadeira Industrial',
      codigo_barras: '789100000002',
      quantidade_estoque: 8,
      quantidade_minima: 2,
      preco_venda: 499.9,
      statusProduto: 'aprovado',
      ativo: true,
      categoria_id: 1,
      unidade_id: 2,
      usuario_id: 10,
    },
    {
      id: 3,
      nome: 'Luva Nitrilica',
      codigo_barras: '789100000003',
      quantidade_estoque: 30,
      quantidade_minima: 5,
      statusProduto: 'pendente',
      ativo: true,
      categoria_id: 2,
      unidade_id: 2,
      usuario_id: 10,
    },
  ],

  novoProduto: (): Omit<Produto, 'id' | 'usuario_id'> => ({
    nome: 'Chave de Fenda Phillips',
    codigo_barras: '789100000004',
    quantidade_estoque: 50,
    quantidade_minima: 10,
    preco_venda: 25.5,
    statusProduto: 'pendente',
    ativo: true,
    categoria_id: 1,
    unidade_id: 1,
  }),

  produtoValido: (): Omit<Produto, 'id' | 'usuario_id'> => ({
    nome: 'Martelo 500g',
    codigo_barras: '789100000005',
    quantidade_estoque: 40,
    quantidade_minima: 8,
    preco_venda: 45.0,
    statusProduto: 'pendente',
    ativo: true,
    categoria_id: 1,
    unidade_id: 1,
  }),

  produtoSemCodigoBarras: (): Omit<Produto, 'id' | 'usuario_id' | 'codigo_barras'> => ({
    nome: 'Fita Isolante',
    quantidade_estoque: 100,
    quantidade_minima: 20,
    statusProduto: 'pendente',
    ativo: true,
    categoria_id: 1,
    unidade_id: 1,
  }),

  getProdutoComId: (id: number, nome: string, categoriaId: number): Produto => ({
    id,
    nome,
    quantidade_estoque: 50,
    statusProduto: 'aprovado',
    ativo: true,
    categoria_id: categoriaId,
    unidade_id: 1,
    usuario_id: 10,
  }),
};
