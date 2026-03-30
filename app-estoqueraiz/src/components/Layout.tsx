import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, User, ChevronDown, Settings, LogOut, 
  Check, XCircle, Edit2, Package
} from 'lucide-react';
import { modulos } from '../data/modulos';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';

interface LayoutProps {
  children: ReactNode; 
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nome: '' });
  const [mensagemConfig, setMensagemConfig] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  const modulosPermitidos = usuario ? modulos.filter((modulo) => {
    if (!usuario || !usuario.cargo) return false;
    return modulo.cargosPermitidos.includes(usuario.cargo);
  }) : [];

  const formatarCargo = (cargo?: string) => {
    if (!cargo) return 'Sem cargo definido';
    return cargo.charAt(0).toUpperCase() + cargo.slice(1);
  };

  const handleLogout = () => {
    authService.logOut();
    navigate('/login');
  };

  const abrirModalConfig = () => {
    setEditForm({ nome: usuario?.nome || '' });
    setIsEditing(false);
    setMensagemConfig({ texto: '', tipo: '' });
    setModalConfigAberto(true);
    setMenuAberto(false);
  };

  const salvarPerfil = async () => {
    if (!editForm.nome.trim()) {
      setMensagemConfig({ texto: 'O nome não pode ficar vazio.', tipo: 'erro' });
      return;
    }

    setLoadingConfig(true);
    setMensagemConfig({ texto: '', tipo: '' });

    try {
      await usuarioService.atualizar(usuario.id, { nome: editForm.nome });

      const usuarioAtualizado = { ...usuario, nome: editForm.nome };
      setUsuario(usuarioAtualizado);
      localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuarioAtualizado));

      setIsEditing(false);
      setMensagemConfig({ texto: 'Perfil atualizado com sucesso!', tipo: 'sucesso' });

      setTimeout(() => setMensagemConfig({ texto: '', tipo: '' }), 3000);
    } catch (error: any) {
      setMensagemConfig({ 
        texto: error.response?.data?.message || 'Erro ao atualizar o perfil. Tente novamente.', 
        tipo: 'erro' 
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col 
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
       <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none"
            title="Voltar para a Visão Geral"
          >
            <div className="w-8 h-8 bg-raiz-verde rounded-lg flex items-center justify-center shadow-sm">
              <Package className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold text-raiz-marrom tracking-tight">Estoque Raiz</h1>
          </button>
          
          {/* Botão fechar (Apenas Mobile) */}
          <button 
            className="md:hidden text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => setSidebarAberta(false)}
          >
            <X size={20} />
          </button>
        </div>
        {/* Permissão */}
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-1">Permissão de Acesso</p>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 uppercase">
            {formatarCargo(usuario?.cargo)}
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {modulosPermitidos.map((modulo) => {
            const Icon = modulo.icon;
            return (
              <button 
                key={modulo.nome} 
                onClick={() => { navigate(modulo.rota); setSidebarAberta(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-green-50 hover:text-raiz-verde transition-all"
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
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between md:justify-end shadow-sm z-20 shrink-0">
          <button className="md:hidden text-gray-500 hover:text-raiz-verde p-2 -ml-2 rounded-lg focus:outline-none" onClick={() => setSidebarAberta(true)}>
            <Menu size={24} />
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setMenuAberto(!menuAberto)} 
              className="flex items-center space-x-2 text-gray-600 hover:text-raiz-verde transition-colors focus:outline-none"
            >
              <div className="bg-gray-100 p-2 rounded-full"><User size={18} /></div>
              <span className="font-medium hidden sm:block">{usuario?.nome?.split(' ')[0] || 'Usuário'}</span>
              <ChevronDown size={16} className={menuAberto ? 'rotate-180' : ''} />
            </button>

            {menuAberto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <button 
                    onClick={abrirModalConfig}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center space-x-3"
                  >
                    <Settings size={16} /> <span>Meu Perfil</span>
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3">
                    <LogOut size={16} /> <span>Sair</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Modal de Perfil */}
      {modalConfigAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-raiz-marrom p-6 flex justify-between items-center text-white relative">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <User size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">Meu Perfil</h3>
              </div>
              <button 
                onClick={() => setModalConfigAberto(false)}
                className="text-white/70 hover:text-white transition-colors"
                disabled={loadingConfig}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {mensagemConfig.texto && (
                <div className={`p-3 rounded-lg text-sm font-semibold flex items-center space-x-2 ${mensagemConfig.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {mensagemConfig.tipo === 'sucesso' ? <Check size={18} /> : <XCircle size={18} />}
                  <span>{mensagemConfig.texto}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="text-gray-800 font-bold">Dados Pessoais</h4>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-sm flex items-center space-x-1 text-raiz-verde hover:text-green-700 font-semibold transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Editar Nome</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">Nome Completo</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.nome}
                      onChange={(e) => setEditForm({ nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
                      placeholder="Seu nome"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{usuario?.nome || 'Não informado'}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">E-mail</label>
                  <p className="text-gray-900 truncate">{usuario?.email || 'Não informado'}</p>
                  {isEditing && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      * A alteração de e-mail requer confirmação de segurança. Contate o suporte.
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={salvarPerfil}
                    disabled={loadingConfig}
                    className="flex-1 bg-raiz-verde text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-70 flex justify-center items-center"
                  >
                    {loadingConfig ? 'Salvando...' : 'Salvar Nome'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({ nome: usuario?.nome });
                    }}
                    disabled={loadingConfig}
                    className="px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-gray-800 font-bold mb-3">Informações do Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Nível de Acesso</label>
                    <p className="font-medium text-raiz-verde">
                      {formatarCargo(usuario?.cargo)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Status da Conta</label>
                    <p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {usuario?.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}