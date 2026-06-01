import { useState, useEffect, useRef } from 'react';
import { produtoService, type Produto } from '../services/produtoService';
import { categoriaService, type Categoria } from '../services/categoriaService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { api } from '../services/api';
import { BarraFiltros } from '../components/BarraFiltro';
import { Plus, X, Image as ImageIcon, Filter, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';
import { LoadingSpinner } from '../components/Feedbacks';
import { BarraAcoesLote } from '../components/BarraAcoesLote';
import { useSelecaoLote } from '../hooks/useSelecaoLote';
import Layout from '../components/Layout';
import { Modal } from '../components/Modal';
import { FormularioBase } from '../components/FormularioBase';
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';

type CampoOrdenacaoProdutos = 'nome' | 'quantidade_estoque' | 'preco_venda' | 'statusProduto' | null;

export const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const isGerente = usuarioLogado?.cargo === 'gerente';
  const isEstoquista = usuarioLogado?.cargo === 'estoquista';
  const podeCriar = isGerente || isEstoquista;
  const [buscaTexto, setBuscaTexto] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [produtoZoom, setProdutoZoom] = useState<Produto | null>(null);
  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacaoProdutos>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc');
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

  const handleOrdenar = (campo: CampoOrdenacaoProdutos) => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
  };

  const renderIconeOrdenacao = (campo: CampoOrdenacaoProdutos) => {
    if (campoOrdenacao !== campo) return <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return direcaoOrdenacao === 'asc' ? <ChevronUp size={14} className="text-raiz-verde" /> : <ChevronDown size={14} className="text-raiz-verde" />;
  };

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (!campoOrdenacao) return 0;
    let valorA: any = a[campoOrdenacao];
    let valorB: any = b[campoOrdenacao];
    if (campoOrdenacao === 'nome' || campoOrdenacao === 'statusProduto') {
      valorA = String(valorA || '').toLowerCase();
      valorB = String(valorB || '').toLowerCase();
    } else {
      valorA = Number(valorA || 0);
      valorB = Number(valorB || 0);
    }
    if (valorA < valorB) return direcaoOrdenacao === 'asc' ? -1 : 1;
    if (valorA > valorB) return direcaoOrdenacao === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosOrdenados.length / itensPorPagina));
  const produtosPaginados = produtosOrdenados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const handleSubmitProduto = async (e: React.FormEvent) => {
    setProcessandoAcao(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const dataValidadeStr = formData.get('data_validade') as string;
    if (dataValidadeStr) {
      const dataValidade = new Date(dataValidadeStr + 'T00:00:00');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataValidade <= hoje) {
        toast.error('A data de validade deve ser uma data futura.');
        setProcessandoAcao(false);
        return;
      }
    }

    try {
      if (produtoAtivo) {
        await produtoService.atualizar(produtoAtivo.id, formData);
        toast.success('Produto atualizado!');
      } else {
        await produtoService.criar(formData);
        toast.success('Produto criado! Aguardando aprovação.');
      }
      setModalAberto(false);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDeletar = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Desejas realmente excluir este produto?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await produtoService.deletar(id);
              await carregarDados();
              toast.success('Produto excluído!');
            } catch (error) {
              toast.error('Erro ao excluir.');
            }
          }}>Excluir</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleDeletarLote = () => {
    if (selecionados.length === 0) return;

    if (!isGerente) {
      toast.error('Apenas gerentes podem excluir produtos em lote.');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Excluir {selecionados.length} produto(s)? Ação irreversível.</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              setCarregando(true);
              await Promise.all(selecionados.map(id => produtoService.deletar(id)));
              toast.success(`${selecionados.length} produto(s) excluído(s)!`);
              limparSelecao();
              await carregarDados();
            } catch (error) {
              toast.error('Erro ao excluir alguns produtos.');
              await carregarDados();
            } finally {
              setCarregando(false);
            }
          }}>Excluir Selecionados</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'aprovado') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Aprovado</span>;
    if (status === 'rejeitado') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejeitado</span>;
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium animate-pulse">Pendente</span>;
  };

  const handleAlterarImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      if (!arquivo.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        e.target.value = '';
        return;
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.');
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

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setProdutoAtivo(produto);
      if (produto.imagem_url) {
        setImagemPreview(`${api.defaults.baseURL}${produto.imagem_url}`);
      } else {
        setImagemPreview(null);
      }
    } else {
      setProdutoAtivo(null);
      setImagemPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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

          {podeCriar && (
            <button 
          onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-raiz-verde text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={20} /> Novo Produto
            </button>
          )}
        </header>

        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Pesquisar por nome do produto..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        >
          <div className="relative md:w-48 shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-raiz-verde outline-none text-sm appearance-none bg-gray-50 font-medium"
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
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('nome')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Produto {renderIconeOrdenacao('nome')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('quantidade_estoque')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Estoque {renderIconeOrdenacao('quantidade_estoque')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('statusProduto')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Status {renderIconeOrdenacao('statusProduto')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('preco_venda')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Venda (R$) {renderIconeOrdenacao('preco_venda')}
                      </button>
                    </th>
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
                         {prod.data_validade && (
                           <div className={`text-[10px] mt-1 font-bold ${
                              new Date(prod.data_validade) < new Date() ? 'text-red-600' :
                              new Date(prod.data_validade) <= new Date(new Date().setDate(new Date().getDate() + 30)) ? 'text-amber-600' : 
                              'text-gray-400'
                           }`}>
                             {new Date(prod.data_validade) < new Date() ? 'Vencido: ' : 'Vence: '} {new Date(prod.data_validade).toLocaleDateString('pt-BR')}
                           </div>
                         )}
                      </td>
                      
                      <td className="p-4"><StatusBadge status={prod.statusProduto} /></td>
                      
                      <td className="p-4 text-gray-700 font-semibold">
                        {prod.preco_venda ? `R$ ${Number(prod.preco_venda).toFixed(2)}` : '---'}
                      </td>
                      
                      {/* COLUNA AÇÕES REATORADA COM OS COMPONENTES */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {(isGerente || isEstoquista) && (
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

            <Paginacao
              totalItens={produtosFiltrados.length}
              itensPorPagina={itensPorPagina}
              paginaAtual={paginaAtual}
              setPaginaAtual={setPaginaAtual}
            />
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        titulo={produtoAtivo ? 'Editar Produto' : 'Novo Produto'}
        maxWidth="max-w-2xl"
      >
        <FormularioBase 
          onSubmit={handleSubmitProduto} 
          processando={processandoAcao}
        testId="form-produto"
          textoBotaoSubmit="Salvar Alterações"
        >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                <input required name="nome" type="text" data-testid="produtos-input-nome" defaultValue={produtoAtivo?.nome} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                  <input name="codigo_barras" type="text" data-testid="produtos-input-codigo" defaultValue={produtoAtivo?.codigo_barras} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd Mínima</label>
                  <input name="quantidade_minima" type="number" data-testid="produtos-input-estoque" defaultValue={produtoAtivo?.quantidade_minima} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                  <input name="lote" type="text" data-testid="produtos-input-lote" defaultValue={produtoAtivo?.lote} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" placeholder="Ex: LOTE-2023" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                  <input name="data_validade" type="date" data-testid="produtos-input-validade" defaultValue={produtoAtivo?.data_validade ? new Date(produtoAtivo.data_validade).toISOString().split('T')[0] : ''} min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select required name="categoria_id" data-testid="produtos-select-categoria" defaultValue={produtoAtivo?.categoria_id} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde">
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Base *</label>
                  <select required name="unidade_id" data-testid="produtos-select-unidade" defaultValue={produtoAtivo?.unidade_id} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Selecione...</option>
                    
                    {unidades
                      .filter((u) => !isEstoquista || u.id === usuarioLogado?.unidade_id)
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))
                    }

                  </select>
                </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea name="descricao" data-testid="produtos-input-descricao" defaultValue={produtoAtivo?.descricao} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" rows={3} />
              </div>
            </div>
            
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">Foto do Produto</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {(imagemPreview || produtoAtivo?.imagem_url) ? (
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

                <div className="flex-1 w-full space-y-2">
                  <p className="text-xs text-gray-600">Selecione uma imagem (JPG, PNG) de até 5MB.</p>
                  <input 
                    name="imagem" 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    data-testid="produtos-input-imagem"
                    onChange={handleAlterarImagem} 
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
        </FormularioBase>
      </Modal>

      {produtoZoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" 
          onClick={() => setProdutoZoom(null)}
          data-testid="produtos-modal-zoom"
        >
          <button 
            type="button" 
            onClick={() => setProdutoZoom(null)} 
            className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors z-10"
            data-testid="produtos-modal-zoom-close-btn"
          >
            <X size={28} />
          </button>
          
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
