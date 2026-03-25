import { Search, ListOrdered } from 'lucide-react';
import { type ReactNode } from 'react';

interface BarraFiltrosProps {
  buscaTexto: string;
  onBuscaChange: (texto: string) => void;
  placeholderBusca?: string;
  itensPorPagina?: number;
  onItensPorPaginaChange?: (quantidade: number) => void;
  children?: ReactNode;
}

export const BarraFiltros = ({
  buscaTexto,
  onBuscaChange,
  placeholderBusca = "Pesquisar...",
  itensPorPagina,
  onItensPorPaginaChange,
  children
}: BarraFiltrosProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholderBusca}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          value={buscaTexto}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        {children}
        
        {/* Seletor de Itens por Página (Aparece só se as props forem passadas) */}
        {itensPorPagina && onItensPorPaginaChange && (
          <div className="relative md:w-36 shrink-0">
            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-gray-50 font-medium"
              value={itensPorPagina}
              onChange={(e) => onItensPorPaginaChange(Number(e.target.value))}
            >
              <option value={10}>10 itens</option>
              <option value={30}>30 itens</option>
              <option value={50}>50 itens</option>
              <option value={100}>100 itens</option>
              <option value={1000}>1000 itens</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};