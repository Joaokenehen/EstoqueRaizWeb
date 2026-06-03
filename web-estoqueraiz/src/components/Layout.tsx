import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, Settings, LogOut, Package, Bell,
  Clock, Users, DollarSign, ArrowDownRight
} from 'lucide-react';
import { modulos } from '../data/modulos';
import { authService } from '../services/authService';
import { produtoService } from '../services/produtoService';
import { movimentacaoService } from '../services/movimentacaoService';
import { usuarioService } from '../services/usuarioService';
import { ModalPerfil } from './ModalPerfil';
import toast from 'react-hot-toast';
import { getIniciais, getCorAvatar } from '../utils/avatar';

interface LayoutProps {
  children: ReactNode; 
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const qtdNotificacoesAntiga = useRef<number>(
    sessionStorage.getItem('@EstoqueRaiz:qtdNotificacoes') 
      ? Number(sessionStorage.getItem('@EstoqueRaiz:qtdNotificacoes')) 
      : -1
  );

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const carregarNotificacoes = async () => {
      try {
        const isGerente = usuario.cargo === 'gerente';
        const isFinanceiro = usuario.cargo === 'financeiro';
        const isEstoquista = usuario.cargo === 'estoquista';

        const promessas: any[] = [
          produtoService.listarTodos(),
        ];

        if (isGerente || isFinanceiro) {
          promessas.push(movimentacaoService.listarTodas({ status: 'pendente', tipo: 'ENTRADA' }).catch(() => []));
        } else {
          promessas.push(Promise.resolve([]));
        }

        if (isGerente) {
          promessas.push(usuarioService.listarTodos().catch(() => []));
        } else {
          promessas.push(Promise.resolve([]));
        }

        const [produtos, entradasPendentes, usuariosData] = await Promise.all(promessas);

        const produtosArray = Array.isArray(produtos) ? produtos : [];
        const entradasArray = Array.isArray(entradasPendentes) ? entradasPendentes : [];
        const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];

        const novasNotificacoes = [];

        if (isGerente) {
          const usersPendentes = usuariosArray.filter(u => u.status === 'pendente');
          if (usersPendentes.length > 0) {
            novasNotificacoes.push({
              id: 'users',
              titulo: 'Usuários Pendentes',
              mensagem: `${usersPendentes.length} cadastro(s) aguardando aprovação.`,
              rota: '/usuarios',
              quantidade: usersPendentes.length,
              icone: Users,
              cor: 'text-purple-600',
              bg: 'bg-purple-50 border-purple-100',
            });
          }
        }

        if (isGerente || isFinanceiro) {
          const prodsPendentes = produtosArray.filter(p => p.statusProduto === 'pendente');
          if (prodsPendentes.length > 0) {
            novasNotificacoes.push({
              id: 'prods_pendentes',
              titulo: 'Produtos Pendentes',
              mensagem: `${prodsPendentes.length} produto(s) aguardando precificação.`,
              rota: '/financeiro',
              quantidade: prodsPendentes.length,
              icone: DollarSign,
              cor: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-100',
            });
          }

          if (entradasArray.length > 0) {
            novasNotificacoes.push({
              id: 'entradas_pendentes',
              titulo: 'Entradas Pendentes',
              mensagem: `${entradasArray.length} entrada(s) de NF aguardando aprovação.`,
              rota: '/financeiro',
              quantidade: entradasArray.length,
              icone: DollarSign,
              cor: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-100',
            });
          }
        }

        if (isGerente || isEstoquista) {
          const hoje = new Date();
          const trintaDias = new Date();
          trintaDias.setDate(hoje.getDate() + 30);

          const estBaixo = produtosArray.filter(p => p.quantidade_estoque <= (p.quantidade_minima || 0));
          if (estBaixo.length > 0) {
            novasNotificacoes.push({
              id: 'estoque_baixo',
              titulo: 'Estoque Baixo',
              mensagem: `${estBaixo.length} produto(s) com estoque abaixo do mínimo.`,
              rota: '/produtos',
              quantidade: estBaixo.length,
              icone: ArrowDownRight,
              cor: 'text-orange-600',
              bg: 'bg-orange-50 border-orange-100',
            });
          }

          const vencendo = produtosArray.filter(p => p.data_validade && new Date(p.data_validade) <= trintaDias);
          if (vencendo.length > 0) {
            novasNotificacoes.push({
              id: 'vencendo',
              titulo: 'Validade Crítica',
              mensagem: `${vencendo.length} produto(s) vencendo em 30 dias ou vencidos.`,
              rota: '/produtos',
              quantidade: vencendo.length,
              icone: Clock,
              cor: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-100',
            });
          }
        }

        const novoTotalItens = novasNotificacoes.reduce((acc, n) => acc + n.quantidade, 0);

        const qtdAntiga = qtdNotificacoesAntiga.current;
        const isPrimeiroAcesso = qtdAntiga === -1;
        const aumentouPendencias = novoTotalItens > qtdAntiga;

        if ((isPrimeiroAcesso && novoTotalItens > 0) || (!isPrimeiroAcesso && aumentouPendencias)) {
          toast(isPrimeiroAcesso ? `Olá! Você tem ${novoTotalItens} pendência(s) aguardando sua ação.` : 'Você tem novas pendências no sistema!', { 
            icon: '🔔',
            duration: 5000,
            style: { background: '#17351a', color: '#fff', fontWeight: 'bold' }
          });
          
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, context.currentTime); 
            gain.gain.setValueAtTime(0.1, context.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            osc.start();
            osc.stop(context.currentTime + 0.5);
          } catch (e) {
            console.log('Áudio automático bloqueado pelo navegador');
          }
        }
        
