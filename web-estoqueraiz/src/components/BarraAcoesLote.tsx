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
      className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50/90 p-4 shadow-sm animate-in fade-in zoom-in duration-200"
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
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="barra-acoes-lote-excluir"
      >
        <Trash2 size={18} /> 
        {carregando ? 'Excluindo...' : 'Excluir Selecionados'}
      </button>
    </div>
  );
};
