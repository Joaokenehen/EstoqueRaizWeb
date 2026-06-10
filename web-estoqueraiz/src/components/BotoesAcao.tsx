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
    className={`er-icon-button bg-green-50 text-green-700 hover:border-green-200 hover:bg-green-100 ${className}`}
    title={title}
  >
    <Check size={18} />
  </button>
);

export const BotaoRejeitar = ({ onClick, disabled, title = "Rejeitar", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`er-icon-button bg-amber-50 text-amber-700 hover:border-amber-200 hover:bg-amber-100 ${className}`}
    title={title}
  >
    <AlertCircle size={18} />
  </button>
);

export const BotaoDeletar = ({ onClick, disabled, title = "Excluir", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`er-icon-button bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 ${className}`}
    title={title}
  >
    <Trash2 size={18} />
  </button>
);

export const BotaoEditar = ({ onClick, disabled, title = "Editar", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`er-icon-button bg-raiz-verde-claro text-raiz-verde hover:border-raiz-verde/20 hover:bg-green-100 ${className}`}
    title={title}
  >
    <Edit size={18} />
  </button>
);

export const BotaoSalvarPermissao = ({ onClick, disabled, title = "Salvar novo cargo", className = "" }: BotaoProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`er-icon-button ${
      !disabled
        ? 'bg-green-100 text-raiz-verde hover:border-green-200 hover:bg-green-200'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    } ${className}`}
    title={title}
  >
    <UserCheck size={18} />
  </button>
);
