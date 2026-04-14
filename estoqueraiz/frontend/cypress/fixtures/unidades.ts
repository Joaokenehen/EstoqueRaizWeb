/**
 * Fixtures de Unidades
 * Dados mock para testes E2E do módulo de unidades
 */

export interface Unidade {
  id: number;
  nome: string;
  descricao?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export const unidadesFixtures = {
  lista: (): Unidade[] => [
    {
      id: 1,
      nome: 'Matriz SP',
      descricao: 'Unidade principal',
      rua: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01001-000',
    },
    {
      id: 2,
      nome: 'Filial Norte',
      descricao: 'Operacao regional',
      rua: 'Avenida Brasil',
      numero: '200',
      bairro: 'Centro',
      cidade: 'Manaus',
      estado: 'AM',
      cep: '69000-000',
    },
    {
      id: 3,
      nome: 'Deposito Sul',
      descricao: 'Apoio logistico',
      rua: 'Rua das Acacias',
      numero: '300',
      bairro: 'Industrial',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80000-000',
    },
  ],

  novaUnidade: (): Omit<Unidade, 'id'> => ({
    nome: 'Filial Sudeste',
    descricao: 'Novo ponto de distribuição',
    rua: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    estado: 'SP',
    cep: '01311-100',
  }),

  unidadeValida: (): Omit<Unidade, 'id'> => ({
    nome: 'Centro de Distribuição',
    descricao: 'Armazém central',
    rua: 'Rodovia BR-101',
    numero: '5000',
    bairro: 'Industrial',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '21941-570',
  }),

  enderecoParaCEP: {
    '01001000': {
      rua: 'Praca da Se',
      bairro: 'Se',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01001-000',
    },
  },
};
