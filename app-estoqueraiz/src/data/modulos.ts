import { 
  Package, 
  ArrowRightLeft, 
  Tags, 
  Building2, 
  Users, 
  BarChart3 
} from 'lucide-react';

export const modulos = [
  { 
    nome: 'Produtos', 
    descricao: 'Gerencie o catálogo de itens',
    rota: '/produtos', 
    icon: Package, // <-- Passamos apenas a referência do componente
    corIcone: 'text-blue-600', 
    corFundo: 'bg-blue-100' 
  },
  { 
    nome: 'Movimentações', 
    descricao: 'Entradas e saídas de estoque',
    rota: '/movimentacoes', 
    icon: ArrowRightLeft, 
    corIcone: 'text-green-600', 
    corFundo: 'bg-green-100' 
  },
  { 
    nome: 'Categorias', 
    descricao: 'Organize seus produtos',
    rota: '/categorias', 
    icon: Tags, 
    corIcone: 'text-yellow-600', 
    corFundo: 'bg-yellow-100' 
  },
  { 
    nome: 'Unidades', 
    descricao: 'Lojas e depósitos físicos',
    rota: '/unidades', 
    icon: Building2, 
    corIcone: 'text-purple-600', 
    corFundo: 'bg-purple-100' 
  },
  { 
    nome: 'Usuários', 
    descricao: 'Controle de acesso e equipe',
    rota: '/usuarios', 
    icon: Users, 
    corIcone: 'text-orange-600', 
    corFundo: 'bg-orange-100' 
  },
  { 
    nome: 'Relatórios', 
    descricao: 'Métricas e análises do sistema',
    rota: '/relatorios', 
    icon: BarChart3, 
    corIcone: 'text-red-600', 
    corFundo: 'bg-red-100' 
  },
];