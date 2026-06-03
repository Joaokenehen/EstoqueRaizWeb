import { useState, useEffect } from 'react';
import { categoriaService, type Categoria } from '../services/categoriaService';
import { BarraFiltros } from '../components/BarraFiltro';
import { Plus, Tags } from 'lucide-react';
import { BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';
import { LoadingSpinner, MensagemErro } from '../components/Feedbacks';
import { BarraAcoesLote } from '../components/BarraAcoesLote';
import { useSelecaoLote } from '../hooks/useSelecaoLote';
import Layout from '../components/Layout';
import { Modal } from '../components/Modal';
import { FormularioBase } from '../components/FormularioBase';
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';

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
    setProcessandoAcao(true);
    try {
      if (categoriaEditando) {
        await categoriaService.atualizar(categoriaEditando.id, formData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.criar(formData);
        toast.success('Categoria criada com sucesso!');
      }
      fecharModal();
      await carregarCategorias();
    } catch (error) {
      toast.error('Erro ao guardar a categoria. Tenta novamente.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDeletar = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Desejas realmente excluir esta categoria?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await categoriaService.deletar(id);
              await carregarCategorias();
              toast.success('Categoria excluída!');
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Erro ao excluir categoria.');
            }
          }}>Excluir</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDeletarLote = () => {
    if (selecionados.length === 0) return;

    if (!isGerente) {
      toast.error('Apenas gerentes podem excluir categorias em lote.');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Excluir {selecionados.length} categoria(s)? Ação irreversível.</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              setCarregando(true);
              await Promise.all(selecionados.map(id => categoriaService.deletar(id)));
              toast.success(`${selecionados.length} categoria(s) excluída(s)!`);
              limparSelecao();
              await carregarCategorias();
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Erro ao excluir algumas categorias.');
              await carregarCategorias();
            } finally {
              setCarregando(false);
            }
          }}>Excluir Selecionadas</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <Layout>
      <div className="er-page">

        <header className="er-page-header">
          <div>
            <h1 className="er-page-title">Gestão de Categorias</h1>
            <p className="er-page-subtitle">Organiza os teus produtos por secções e departamentos.</p>
          </div>
          {isGerente && (
            <button 
              onClick={() => abrirModal()}
              className="er-primary-button"
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
          <div className="er-table-shell">
            <div className="overflow-x-auto">
              <table className="er-table">
                <thead>
                  <tr className="er-table-head">
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
                    <tr key={categoria.id} className={`transition-colors ${isGerente && selecionados.includes(categoria.id) ? 'bg-red-50' : 'er-table-row'}`}>
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

            <Paginacao
              totalItens={categoriasFiltradas.length}
              itensPorPagina={itensPorPagina}
              paginaAtual={paginaAtual}
              setPaginaAtual={setPaginaAtual}
            />
          </div>
        )}

      </div>
      
      <Modal 
        isOpen={modalAberto} 
        onClose={fecharModal} 
        titulo={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
        maxWidth="max-w-md"
      >
        <FormularioBase 
          onSubmit={handleSubmit} 
          processando={processandoAcao}
          textoBotaoSubmit="Guardar Categoria"
        >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria *</label>
                  <input required type="text" maxLength={100} data-testid="categorias-input-nome" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-raiz-verde outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Ferramentas Elétricas" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea rows={3} maxLength={500} data-testid="categorias-textarea-descricao" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-raiz-verde outline-none resize-none" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Furadeiras, serras e equipamentos elétricos" />
                </div>
              </div>
        </FormularioBase>
      </Modal>
    </Layout>
  );
};
