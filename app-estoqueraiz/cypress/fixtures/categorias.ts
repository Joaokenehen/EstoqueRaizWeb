/**
 * Fixtures de Categorias
 * Dados mock para testes E2E do módulo de categorias
 */

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export const categoriasFixtures = {
  lista: (): Categoria[] => [
    { id: 1, nome: 'Ferragens', descricao: 'Parafusos, porcas e fixadores' },
    { id: 2, nome: 'Papelaria', descricao: 'Itens de escritorio e organizacao' },
    { id: 3, nome: 'Material de Limpeza', descricao: 'Produtos de higiene e limpeza' },
  ],

  novaCategoria: (): Omit<Categoria, 'id'> => ({
    nome: 'Automacao',
    descricao: 'Sensores, controladores e acionamentos',
  }),

  categoriaValida: (): Omit<Categoria, 'id'> => ({
    nome: 'Seguranca',
    descricao: 'Equipamentos e produtos de seguranca para trabalhadores',
  }),

  categoriaSemDescricao: (): Omit<Categoria, 'id'> => ({
    nome: 'Iluminacao',
  }),

  getCategoriaComId: (id: number, nome: string): Categoria => ({
    id,
    nome,
    descricao: `Descrição para ${nome}`,
  }),
};
