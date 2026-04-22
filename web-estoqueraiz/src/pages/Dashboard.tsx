import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Package, Building2, Tags, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { modulos } from '../data/modulos';
import { produtoService } from '../services/produtoService';
import { unidadeService } from '../services/unidadeService';
import { categoriaService } from '../services/categoriaService';

// Componente reutilizável para exibir estatísticas
export const StatCard = ({ titulo, valor, icone: Icone, corFundo, corIcone, carregando }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow duration-200">
    <div className={`p-4 rounded-lg ${corFundo} ${corIcone} mr-5`}>
      <Icone size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{titulo}</p>
      {carregando ? (
        <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <h4 className="text-2xl font-bold text-gray-900">{valor}</h4>
      )}
    </div>
  </div>
);

export function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalUnidades: 0,
    totalCategorias: 0,
    estoqueBaixo: 0
  });
  const [carregandoStats, setCarregandoStats] = useState(true);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }

    const carregarEstatisticas = async () => {
      try {
        const [produtos, unidades, categorias] = await Promise.all([
          produtoService.listarTodos(),
          unidadeService.listarTodas(),
          categoriaService.listarTodas()
        ]);

        const produtosArray = Array.isArray(produtos) ? produtos : [];
        const estoqueBaixo = produtosArray.filter(p => p.quantidade_estoque <= (p.quantidade_minima || 0)).length;

        setStats({
          totalProdutos: produtosArray.length,
          totalUnidades: Array.isArray(unidades) ? unidades.length : 0,
          totalCategorias: Array.isArray(categorias) ? categorias.length : 0,
          estoqueBaixo
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
      } finally {
        setCarregandoStats(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const modulosPermitidos = usuario ? modulos.filter((modulo) => {
    if (!usuario || !usuario.cargo) return false;
    return modulo.cargosPermitidos.includes(usuario.cargo);
  }) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 mt-1">Acompanhe os principais indicadores do seu sistema.</p>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            titulo="Total de Produtos" 
            valor={stats.totalProdutos} 
            icone={Package} 
            corFundo="bg-blue-100" 
            corIcone="text-blue-600" 
            carregando={carregandoStats} 
          />
          <StatCard 
            titulo="Estoque Baixo" 
            valor={stats.estoqueBaixo} 
            icone={AlertTriangle} 
            corFundo="bg-red-100" 
            corIcone="text-red-600" 
            carregando={carregandoStats} 
          />
          <StatCard 
            titulo="Categorias" 
            valor={stats.totalCategorias} 
            icone={Tags} 
            corFundo="bg-yellow-100" 
            corIcone="text-yellow-600" 
            carregando={carregandoStats} 
          />
          <StatCard 
            titulo="Unidades Físicas" 
            valor={stats.totalUnidades} 
            icone={Building2} 
            corFundo="bg-purple-100" 
            corIcone="text-purple-600" 
            carregando={carregandoStats} 
          />
        </div>

        <div className="mb-6 mt-8 border-t border-gray-100 pt-8">
          <h3 className="text-xl font-bold text-gray-800">Acesso Rápido</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">Navegue pelos módulos disponíveis para o seu perfil.</p>
        </div>

        {modulosPermitidos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulosPermitidos.map((modulo) => {
              const IconeDoModulo = modulo.icon;
              return (
                <button
                  key={`card-${modulo.nome}`}
                  onClick={() => navigate(modulo.rota)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-raiz-verde transition-all duration-200 flex items-start text-left group"
                >
                  <div className={`p-4 rounded-lg ${modulo.corFundo} ${modulo.corIcone} mr-5 group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                    <IconeDoModulo size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-raiz-verde transition-colors">
                      {modulo.nome}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">{modulo.descricao}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center animate-in fade-in duration-300">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <Lock size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Você ainda não possui permissões associadas à sua conta para acessar os módulos do sistema. 
              Por favor, entre em contato com um <strong className="text-raiz-marrom">Gerente</strong> para solicitar o acesso.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
