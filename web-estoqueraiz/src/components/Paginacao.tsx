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
    <div className="flex items-center justify-between border-t border-raiz-borda bg-[#fbfaf5] px-4 py-3 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between w-full gap-4">
        <div>
          <p className="text-center text-sm text-slate-600 sm:text-left">
            Mostrando <span className="font-medium">{indicePrimeiroItem + 1}</span> a <span className="font-medium">{indiceUltimoItem}</span> de <span className="font-medium">{totalItens}</span> resultados
          </p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <nav className="relative z-0 inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button onClick={() => setPaginaAtual(Math.max(paginaAtual - 1, 1))} disabled={paginaAtual === 1} className="relative inline-flex items-center rounded-l-lg border border-raiz-borda bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-raiz-verde-claro/40 disabled:cursor-not-allowed disabled:opacity-50">
              Anterior
            </button>
            <span className="relative inline-flex items-center border border-raiz-borda bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button onClick={() => setPaginaAtual(Math.min(paginaAtual + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="relative inline-flex items-center rounded-r-lg border border-raiz-borda bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-raiz-verde-claro/40 disabled:cursor-not-allowed disabled:opacity-50">
              Próxima
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
