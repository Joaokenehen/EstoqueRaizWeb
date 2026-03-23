import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Settings, X, User, ChevronDown, Edit2, Check, XCircle } from 'lucide-react';
import { modulos } from '../data/modulos';
import api from '../services/api'; 

export function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '' });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [mensagemConfig, setMensagemConfig] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@EstoqueRaiz:token');
    localStorage.removeItem('@EstoqueRaiz:usuario');
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
      // Enviamos apenas o NOME para atualização, protegendo o e-mail
      await api.put(`/api/usuarios/${usuario.id}`, {
        nome: editForm.nome,
      });

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

  const formatarCargo = (cargo: string) => {
    if (!cargo) return 'Sem cargo definido';
    return cargo.charAt(0).toUpperCase() + cargo.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <header className="bg-white border-b border-gray-200 px-8 lg:px-16 py-4 flex items-center justify-between shadow-sm z-30 relative w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-raiz-verde rounded-lg flex items-center justify-center">
            <Package className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-raiz-marrom">Estoque Raiz</h1>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center space-x-2 text-gray-600 hover:text-raiz-verde transition-colors focus:outline-none bg-transparent p-2 rounded-lg"
          >
            <div className="bg-gray-100 p-2 rounded-full">
              <User size={18} className="text-gray-500" />
            </div>
            <span className="font-medium hidden md:block">
              <strong className="text-raiz-marrom">{usuario?.nome?.split(' ')[0] || 'Usuário'}</strong>
            </span>
            <ChevronDown size={16} className={`transform transition-transform duration-200 ${menuAberto ? 'rotate-180' : ''}`} />
          </button>

          {menuAberto && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={abrirModalConfig}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-raiz-verde flex items-center space-x-3 transition-colors"
                >
                  <Settings size={16} />
                  <span className="font-semibold">Meu Perfil</span>
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="font-semibold">Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 mt-1">Selecione o módulo que deseja acessar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((modulo) => {
            const IconeDoModulo = modulo.icon;
            return (
              <button
                key={modulo.nome}
                onClick={() => navigate(modulo.rota)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-raiz-verde transition-all duration-200 flex items-start text-left group"
              >
                <div className={`p-4 rounded-lg ${modulo.corFundo} ${modulo.corIcone} mr-5 group-hover:scale-110 transition-transform duration-200`}>
                  <IconeDoModulo size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-raiz-verde transition-colors">
                    {modulo.nome}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{modulo.descricao}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {modalConfigAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
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
                
                {/* O E-mail agora fica sempre como visualização, independente do modo de edição */}
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
                    <p className="text-gray-900 font-medium text-raiz-verde">
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