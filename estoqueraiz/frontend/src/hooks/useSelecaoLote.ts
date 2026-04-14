import { useState, useCallback } from 'react';

export function useSelecaoLote<T = number>() {
  const [selecionados, setSelecionados] = useState<T[]>([]);

  const alternarSelecao = useCallback((id: T) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selecionarTodos = useCallback((ids: T[]) => {
    setSelecionados(ids);
  }, []);

  const limparSelecao = useCallback(() => {
    setSelecionados([]);
  }, []);

  return {
    selecionados,
    alternarSelecao,
    selecionarTodos,
    limparSelecao,
  };
}