        qtdNotificacoesAntiga.current = novoTotalItens;
        sessionStorage.setItem('@EstoqueRaiz:qtdNotificacoes', novoTotalItens.toString());
        setNotificacoes(novasNotificacoes);

      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };

    carregarNotificacoes();
    
    const interval = setInterval(carregarNotificacoes, 120000);
    return () => clearInterval(interval);
  }, [usuario]);

  const modulosPermitidos = usuario ? modulos.filter((modulo) => {
    if (!usuario || !usuario.cargo) return false;
    return modulo.cargosPermitidos.includes(usuario.cargo);
  }) : [];

  const formatarCargo = (cargo?: string) => {
    if (!cargo) return 'Sem cargo definido';
    return cargo.charAt(0).toUpperCase() + cargo.slice(1);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('@EstoqueRaiz:qtdNotificacoes');
    authService.logOut();
    navigate('/login');
  };

  const abrirModalConfig = () => {
    setModalConfigAberto(true);
    setMenuAberto(false);
  };

  const handleAtualizarUsuario = (usuarioAtualizado: any) => {
    setUsuario(usuarioAtualizado);
    localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuarioAtualizado));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-raiz-fundo font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-raiz-borda bg-white/95 shadow-[18px_0_55px_-45px_rgba(75,54,33,0.55)] backdrop-blur transform transition-transform duration-300 ease-in-out
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
       <div className="flex h-16 shrink-0 items-center justify-between border-b border-raiz-borda px-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none"
            title="Voltar para a Visão Geral"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-raiz-verde shadow-raiz-button">
              <Package className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-raiz-marrom">Estoque Raiz</h1>
          </button>
          
          {/* Botão fechar (Apenas Mobile) */}
          <button 
            className="er-icon-button text-slate-400 hover:bg-red-50 hover:text-red-600 md:hidden"
            onClick={() => setSidebarAberta(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Permissão */}
        <div className="border-b border-raiz-borda bg-[#fbfaf5] px-6 py-4">
          <p className="mb-1 text-xs font-medium text-slate-500">Permissão de Acesso</p>
          <span className="inline-flex items-center rounded-md bg-raiz-verde-claro px-2 py-1 text-xs font-bold uppercase text-raiz-verde">
            {formatarCargo(usuario?.cargo)}
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {modulosPermitidos.map((modulo) => {
            const Icon = modulo.icon;
            return (
              <button 
                key={modulo.nome} 
                onClick={() => { navigate(modulo.rota); setSidebarAberta(false); }}
                className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-raiz-verde-claro hover:text-raiz-verde"
              >
                <Icon size={20} />
                <span>{modulo.nome}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setSidebarAberta(false)}
          data-testid="backdrop-sidebar" 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-raiz-borda bg-white/85 px-4 shadow-sm backdrop-blur sm:px-8 md:justify-end">
          <button className="-ml-2 rounded-lg p-2 text-slate-500 hover:bg-raiz-verde-claro hover:text-raiz-verde focus:outline-none md:hidden" onClick={() => setSidebarAberta(true)}>
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Sino de Notificações */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificacoesAbertas(!notificacoesAbertas);
                  setMenuAberto(false);
                }} 
                className="relative rounded-full border border-raiz-borda bg-[#fbfaf5] p-2 text-slate-500 transition-colors hover:text-raiz-verde focus:outline-none"
              >
                <Bell size={18} />
                {notificacoes.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {notificacoesAbertas && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificacoesAbertas(false)}></div>
                  <div className="absolute right-0 z-50 mt-3 flex max-h-[80vh] w-[320px] flex-col overflow-hidden rounded-lg border border-raiz-borda bg-white py-1 shadow-2xl animate-in fade-in zoom-in duration-200 sm:w-[360px]">
                    <div className="flex items-center justify-between border-b border-raiz-borda bg-[#fbfaf5] px-4 py-3">
                      <h3 className="font-bold text-gray-800 text-sm">Notificações</h3>
                      {notificacoes.length > 0 && <span className="bg-raiz-verde text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{notificacoes.length} alertas</span>}
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden">
                      {notificacoes.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm flex flex-col items-center">
                          <Bell size={24} className="text-gray-300 mb-2" />
                          Você não possui notificações pendentes.
                        </div>
                      ) : (
                        notificacoes.map((notif) => {
                          const Icone = notif.icone;
                          return (
                          <button
                            key={notif.id}
                            onClick={() => {
                              navigate(notif.rota);
                              setNotificacoesAbertas(false);
                            }}
                            className="group flex w-full items-start gap-3 border-b border-raiz-borda/60 px-4 py-3 text-left transition-colors hover:bg-raiz-verde-claro/30"
                          >
                            <div className={`p-2 rounded-lg border shrink-0 ${notif.bg} ${notif.cor}`}>
                              <Icone size={18} />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${notif.cor} group-hover:underline`}>{notif.titulo}</p>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.mensagem}</p>
                            </div>
                          </button>
                        )})
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative border-l border-raiz-borda pl-2 sm:pl-4">
            <button 
              onClick={() => setMenuAberto(!menuAberto)} 
              className="flex items-center space-x-2 text-slate-600 transition-colors hover:text-raiz-verde focus:outline-none"
              data-testid="menu-usuario-btn"
            >
              {usuario?.foto_perfil ? (
                <img 
                  src={usuario.foto_perfil} 
                  alt="Perfil" 
                  className="h-9 w-9 rounded-full border border-raiz-borda object-cover shadow-sm" 
                />
              ) : (
                <div className={`w-9 h-9 flex items-center justify-center rounded-full border shadow-sm font-bold text-sm ${getCorAvatar(usuario?.nome)}`}>
                  {getIniciais(usuario?.nome)}
                </div>
              )}
              <span className="font-semibold text-sm hidden sm:block text-gray-700">{usuario?.nome?.split(' ')[0] || 'Usuário'}</span>
              <ChevronDown size={16} className={menuAberto ? 'rotate-180' : ''} />
            </button>

            {menuAberto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)}></div>
                <div className="absolute right-0 z-50 mt-3 w-48 rounded-lg border border-raiz-borda bg-white py-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={abrirModalConfig}
                    className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-raiz-verde-claro/50"
                  >
                    <Settings size={16} /> <span>Meu Perfil</span>
                  </button>
                  <div className="my-1 h-px bg-raiz-borda"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3">
                    <LogOut size={16} /> <span>Sair</span>
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* Modal de Perfil */}
      <ModalPerfil 
        isOpen={modalConfigAberto} 
        onClose={() => setModalConfigAberto(false)} 
        usuario={usuario}
        onAtualizarUsuario={handleAtualizarUsuario}
      />
    </div>
  );
}
