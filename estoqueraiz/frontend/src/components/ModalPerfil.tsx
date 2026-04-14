import { useState, useEffect } from 'react';
import { User, X, Check, XCircle, Edit2 } from 'lucide-react';
import { usuarioService } from '../services/usuarioService';

interface ModalPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: any;
  onAtualizarUsuario: (usuarioAtualizado: any) => void;
}

export const ModalPerfil = ({ isOpen, onClose, usuario, onAtualizarUsuario }: ModalPerfilProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '' });
  const [mensagemConfig, setMensagemConfig] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    if (isOpen) {
      setEditForm({ nome: usuario?.nome || '' });
      setIsEditing(false);
      setMensagemConfig({ texto: '', tipo: '' });
    }
  }, [isOpen, usuario]);

  if (!isOpen || !usuario) return null;

  const formatarCargo = (cargo?: string) => {
    if (!cargo) return 'Sem cargo definido';
    return cargo.charAt(0).toUpperCase() + cargo.slice(1);
  };

  const getStatusBadge = (status?: string) => {
      switch (status) {
        case 'aprovado':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase">Aprovado</span>;
        case 'pendente':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">Pendente</span>;
        case 'rejeitado':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 uppercase">Rejeitado</span>;
        default:
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 uppercase">Desconhecido</span>;
      }
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
      onAtualizarUsuario(usuarioAtualizado); // Avisa o Layout que o usuário mudou
      
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-50 duration-300 ease-out">
        
        <div className="bg-raiz-marrom p-6 flex justify-between items-center text-white relative">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold">Meu Perfil</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            disabled={loadingConfig}
            data-testid="btn-fechar-modal"
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
                data-testid="btn-editar-nome"
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
                  maxLength={100}
                  data-testid="input-nome-perfil"
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
                data-testid="btn-salvar-perfil"
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
                data-testid="btn-cancelar-perfil"
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
                <label className="text-sm font-semibold text-gray-500 mb-1 block">Status da Conta</label>
                {getStatusBadge(usuario?.status)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
