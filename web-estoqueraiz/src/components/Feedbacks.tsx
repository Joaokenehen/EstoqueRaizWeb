import { AlertCircle } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-raiz-verde/15 border-t-raiz-verde"></div>
  </div>
);

interface MensagemErroProps {
  mensagem: string;
}

export const MensagemErro = ({ mensagem }: MensagemErroProps) => {
  if (!mensagem) return null;
  
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in duration-200">
      <AlertCircle size={24} /> 
      <span>{mensagem}</span>
    </div>
  );
};
