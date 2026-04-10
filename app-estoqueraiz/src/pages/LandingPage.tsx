import { useNavigate } from 'react-router-dom';
import { Package, BarChart3, Users, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Gestão de Produtos',
      description: 'Controle completo do seu estoque com categorias e organização inteligente'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Análises avançadas e insights sobre movimentações de estoque'
    },
    {
      icon: Users,
      title: 'Gerenciamento de Usuários',
      description: 'Controle de acesso com diferentes níveis de permissão'
    },
    {
      icon: Zap,
      title: 'Interface Rápida',
      description: 'Performance otimizada para melhor produtividade do seu time'
    }
  ];

  const benefits = [
    'Reduz perda de produtos',
    'Aumenta produtividade',
    'Melhora controle financeiro',
    'Facilita tomada de decisão',
    'Suporta múltiplas unidades',
    'Rastreabilidade completa'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-raiz-bege via-white to-raiz-bege">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b-4 border-raiz-verde">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={logoEstoque} 
              alt="Estoque Raiz" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-raiz-verde">EstoqueRaiz</span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-raiz-verde font-medium hover:text-raiz-marrom transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/cadastro')}
              className="px-6 py-2 bg-raiz-verde text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Cadastro
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-raiz-verde mb-6">
          Controle seu Estoque com
          <span className="text-raiz-marrom"> Inteligência</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          A solução completa para gerenciamento de estoque. Aumente a eficiência, 
          reduza custos e mantenha o controle total das suas operações.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/cadastro')}
            className="px-8 py-3 bg-raiz-verde text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Começar Agora
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 border-2 border-raiz-verde text-raiz-verde font-semibold rounded-lg hover:bg-raiz-bege transition-colors"
          >
            Acessar Conta
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-raiz-verde mb-4 text-center">
          Funcionalidades Principais
        </h2>
        <p className="text-lg text-slate-600 text-center mb-16 max-w-2xl mx-auto">
          Tudo o que você precisa para gerenciar seu estoque de forma eficiente
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-raiz-verde"
              >
                <div className="bg-raiz-bege w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="text-raiz-verde" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-raiz-verde mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-raiz-bege py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-raiz-verde mb-4 text-center">
            Benefícios para seu Negócio
          </h2>
          <p className="text-lg text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            Transforme a forma como você gerencia seu estoque
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border-l-4 border-raiz-verde"
              >
                <CheckCircle2 className="text-raiz-verde flex-shrink-0" size={24} />
                <span className="text-slate-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-raiz-verde mb-8">
          Pronto para começar?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Crie sua conta agora e tenha acesso a todas as funcionalidades
        </p>
        
        <button
          onClick={() => navigate('/cadastro')}
          className="px-10 py-4 bg-raiz-verde text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-lg"
        >
          Criar Conta Grátis
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-raiz-verde text-raiz-bege py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">EstoqueRaiz</h3>
              <p className="text-sm">
                Solução completa para gerenciamento de estoque
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-raiz-marrom pt-8 text-center text-sm">
            <p>&copy; 2026 EstoqueRaiz. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
