import { useState, useEffect } from 'react';
import { categoriaService, type Categoria } from '../services/categoriaService';
import { BarraFiltros } from '../components/BarraFiltro';
import { Plus, X, Tags } from 'lucide-react';
import { BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';
import { LoadingSpinner, MensagemErro } from '../components/Feedbacks';
import { BarraAcoesLote } from '../components/BarraAcoesLote';
import { useSelecaoLote } from '../hooks/useSelecaoLote';
import Layout from '../components/Layout';

export const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const isGerente = usuarioLogado?.cargo === 'gerente';
  const [buscaTexto, setBuscaTexto] = useState('');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const { 
    selecionados, 
    alternarSelecao, 
    selecionarTodos, 
    limparSelecao 
  } = useSelecaoLote<number>();
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const dados = await categoriaService.listarTodas();
      setCategorias(dados);
    } catch (error) {
      setErro('Não foi possível carregar as categorias.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
    limparSelecao();
  }, [buscaTexto, itensPorPagina, limparSelecao]);

  const categoriasFiltradas = categorias.filter((c) => {
    const termo = buscaTexto.toLowerCase();
    return c.nome.toLowerCase().includes(termo) || (c.descricao?.toLowerCase().includes(termo));
  });

  const totalPaginas = Math.max(1, Math.ceil(categoriasFiltradas.length / itensPorPagina));
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const categoriasPaginadas = categoriasFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  const abrirModal = (categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({
        nome: categoria.nome,
        descricao: categoria.descricao || '' 
      });
    } else {
      setCategoriaEditando(null);
      setFormData({ nome: '', descricao: '' });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessandoAcao(true);
    try {
      if (categoriaEditando) {
        await categoriaService.atualizar(categoriaEditando.id, formData);
        alert('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.criar(formData);
        alert('Categoria criada com sucesso!');
      }
      fecharModal();
      await carregarCategorias();
    } catch (error) {
      alert('Erro ao guardar a categoria. Tenta novamente.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Atenção: Desejas realmente excluir esta categoria?')) return;
    try {
      await categoriaService.deletar(id);
      await carregarCategorias();
    } catch (error: any) {
      // Captura a mensagem do backend ou mostra uma genérica
      alert(error.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  const handleDeletarLote = async () => {
    if (selecionados.length === 0) return;

    if (!isGerente) {
      alert('Apenas gerentes podem excluir categorias em lote.');
      return;
    }

    if (!window.confirm(`Atenção: Você está prestes a excluir ${selecionados.length} categoria(s). Esta ação é irreversível. Deseja continuar?`)) {
      return;
    }

    try {
      setCarregando(true);
      await Promise.all(selecionados.map(id => categoriaService.deletar(id)));
      
      alert(`${selecionados.length} categoria(s) excluída(s) com sucesso!`);
      limparSelecao();
      await carregarCategorias();
    } catch (error: any) {
      // Captura a mensagem do backend para o lote também
      alert(error.response?.data?.message || 'Erro ao excluir algumas categorias.');
      await carregarCategorias();
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Categorias</h1>
            <p className="text-gray-500 mt-2">Organiza os teus produtos por secções e departamentos.</p>
          </div>
          {isGerente && (
            <button 
              onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={20} /> Nova Categoria
            </button>
          )}
        </header>

        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Procurar por nome ou descrição..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        />

        {isGerente && (
          <BarraAcoesLote 
            quantidadeSelecionada={selecionados.length}
            onExcluir={handleDeletarLote}
            carregando={carregando}
            textoItem="categoria(s)"
          />
        )}

        {carregando ? (
          <LoadingSpinner />
        ) : erro ? (
          <MensagemErro mensagem={erro} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    {isGerente && (
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-raiz-verde focus:ring-raiz-verde cursor-pointer"
                          checked={
                            categoriasPaginadas.length > 0 && 
                            selecionados.length === categoriasPaginadas.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              selecionarTodos(categoriasPaginadas.map(c => c.id));
                            } else {
                              limparSelecao();
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="p-4 font-semibold w-1/3">Categoria</th>
                    <th className="p-4 font-semibold">Descrição</th>
                    {isGerente && <th className="p-4 font-semibold text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categoriasPaginadas.map((categoria) => (
                    <tr key={categoria.id} className={`transition-colors ${isGerente && selecionados.includes(categoria.id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      {isGerente && (
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-raiz-verde focus:ring-raiz-verde cursor-pointer"
                            checked={selecionados.includes(categoria.id)}
                            onChange={() => alternarSelecao(categoria.id)}
                          />
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Tags size={20} />
                          </div>
                          <span className="font-semibold text-gray-900">{categoria.nome}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">{categoria.descricao || '—'}</span>
                      </td>
                      
                      {isGerente && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <BotaoEditar 
                              onClick={() => abrirModal(categoria)}
                              title="Editar Categoria"
                            />
                            <BotaoDeletar 
                              onClick={() => handleDeletar(categoria.id)}
                              title="Excluir Categoria"
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {categoriasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={isGerente ? 4 : 3} className="p-8 text-center text-gray-500">
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {categoriasFiltradas.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <p className="text-sm text-gray-700">
                  A mostrar <span className="font-medium">{indicePrimeiroItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, categoriasFiltradas.length)}</span> de <span className="font-medium">{categoriasFiltradas.length}</span> resultados
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} disabled={paginaAtual === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    Anterior
                  </button>
                  <button onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    Próxima
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Ferramentas Elétricas" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Furadeiras, serras e equipamentos elétricos" />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={fecharModal} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={processandoAcao} className="px-5 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                  {processandoAcao && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {processandoAcao ? 'A guardar...' : 'Guardar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
