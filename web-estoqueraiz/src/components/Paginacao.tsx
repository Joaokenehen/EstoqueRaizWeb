interface PaginacaoProps {
  totalItens: number;
  itensPorPagina: number;
  paginaAtual: number;
  setPaginaAtual: (pagina: number) => void;
}

export const Paginacao = ({
  totalItens,
  itensPorPagina,
  paginaAtual,
  setPaginaAtual
}: PaginacaoProps) => {
  if (totalItens === 0) return null;

  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const indiceUltimoItem = Math.min(paginaAtual * itensPorPagina, totalItens);
  const indicePrimeiroItem = (paginaAtual - 1) * itensPorPagina;

  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between w-full gap-4">
        <div>
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Mostrando <span className="font-medium">{indicePrimeiroItem + 1}</span> a <span className="font-medium">{indiceUltimoItem}</span> de <span className="font-medium">{totalItens}</span> resultados
          </p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button onClick={() => setPaginaAtual(Math.max(paginaAtual - 1, 1))} disabled={paginaAtual === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Anterior
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button onClick={() => setPaginaAtual(Math.min(paginaAtual + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Próxima
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};