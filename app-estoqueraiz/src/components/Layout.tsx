import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, User, ChevronDown, Settings, LogOut, Package
} from 'lucide-react';
import { modulos } from '../data/modulos';
import { authService } from '../services/authService';
import { ModalPerfil } from './ModalPerfil';

interface LayoutProps {
  children: ReactNode; 
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  // --- Funções Restauradas ---
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
  // ---------------------------

  const abrirModalConfig = () => {
    setModalConfigAberto(true);
    setMenuAberto(false);
  };

  const handleAtualizarUsuario = (usuarioAtualizado: any) => {
    setUsuario(usuarioAtualizado);
    localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuarioAtualizado));
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
          input-testid="backdrop-sidebar" 
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
              input-testid="menu-usuario-btn"
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
      <ModalPerfil 
        isOpen={modalConfigAberto} 
        onClose={() => setModalConfigAberto(false)} 
        usuario={usuario}
        onAtualizarUsuario={handleAtualizarUsuario}
      />
    </div>
  );
}