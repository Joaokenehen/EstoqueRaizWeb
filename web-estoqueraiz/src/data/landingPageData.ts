import {
  ArrowRightLeft,
  BarChart3,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

export const metrics = [
  {
    value: "7",
    label: "unidades no radar",
    detail: "Visão centralizada para operações distribuídas",
  },
  {
    value: "24h",
    label: "acesso web e mobile",
    detail: "Consulta, cadastro e aprovação no mesmo ecossistema",
  },
  {
    value: "ABC",
    label: "leitura gerencial",
    detail: "Curva ABC e estatísticas para tomada de decisão",
  },
  {
    value: "RBAC",
    label: "segurança por cargo",
    detail: "Gerente, estoquista e financeiro com papéis claros",
  },
];

export const features = [
  {
    icon: Package,
    title: "Catálogo com aprovação",
    description:
      "Cadastre produtos, acompanhe pendências e libere preços com fluxo entre operação e financeiro.",
    accent: "Produtos, imagens e status",
  },
  {
    icon: ArrowRightLeft,
    title: "Movimentações com contexto",
    description:
      "Entradas, saídas, ajustes e transferências com validação de estoque e rastreabilidade por unidade.",
    accent: "Histórico operacional confiável",
  },
  {
    icon: MapPin,
    title: "Gestão multiunidade",
    description:
      "Organize filiais, depósitos e localizações sem perder visibilidade de quem opera em cada frente.",
    accent: "Mapa operacional mais claro",
  },
  {
    icon: BarChart3,
    title: "Relatórios que viram ação",
    description:
      "Transforme movimentações em leitura gerencial com curva ABC, alertas e indicadores de estoque.",
    accent: "Visão rápida para decidir",
  },
];

export const workflows = [
  {
    icon: ShieldCheck,
    title: "Controle de acesso sem ruído",
    description:
      "Usuários entram como pendentes, gerentes aprovam e cada cargo acessa apenas o que faz sentido.",
  },
  {
    icon: Users,
    title: "Times trabalhando na mesma linha",
    description:
      "Estoque, financeiro e gestão usam a mesma base, com menos retrabalho e mais previsibilidade.",
  },
  {
    icon: Smartphone,
    title: "Operação contínua fora da mesa",
    description:
      "O app complementa o painel web para consultas, aprovações e lançamentos em campo.",
  },
];

export const benefits = [
  {
    title: "Menos ruptura e excesso",
    description:
      "Os alertas de estoque e as movimentações registradas ajudam a reagir antes do problema virar custo.",
  },
  {
    title: "Leitura rápida do que importa",
    description:
      "O dashboard concentra os números principais para a equipe agir sem navegar por telas demais.",
  },
  {
    title: "Mais clareza no fluxo de aprovação",
    description:
      "Produtos pendentes, contas novas e definição de preços ficam organizados em etapas objetivas.",
  },
  {
    title: "Base pronta para crescer",
    description:
      "API em microserviços, cache, eventos e observabilidade sustentam a evolução do produto.",
  },
];

export const trustSignals = [
  "API gateway, Redis e PostgreSQL integrados",
  "Curva ABC e estatísticas gerais disponíveis",
  "Fluxo web + app alinhado com a mesma API",
  "Permissões por cargo e unidade no mesmo ecossistema",
  "Cadastro, aprovação e movimentação no mesmo circuito",
  "Arquitetura pronta para evolução operacional",
];

export const spotlightItems = [
  {
    title: "Produtos pendentes",
    value: "12",
    tone: "bg-[#F5E7C8] text-raiz-marrom",
  },
  {
    title: "Movimentações da semana",
    value: "184",
    tone: "bg-[#E5F1E1] text-raiz-verde",
  },
  {
    title: "Unidades ativas",
    value: "7",
    tone: "bg-white text-slate-800",
  },
  {
    title: "Acesso por cargo",
    value: "RBAC",
    tone: "bg-white text-slate-800",
  },
];

export const heroHighlights = [
  "Produtos, categorias e unidades no mesmo fluxo",
  "Aprovação financeira e gerencial sem planilha paralela",
  "Painel web e app conectados a uma única API",
];

export const heroLabel = {
  icon: Zap,
  text: "Operação organizada do cadastro ao relatório",
};
