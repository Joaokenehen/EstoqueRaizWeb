import { Check, Trash2, Edit, AlertCircle, UserCheck } from 'lucide-react';

interface BotaoProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string; 
}

export const BotaoAprovar = ({ onClick, disabled, title = "Aprovar", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <Check size={18} />
  </button>
);

export const BotaoRejeitar = ({ onClick, disabled, title = "Rejeitar", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <AlertCircle size={18} />
  </button>
);

export const BotaoDeletar = ({ onClick, disabled, title = "Excluir", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <Trash2 size={18} />
  </button>
);

export const BotaoEditar = ({ onClick, disabled, title = "Editar", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    title={title}
  >
    <Edit size={18} />
  </button>
);

export const BotaoSalvarPermissao = ({ onClick, disabled, title = "Salvar novo cargo", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg transition-colors ${
      !disabled
        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    } ${className}`}
    title={title}
  >
    <UserCheck size={18} />
  </button>
);