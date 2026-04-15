import { 
  Package, 
  ArrowRightLeft, 
  Tags, 
  Building2, 
  Users, 
  BarChart3
} from 'lucide-react';

export type CargoPermitido = 'gerente' | 'estoquista' | 'financeiro';

export interface ModuloProps{
  nome: string;
  descricao: string;
  rota: string;
  icon: any;
  corIcone: string;
  corFundo: string;
  cargosPermitidos: CargoPermitido[];
}

export const modulos: ModuloProps[] = [
  
  { 
    nome: 'Produtos', 
    descricao: 'Gerencie o catálogo de itens',
    rota: '/produtos', 
    icon: Package, 
    corIcone: 'text-blue-600', 
    corFundo: 'bg-blue-100',
    cargosPermitidos: ['gerente', 'estoquista', 'financeiro'] 
  },
  { 
    nome: 'Movimentações', 
    descricao: 'Entradas e saídas de estoque',
    rota: '/movimentacoes', 
    icon: ArrowRightLeft, 
    corIcone: 'text-green-600', 
    corFundo: 'bg-green-100',
    cargosPermitidos: ['gerente', 'estoquista'] 
  },
  { 
    nome: 'Categorias', 
    descricao: 'Organize seus produtos',
    rota: '/categorias', 
    icon: Tags, 
    corIcone: 'text-yellow-600', 
    corFundo: 'bg-yellow-100',
    cargosPermitidos: ['gerente', 'estoquista'] 
  },
  { 
    nome: 'Unidades', 
    descricao: 'Lojas e depósitos físicos',
    rota: '/unidades', 
    icon: Building2, 
    corIcone: 'text-purple-600', 
    corFundo: 'bg-purple-100',
    cargosPermitidos: ['gerente'] 
  },
  { 
    nome: 'Usuários', 
    descricao: 'Controle de acesso e equipe',
    rota: '/usuarios', 
    icon: Users, 
    corIcone: 'text-orange-600', 
    corFundo: 'bg-orange-100',
    cargosPermitidos: ['gerente']  
  },
  { 
    nome: 'Relatórios', 
    descricao: 'Métricas e análises do sistema',
    rota: '/relatorios', 
    icon: BarChart3, 
    corIcone: 'text-red-600', 
    corFundo: 'bg-red-100',
    cargosPermitidos: ['gerente', 'financeiro'] 
  },
];