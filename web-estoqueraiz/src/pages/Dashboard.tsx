import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Package, Building2, Tags, AlertTriangle, Clock, ArrowRight, DollarSign, ArrowRightLeft, Users, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import { Modal } from '../components/Modal';
import { modulos } from '../data/modulos';
import { produtoService } from '../services/produtoService';
import { unidadeService } from '../services/unidadeService';
import { categoriaService } from '../services/categoriaService';
import { movimentacaoService } from '../services/movimentacaoService';
import { usuarioService } from '../services/usuarioService';
import { fornecedorService } from '../services/fornecedorService';

export const StatCard = ({ titulo, valor, icone: Icone, corFundo, corIcone, carregando }: any) => (
  <div className="er-surface flex items-center p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div className={`p-4 rounded-lg ${corFundo} ${corIcone} mr-5`}>
      <Icone size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      {carregando ? (
        <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <h4 className="text-2xl font-bold text-slate-950">{valor}</h4>
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
    totalMovimentacoes: 0,
    totalFornecedores: 0
  });
  const [carregandoStats, setCarregandoStats] = useState(true);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<any[]>([]);
  const [produtosVencendo, setProdutosVencendo] = useState<any[]>([]);
  const [produtosPendentes, setProdutosPendentes] = useState<any[]>([]);
  const [usuariosPendentes, setUsuariosPendentes] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [modalNotificacaoAberto, setModalNotificacaoAberto] = useState(false);
  const [tipoNotificacao, setTipoNotificacao] = useState<'estoqueBaixo' | 'vencendo' | 'pendente' | 'usuariosPendentes' | null>(null);

  const isGerente = usuario?.cargo === 'gerente';
  const isFinanceiro = usuario?.cargo === 'financeiro';
  const isEstoquista = usuario?.cargo === 'estoquista';

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }

    const carregarEstatisticas = async () => {
      try {
        const isUsuarioGerente = (usuario || (dadosSalvos ? JSON.parse(dadosSalvos) : null))?.cargo === 'gerente';
        const promessas: any[] = [
          produtoService.listarTodos(),
          unidadeService.listarTodas(),
          categoriaService.listarTodas(),
          movimentacaoService.listarTodas(),
          fornecedorService.listarTodos()
        ];

        if (isUsuarioGerente) {
          promessas.push(usuarioService.listarTodos().catch(() => []));
        }

        const [produtos, unidades, categorias, movimentacoes, fornecedores, usuariosData] = await Promise.all(promessas);

        const produtosArray = Array.isArray(produtos) ? produtos : [];
        
        const hoje = new Date();
        const trintaDias = new Date();
        trintaDias.setDate(hoje.getDate() + 30);

        setProdutosEstoqueBaixo(produtosArray.filter(p => p.quantidade_estoque <= (p.quantidade_minima || 0)));
        setProdutosVencendo(produtosArray.filter(p => p.data_validade && new Date(p.data_validade) <= trintaDias));
        setProdutosPendentes(produtosArray.filter(p => p.statusProduto === 'pendente'));
        if (usuariosData && Array.isArray(usuariosData)) {
          setUsuariosPendentes(usuariosData.filter(u => u.status === 'pendente'));
        }

        setUnidades(Array.isArray(unidades) ? unidades : []);

        setStats({
          totalProdutos: produtosArray.length,
          totalUnidades: Array.isArray(unidades) ? unidades.length : 0,
          totalCategorias: Array.isArray(categorias) ? categorias.length : 0,
          totalMovimentacoes: Array.isArray(movimentacoes) ? movimentacoes.length : 0,
          totalFornecedores: Array.isArray(fornecedores) ? fornecedores.length : 0
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

  const abrirNotificacao = (tipo: 'estoqueBaixo' | 'vencendo' | 'pendente' | 'usuariosPendentes') => {
    setTipoNotificacao(tipo);
    setModalNotificacaoAberto(true);
  };

  const listaExibicao = tipoNotificacao === 'estoqueBaixo' 
    ? produtosEstoqueBaixo 
    : tipoNotificacao === 'vencendo' 
      ? produtosVencendo 
      : tipoNotificacao === 'pendente'
        ? produtosPendentes
        : usuariosPendentes;

  return (
    <Layout>
      <div className="er-page">
        <div className="er-page-header">
          <div>
            <h2 className="er-page-title">Visão Geral</h2>
            <p className="er-page-subtitle">Acompanhe os principais indicadores do seu sistema.</p>
          </div>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            titulo="Total de Produtos" 
            valor={stats.totalProdutos} 
            icone={Package} 
            corFundo="bg-blue-100" 
            corIcone="text-blue-600" 
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
          <StatCard 
            titulo="Movimentações" 
            valor={stats.totalMovimentacoes} 
            icone={ArrowRightLeft} 
            corFundo="bg-emerald-100" 
            corIcone="text-emerald-600" 
            carregando={carregandoStats} 
          />
          <StatCard 
            titulo="Fornecedores" 
            valor={stats.totalFornecedores} 
            icone={Truck} 
            corFundo="bg-orange-100" 
            corIcone="text-orange-600" 
            carregando={carregandoStats} 
          />
        </div>

        {/* Sessão de Alertas / Notificações */}
        <div className="mb-6 mt-8 border-t border-raiz-borda pt-8">
          <h3 className="text-xl font-bold text-slate-900">Alertas do Sistema</h3>
          <p className="mb-6 mt-1 text-sm text-slate-500">Itens que requerem sua atenção imediata.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isGerente || isEstoquista) && (
              <>
            <button 
              onClick={() => abrirNotificacao('estoqueBaixo')}
              disabled={carregandoStats}
              className="flex items-center justify-between bg-white border border-red-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-red-400 transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Estoque Baixo</h4>
                  <p className="text-sm text-gray-500">Produtos abaixo do limite mínimo</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">{carregandoStats ? '-' : produtosEstoqueBaixo.length}</span>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-red-500 transition-colors" />
              </div>
            </button>

            <button 
              onClick={() => abrirNotificacao('vencendo')}
              disabled={carregandoStats}
              className="flex items-center justify-between bg-white border border-amber-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Vencendo / Vencidos</h4>
                  <p className="text-sm text-gray-500">Vencem em 30 dias ou já expirados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-amber-600">{carregandoStats ? '-' : produtosVencendo.length}</span>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
              </div>
            </button>
              </>
            )}

            {(isGerente || isFinanceiro) && (
              <button 
                onClick={() => abrirNotificacao('pendente')}
                disabled={carregandoStats}
                className="flex items-center justify-between bg-white border border-blue-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Aprovação Pendente</h4>
                    <p className="text-sm text-gray-500">Produtos aguardando precificação</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">{carregandoStats ? '-' : produtosPendentes.length}</span>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            )}

            {isGerente && (
              <button 
                onClick={() => abrirNotificacao('usuariosPendentes')}
                disabled={carregandoStats}
                className="flex items-center justify-between bg-white border border-purple-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-purple-400 transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Usuários Pendentes</h4>
                    <p className="text-sm text-gray-500">Aguardando aprovação de cadastro</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-600">{carregandoStats ? '-' : usuariosPendentes.length}</span>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 mt-8 border-t border-raiz-borda pt-8">
          <h3 className="text-xl font-bold text-slate-900">Acesso Rápido</h3>
          <p className="mb-6 mt-1 text-sm text-slate-500">Navegue pelos módulos disponíveis para o seu perfil.</p>
        </div>

        {modulosPermitidos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulosPermitidos.map((modulo) => {
              const IconeDoModulo = modulo.icon;
              return (
                <button
                  key={`card-${modulo.nome}`}
                  onClick={() => navigate(modulo.rota)}
                  className="er-surface group flex items-start p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-raiz-verde/40 hover:shadow-md"
                >
                  <div className={`p-4 rounded-lg ${modulo.corFundo} ${modulo.corIcone} mr-5 group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                    <IconeDoModulo size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-raiz-verde">
                      {modulo.nome}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{modulo.descricao}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="er-surface flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
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

      <Modal 
        isOpen={modalNotificacaoAberto} 
        onClose={() => setModalNotificacaoAberto(false)} 
        titulo={
          <div className="flex items-center gap-2">
            {tipoNotificacao === 'estoqueBaixo' ? <AlertTriangle className="text-red-600" /> : 
             tipoNotificacao === 'vencendo' ? <Clock className="text-amber-600" /> :
             tipoNotificacao === 'pendente' ? <DollarSign className="text-blue-600" /> : 
             <Users className="text-purple-600" />}
            {tipoNotificacao === 'estoqueBaixo' ? "Produtos com Estoque Baixo" : 
             tipoNotificacao === 'vencendo' ? "Produtos Vencendo ou Vencidos" :
             tipoNotificacao === 'pendente' ? "Produtos Aguardando Precificação" : 
             "Usuários Aguardando Aprovação"}
          </div>
        }
        maxWidth="max-w-2xl"
        closeOnClickOutside={true}
      >
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {listaExibicao.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Não há produtos nesta lista no momento. Tudo certo!</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tipoNotificacao === 'usuariosPendentes' ? (
                listaExibicao.map(usr => (
                  <li key={usr.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{usr.nome}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span>Email: {usr.email}</span>
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-md text-xs font-semibold">CPF: {usr.cpf}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-right">
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md font-medium border border-purple-100 animate-pulse">
                        Aprovação Pendente
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                listaExibicao.map(prod => (
                <li key={prod.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{prod.nome}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span>Cód: {prod.codigo_barras || 'N/A'}</span>
                      <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-md text-xs font-semibold">{unidades.find(u => u.id === prod.unidade_id)?.nome || `Unidade #${prod.unidade_id}`}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-right">
                    {tipoNotificacao === 'estoqueBaixo' ? (
                      <>
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md font-medium border border-red-100">Atual: {prod.quantidade_estoque}</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-medium">Mínimo: {prod.quantidade_minima}</span>
                      </>
                    ) : tipoNotificacao === 'vencendo' ? (
                      <>
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md font-medium border border-amber-100">Estoque: {prod.quantidade_estoque}</span>
                        {new Date(prod.data_validade) < new Date() ? (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md font-bold border border-red-200">Vencido em: {new Date(prod.data_validade).toLocaleDateString('pt-BR')}</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-medium">Vence: {new Date(prod.data_validade).toLocaleDateString('pt-BR')}</span>
                        )}
                      </>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-medium border border-blue-100 animate-pulse">Aprovação Pendente</span>
                    )}
                  </div>
                </li>
                ))
              )}
            </ul>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
