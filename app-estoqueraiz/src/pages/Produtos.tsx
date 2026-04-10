import { useState, useEffect, useRef } from 'react';
import { produtoService, type Produto } from '../services/produtoService';
import { categoriaService, type Categoria } from '../services/categoriaService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { api } from '../services/api';
import { BarraFiltros } from '../components/BarraFiltro';
import { Plus, X,DollarSign, Image as ImageIcon, Filter } from 'lucide-react';
import { BotaoAprovar, BotaoRejeitar, BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';
import { LoadingSpinner } from '../components/Feedbacks';
import { BarraAcoesLote } from '../components/BarraAcoesLote';
import { useSelecaoLote } from '../hooks/useSelecaoLote';
import Layout from '../components/Layout';

export const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const isGerente = usuarioLogado?.cargo === 'gerente';
  const isEstoquista = usuarioLogado?.cargo === 'estoquista';
  const isFinanceiro = usuarioLogado?.cargo === 'financeiro';
  const podeCriar = isGerente || isEstoquista;
  const podeAprovar = isGerente || isFinanceiro;
  const [buscaTexto, setBuscaTexto] = useState('');
  const [statusFiltro, setStatusFiltro] = useState(isFinanceiro ? 'pendente' : 'todos'); // Inicia focado no trabalho do cargo
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false);
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [precosAprovacao, setPrecosAprovacao] = useState({ preco_custo: '', preco_venda: '' });
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [produtoZoom, setProdutoZoom] = useState<Produto | null>(null);
  const { 
    selecionados, 
    alternarSelecao, 
    selecionarTodos, 
    limparSelecao 
  } = useSelecaoLote<number>();


  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [dadosProdutos, dadosCategorias, dadosUnidades] = await Promise.all([
        produtoService.listarTodos(), 
        categoriaService.listarTodas(),
        unidadeService.listarTodas()
      ]);

      setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
      setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
      setUnidades(Array.isArray(dadosUnidades) ? dadosUnidades : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setProdutos([]); 
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
    limparSelecao();
  }, [buscaTexto, statusFiltro, itensPorPagina, limparSelecao]);

  const produtosFiltrados = produtos.filter(p => {
    const matchesNome = p.nome?.toLowerCase().includes(buscaTexto.toLowerCase());
    const matchesStatus = statusFiltro === 'todos' || p.statusProduto === statusFiltro;
    return matchesNome && matchesStatus;
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const handleSubmitProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setProcessandoAcao(true);
    const formData = new FormData(formRef.current);
    try {
      if (produtoAtivo) {
        await produtoService.atualizar(produtoAtivo.id, formData);
        alert('Produto atualizado!');
      } else {
        await produtoService.criar(formData);
        alert('Produto criado! Aguardando aprovação.');
      }
      setModalAberto(false);
      await carregarDados();
    } catch (error) {
      alert('Erro ao salvar.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleAprovar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoAtivo) return;
    setProcessandoAcao(true);
    try {
      await produtoService.aprovar(produtoAtivo.id, {
        preco_custo: Number(precosAprovacao.preco_custo),
        preco_venda: Number(precosAprovacao.preco_venda)
      });
      alert('Produto Aprovado!');
      setModalAprovacaoAberto(false);
      await carregarDados();
    } catch (error) {
      alert('Erro ao aprovar.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleRejeitar = async (id: number) => {
    if (!window.confirm('Rejeitar este produto?')) return;
    try {
      await produtoService.rejeitar(id);
      await carregarDados();
    } catch (error) {
      alert('Erro ao rejeitar.');
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Excluir produto?')) return;
    try {
      await produtoService.deletar(id);
      await carregarDados();
    } catch (error) {
      alert('Erro ao excluir.');
    }
  };

  const handleDeletarLote = async () => {
    if (selecionados.length === 0) return;

    if (!isGerente) {
      alert('Apenas gerentes podem excluir produtos em lote.');
      return;
    }

    if (!window.confirm(`Atenção: Você está prestes a excluir ${selecionados.length} produto(s). Esta ação é irreversível. Deseja continuar?`)) {
      return;
    }

    try {
      setCarregando(true);
      await Promise.all(selecionados.map(id => produtoService.deletar(id)));
      
      alert(`${selecionados.length} produto(s) excluído(s) com sucesso!`);
      limparSelecao();
      await carregarDados();
    } catch (error) {
      alert('Erro ao excluir alguns produtos. A tela será atualizada para exibir o estado atual.');
      await carregarDados();
    } finally {
      setCarregando(false);
    }
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'aprovado') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Aprovado</span>;
    if (status === 'rejeitado') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejeitado</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium animate-pulse">Pendente</span>;
  };

  const handleAlterarImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      // Validar tipo de arquivo
      if (!arquivo.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        e.target.value = '';
        return;
      }

      // Validar tamanho (5MB máximo)
      if (arquivo.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(arquivo);
    } else {
      setImagemPreview(null);
    }
  };

  // Nova função para abrir o modal controlando a imagem
  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setProdutoAtivo(produto);
      if (produto.imagem_url) {
        setImagemPreview(`${api.defaults.baseURL}${produto.imagem_url}`);
      } else {
        setImagemPreview(null);
      }
    } else {
      // É um novo produto, limpa a imagem e os dados
      setProdutoAtivo(null);
      setImagemPreview(null);
      if (formRef.current) {
        const inputFile = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
        if (inputFile) inputFile.value = '';
      }
    }
    setModalAberto(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
            <p className="text-gray-500 mt-2">Gestão centralizada de itens, preços e aprovações.</p>
          </div>

          {/* Botão Novo Produto no Header */}
          {podeCriar && (
            <button 
              onClick={() => abrirModal()} // Simplificado, não precisa setar null aqui
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
            >
              <Plus size={20} /> Novo Produto
            </button>
          )}
        </header>

        {/* BARRA DE FILTROS COM SELETOR DE STATUS INJETADO NO CHILDREN */}
        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Pesquisar por nome do produto..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        >
          {/* Este select entra na prop 'children' da BarraFiltros */}
          <div className="relative md:w-48 shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-gray-50 font-medium"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </div>
        </BarraFiltros>

        {isGerente && (
          <BarraAcoesLote 
            quantidadeSelecionada={selecionados.length}
            onExcluir={handleDeletarLote}
            carregando={carregando}
            textoItem="produto(s)"
          />
        )}

        {carregando ? (
          <LoadingSpinner />
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
                            produtosPaginados.length > 0 && 
                            selecionados.length === produtosPaginados.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              selecionarTodos(produtosPaginados.map(p => p.id));
                            } else {
                              limparSelecao();
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="p-4 font-semibold">Produto</th>
                    <th className="p-4 font-semibold">Estoque</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Venda (R$)</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosPaginados.map((prod) => (
                    <tr key={prod.id} className={`transition-colors ${selecionados.includes(prod.id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      {isGerente && (
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-raiz-verde focus:ring-raiz-verde cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            checked={selecionados.includes(prod.id)}
                            onChange={() => alternarSelecao(prod.id)}
                          />
                        </td>
                      )}
                     <td className="p-4 flex items-center gap-4">
                      {prod.imagem_url ? (
                       
                        <button 
                          onClick={() => setProdutoZoom(prod)}
                          className="group relative flex shrink-0"
                          title="Clique para ampliar"
                        >
                          <img src={`${api.defaults.baseURL}${prod.imagem_url}`} alt={prod.nome} className="w-14 h-14 rounded-lg object-cover border group-hover:opacity-75 transition-opacity" />
                          {/* Ícone de zoom que aparece no hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg text-white">
                            <Plus size={20} />
                          </div>
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon size={28} />
                        </div>
                      )}
                        <div>
                          <p className="font-semibold text-gray-900">{prod.nome}</p>
                          <p className="text-xs text-gray-500">SKU: {prod.codigo_barras || 'Sem código'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="text-sm font-medium text-gray-900">{prod.quantidade_estoque} un</div>
                         <div className="text-xs text-gray-500">Mín: {prod.quantidade_minima || 0}</div>
                      </td>
                      
                      <td className="p-4"><StatusBadge status={prod.statusProduto} /></td>
                      
                      <td className="p-4 text-gray-700 font-semibold">
                        {prod.preco_venda ? `R$ ${Number(prod.preco_venda).toFixed(2)}` : '---'}
                      </td>
                      
                      {/* COLUNA AÇÕES REATORADA COM OS COMPONENTES */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {podeAprovar && prod.statusProduto === 'pendente' && (
                            <>
                              <BotaoAprovar 
                                onClick={() => { setProdutoAtivo(prod); setModalAprovacaoAberto(true); }} 
                                title="Aprovar e Precificar" 
                              />
                              <BotaoRejeitar 
                                onClick={() => handleRejeitar(prod.id)} 
                                title="Rejeitar Produto" 
                              />
                            </>
                          )}
                          
                          {/* Botão de Edição visível para Gerente sempre, ou Financeiro/Estoquista conforme sua regra */}
                          {(isGerente || isEstoquista || (isFinanceiro && prod.statusProduto === 'aprovado')) && (
                            <BotaoEditar 
                              onClick={() => { setProdutoAtivo(prod); setModalAberto(true); }} 
                              title="Editar Informações" 
                            />
                          )}

                          {isGerente && (
                            <BotaoDeletar 
                              onClick={() => handleDeletar(prod.id)} 
                              title="Excluir Produto" 
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {produtosFiltrados.length === 0 && (
                    <tr><td colSpan={isGerente ? 6 : 5} className="p-12 text-center text-gray-400 italic">Nenhum produto corresponde aos filtros aplicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between sm:px-6">
              <p className="text-sm text-gray-700">Mostrando {produtosFiltrados.length} itens - Página {paginaAtual} de {totalPaginas}</p>
              <nav className="inline-flex -space-x-px shadow-sm rounded-md">
                <button onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} disabled={paginaAtual === 1} className="px-4 py-2 border bg-white rounded-l-md hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                <button onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="px-4 py-2 border bg-white rounded-r-md hover:bg-gray-50 disabled:opacity-50">Próxima</button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CRIAR / EDITAR */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold">{produtoAtivo ? `Editando: ${produtoAtivo.nome}` : 'Novo Produto'}</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form ref={formRef} onSubmit={handleSubmitProduto} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input required name="nome" maxLength={150} defaultValue={produtoAtivo?.nome} type="text" data-testid="produtos-input-nome" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria *</label>
                <select required name="categoria_id" data-testid="produtos-select-categoria" defaultValue={produtoAtivo?.categoria_id} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidade *</label>
                <select required name="unidade_id" data-testid="produtos-select-unidade" defaultValue={produtoAtivo?.unidade_id} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Selecione...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estoque Inicial *</label>
                <input required name="quantidade_estoque" defaultValue={produtoAtivo?.quantidade_estoque} type="number" data-testid="produtos-input-estoque" className="w-full px-4 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                <input name="quantidade_minima" defaultValue={produtoAtivo?.quantidade_minima} type="number" data-testid="produtos-input-estoque-minimo" className="w-full px-4 py-2 border rounded-lg outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-indigo-400 transition-colors">
                  
                  {/* Área de Preview */}
                  {(imagemPreview || (produtoAtivo && produtoAtivo.imagem_url)) ? (
                    <img 
                      src={imagemPreview || `${api.defaults.baseURL}${produtoAtivo?.imagem_url}`} 
                      alt="Preview" 
                      className="w-28 h-28 rounded-lg object-cover border-2 border-white shadow-md shrink-0" 
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-lg bg-gray-200 flex flex-col items-center justify-center text-gray-500 shrink-0 border border-gray-300">
                      <ImageIcon size={40} className="mb-1" />
                      <span className="text-xs">Sem foto</span>
                    </div>
                  )}

                  {/* Input File Real */}
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-xs text-gray-600">Selecione uma imagem (JPG, PNG) de até 5MB.</p>
                    <input 
                      name="imagem" 
                      type="file" 
                      accept="image/*" 
                      data-testid="produtos-input-imagem"
                      onChange={handleAlterarImagem} // Chama a nossa função de preview
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 mt-4 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setModalAberto(false)} className="px-5 py-2 border rounded-lg font-medium">Cancelar</button>
                <button type="submit" disabled={processandoAcao} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50">
                  {processandoAcao ? 'Gravando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APROVAÇÃO */}
      {modalAprovacaoAberto && produtoAtivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between bg-green-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-green-800 flex items-center gap-2"><DollarSign /> Aprovar Item</h2>
              <button onClick={() => setModalAprovacaoAberto(false)} className="text-green-700 hover:text-green-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleAprovar} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Defina a precificação para ativar o item no catálogo comercial.</p>
              <div>
                <label className="block text-sm font-medium mb-1">Custo Unitário (R$)</label>
                <input required type="number" step="0.01" value={precosAprovacao.preco_custo} onChange={e => setPrecosAprovacao({...precosAprovacao, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venda Unitária (R$)</label>
                <input required type="number" step="0.01" value={precosAprovacao.preco_venda} onChange={e => setPrecosAprovacao({...precosAprovacao, preco_venda: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
              </div>
              <button type="submit" disabled={processandoAcao} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-700 transition-all disabled:opacity-50">
                {processandoAcao ? 'Aprovando...' : 'Finalizar e Aprovar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {produtoZoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" 
          onClick={() => setProdutoZoom(null)}
        >
          {/* Botão de Fechar Solto na Tela */}
          <button 
            type="button" 
            onClick={() => setProdutoZoom(null)} 
            className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors z-10"
          >
            <X size={28} />
          </button>
          
          {/* Container para imagem com fallback */}
          <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
            <img 
              key={produtoZoom.id}
              src={`${api.defaults.baseURL}${produtoZoom.imagem_url}`} 
              alt="Zoom Produto" 
              onClick={e => e.stopPropagation()} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
            />
            {/* Fallback placeholder */}
            <div className="hidden flex-col items-center justify-center bg-gray-100 rounded-xl text-gray-500 p-8 max-w-md">
              <ImageIcon size={64} className="mb-4" />
              <p className="text-lg font-medium">Imagem não disponível</p>
              <p className="text-sm text-gray-400 text-center mt-2">O arquivo pode ter sido removido ou corrompido</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
