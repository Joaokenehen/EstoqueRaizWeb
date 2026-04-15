import { Trash2 } from 'lucide-react';

interface BarraAcoesLoteProps {
  quantidadeSelecionada: number;
  onExcluir: () => void;
  carregando?: boolean;
  textoItem?: string; 
}

export const BarraAcoesLote = ({ 
  quantidadeSelecionada, 
  onExcluir, 
  carregando = false, 
  textoItem = 'item(ns)' 
}: BarraAcoesLoteProps) => {
  
  if (quantidadeSelecionada === 0) return null;

  return (
    <div
      className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-200"
      data-testid="barra-acoes-lote"
    >
      <div className="flex items-center space-x-2">
        <span
          className="text-red-700 font-bold text-lg"
          data-testid="barra-acoes-lote-quantidade"
        >
          {quantidadeSelecionada}
        </span>
        <span
          className="text-red-600 font-medium text-sm"
          data-testid="barra-acoes-lote-texto"
        >
          {textoItem} selecionado(s)
        </span>
      </div>
      <button
        onClick={onExcluir}
        disabled={carregando}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="barra-acoes-lote-excluir"
      >
        <Trash2 size={18} /> 
        {carregando ? 'Excluindo...' : 'Excluir Selecionados'}
      </button>
    </div>
  );
};
