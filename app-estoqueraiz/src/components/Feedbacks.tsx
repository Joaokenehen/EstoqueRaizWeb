import { AlertCircle } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

interface MensagemErroProps {
  mensagem: string;
}

export const MensagemErro = ({ mensagem }: MensagemErroProps) => {
  if (!mensagem) return null;
  
  return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 animate-in fade-in duration-200">
      <AlertCircle size={24} /> 
      <span>{mensagem}</span>
    </div>
  );
};