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
    <div className="er-panel mb-6 flex flex-col items-center gap-4 p-4 md:flex-row">
      <div className="flex-1 relative w-full">
        <Search className="er-input-icon" size={18} />
        <input
          type="text"
          maxLength={100}
          data-testid="barra-filtro-input-busca"
          placeholder={placeholderBusca}
          className="er-input pl-10"
          value={buscaTexto}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        {children}
        
        {/* Seletor de Itens por Página (Aparece só se as props forem passadas) */}
        {itensPorPagina && onItensPorPaginaChange && (
          <div className="relative md:w-36 shrink-0">
            <ListOrdered className="er-input-icon" size={16} />
            <select
              className="er-input appearance-none bg-[#fbfaf5] pl-9 pr-8 font-medium"
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
