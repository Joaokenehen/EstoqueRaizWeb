import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  FileText,
  Plus,
  Settings,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
} from 'lucide-react';
import { LoadingSpinner } from '../components/Feedbacks';
import Layout from '../components/Layout';
import { movimentacaoService, type Movimentacao } from '../services/movimentacaoService';
import { produtoService, type Produto } from '../services/produtoService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { fornecedorService, type Fornecedor } from '../services/fornecedorService';
import { usuarioService, type Usuario } from '../services/usuarioService';
import { BarraFiltros } from '../components/BarraFiltro';
import { Modal } from '../components/Modal';
import { FormularioBase } from '../components/FormularioBase';
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';

type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';

type CampoOrdenacao = 'data_movimentacao' | 'tipo' | 'produto' | 'quantidade' | null;
type DirecaoOrdenacao = 'asc' | 'desc';

export const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const isEstoquista = usuarioLogado?.cargo === 'estoquista';
  const isGerente = usuarioLogado?.cargo === 'gerente';

  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacao>('data_movimentacao');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>('desc');
  const [movimentacaoDetalhe, setMovimentacaoDetalhe] = useState<Movimentacao | null>(null);

  const [form, setForm] = useState({
    tipo: 'ENTRADA' as TipoMovimentacao,
    produto_id: '',
    quantidade: '',
    documento: '',
    observacao: '',
    unidade_origem_id: '',
    unidade_destino_id: '',
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [dadosMov, dadosProd, dadosUnid, dadosForn, dadosUsr] = await Promise.all([
        movimentacaoService.listarTodas(),
        produtoService.listarTodos(),
        unidadeService.listarTodas(),
        fornecedorService.listarTodos(),
        isGerente ? usuarioService.listarTodos().catch(() => []) : Promise.resolve([]),
      ]);

      setMovimentacoes(Array.isArray(dadosMov) ? dadosMov : []);

      const produtosAprovados = Array.isArray(dadosProd)
        ? dadosProd.filter((produto) => produto.statusProduto === 'aprovado')
        : [];

      setProdutos(
        isEstoquista
          ? produtosAprovados.filter((produto) => produto.unidade_id === usuarioLogado?.unidade_id)
          : produtosAprovados
      );

      setUnidades(Array.isArray(dadosUnid) ? dadosUnid : []);
      setFornecedores(Array.isArray(dadosForn) ? dadosForn : []);
      setUsuarios(Array.isArray(dadosUsr) ? dadosUsr : []);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, dataInicio, dataFim, itensPorPagina]);

  const handleSubmit = async (e: React.FormEvent) => {
    setProcessando(true);

    if (form.tipo === 'SAIDA' || form.tipo === 'TRANSFERENCIA') {
      const produtoSelecionado = produtos.find(p => p.id === Number(form.produto_id));
      const qtdDesejada = Number(form.quantidade);
      
      if (produtoSelecionado && qtdDesejada > (produtoSelecionado.quantidade_estoque || 0)) {
        toast.error(`Estoque insuficiente! O produto possui apenas ${produtoSelecionado.quantidade_estoque || 0} un. disponíveis.`);
        setProcessando(false);
        return;
      }
    }

    const payload = {
      tipo: form.tipo,
      produto_id: Number(form.produto_id),
      quantidade: Number(form.quantidade),
      documento: form.documento || undefined,
      observacao: form.observacao || undefined,
      unidade_origem_id: form.unidade_origem_id ? Number(form.unidade_origem_id) : undefined,
      unidade_destino_id: form.unidade_destino_id ? Number(form.unidade_destino_id) : undefined,
    };

    try {
      await movimentacaoService.registrarMovimentacao(payload);
      toast.success(`Movimentação de ${form.tipo} registrada com sucesso!`);
      setModalAberto(false);
      setForm({ ...form, quantidade: '', documento: '', observacao: '' });
      await carregarDados();
    } catch (error) {
      const mensagemErro =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao registrar movimentação. Verifique os dados informados.';

      toast.error(mensagemErro);
      console.error(error);
    } finally {
      setProcessando(false);
    }
  };

  const renderBadgeTipo = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-bold w-max">
            <ArrowUpRight size={14} /> ENTRADA
          </span>
        );
      case 'SAIDA':
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-bold w-max">
            <ArrowDownRight size={14} /> SAÍDA
          </span>
        );
      case 'TRANSFERENCIA':
        return (
          <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded-md text-xs font-bold w-max">
            <ArrowRightLeft size={14} /> TRANSF
          </span>
        );
      case 'AJUSTE':
        return (
          <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded-md text-xs font-bold w-max">
            <Settings size={14} /> AJUSTE
          </span>
        );
      default:
        return <span>{tipo}</span>;
    }
  };

  const produtosDisponiveis = produtos.filter((produto) => {
    if (form.tipo === 'ENTRADA') {
      return form.unidade_destino_id
        ? produto.unidade_id === Number(form.unidade_destino_id)
        : true;
    }

    return form.unidade_origem_id
      ? produto.unidade_id === Number(form.unidade_origem_id)
      : true;
  });

  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
  const termo = filtro.toLowerCase();
  const docMatches = mov.documento?.toLowerCase().includes(termo) || false;
  const nomeProduto = mov.Produto?.nome || produtos.find(p => p.id === mov.produto_id)?.nome || '';
  const prodMatches = nomeProduto.toLowerCase().includes(termo);
  const obsMatches = mov.observacao?.toLowerCase().includes(termo) || false;
  
  const matchTexto = docMatches || prodMatches || obsMatches;

  let matchData = true;
  if (dataInicio || dataFim) {
    const dataMov = new Date(mov.data_movimentacao);
    
    if (dataInicio) {
      const dataIn = new Date(`${dataInicio}T00:00:00`);
      if (dataMov < dataIn) matchData = false;
    }
    
    if (dataFim) {
      const dataOut = new Date(`${dataFim}T23:59:59.999`);
      if (dataMov > dataOut) matchData = false;
    }
  }

  return matchTexto && matchData;
});

  const handleOrdenar = (campo: CampoOrdenacao) => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
  };

  const renderIconeOrdenacao = (campo: CampoOrdenacao) => {
    if (campoOrdenacao !== campo) return <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return direcaoOrdenacao === 'asc' ? <ChevronUp size={14} className="text-raiz-verde" /> : <ChevronDown size={14} className="text-raiz-verde" />;
  };

  const movimentacoesOrdenadas = [...movimentacoesFiltradas].sort((a, b) => {
    if (!campoOrdenacao) return 0;
    let valorA: any; let valorB: any;
    switch (campoOrdenacao) {
      case 'data_movimentacao': valorA = new Date(a.data_movimentacao).getTime(); valorB = new Date(b.data_movimentacao).getTime(); break;
      case 'tipo': valorA = a.tipo; valorB = b.tipo; break;
      case 'produto': valorA = a.Produto?.nome || produtos.find(p => p.id === a.produto_id)?.nome || ''; valorB = b.Produto?.nome || produtos.find(p => p.id === b.produto_id)?.nome || ''; break;
      case 'quantidade': valorA = a.quantidade; valorB = b.quantidade; break;
      default: return 0;
    }
    if (valorA < valorB) return direcaoOrdenacao === 'asc' ? -1 : 1;
    if (valorA > valorB) return direcaoOrdenacao === 'asc' ? 1 : -1;
    return 0;
  });

  const movimentacoesPaginadas = movimentacoesOrdenadas.slice(
    (paginaAtual - 1) * itensPorPagina, 
    paginaAtual * itensPorPagina
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Movimentações de Estoque</h1>
            <p className="text-gray-500 mt-2">Gestão de entradas, saídas e transferências.</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            disabled={carregando}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-white ${carregando ? 'bg-green-400 cursor-not-allowed' : 'bg-raiz-verde hover:opacity-90'}`}
          >
            <Plus size={20} /> Registrar Movimento
          </button>
        </header>

        <BarraFiltros 
          buscaTexto={filtro} 
          onBuscaChange={setFiltro} 
          placeholderBusca="Buscar por NF, Produto ou Observação..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-raiz-verde outline-none text-gray-600 bg-white"
              title="Data inicial"
            />
            <span className="text-gray-400 text-sm hidden sm:block">até</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-raiz-verde outline-none text-gray-600 bg-white"
              title="Data final"
            />
          </div>
        </BarraFiltros>

        {carregando ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('data_movimentacao')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Data {renderIconeOrdenacao('data_movimentacao')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('tipo')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Tipo {renderIconeOrdenacao('tipo')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('produto')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Produto {renderIconeOrdenacao('produto')}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">
                      <button onClick={() => handleOrdenar('quantidade')} className="flex items-center gap-1 hover:text-gray-900 group font-semibold">
                        Qtd {renderIconeOrdenacao('quantidade')}
                      </button>
                    </th>
                    {isGerente && <th className="p-4 font-semibold">Responsável</th>}
                    <th className="p-4 font-semibold">Doc / Obs</th>
                    <th className="p-4 font-semibold text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  
                  {movimentacoesPaginadas.map((movimentacao) => (
                    <tr key={movimentacao.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')} <br />
                        <span className="text-xs text-gray-400">
                          {new Date(movimentacao.data_movimentacao).toLocaleTimeString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-4">{renderBadgeTipo(movimentacao.tipo)}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {movimentacao.produto?.nome || movimentacao.Produto?.nome || produtos.find(p => p.id === movimentacao.produto_id)?.nome || `Prod #${movimentacao.produto_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movimentacao.unidade_origem_id && `De: ${unidades.find(u => u.id === movimentacao.unidade_origem_id)?.nome || `Unidade #${movimentacao.unidade_origem_id}`}`}
                          {movimentacao.unidade_origem_id && movimentacao.unidade_destino_id && ' | '}
                          {movimentacao.unidade_destino_id && `Para: ${unidades.find(u => u.id === movimentacao.unidade_destino_id)?.nome || `Unidade #${movimentacao.unidade_destino_id}`}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5" title="Fornecedor do Produto">
                          <span className="font-semibold">Forn:</span> {fornecedores.find(f => f.id === Number(produtos.find(p => p.id === movimentacao.produto_id)?.fornecedor_id ?? movimentacao.produto?.fornecedor_id ?? ''))?.nome_fantasia || 'Não Mapeado'}
                        </p>
                      </td>
                      <td className="p-4 text-gray-900 font-bold">{movimentacao.quantidade}</td>
                      {isGerente && (
                        <td className="p-4 text-sm text-gray-700 font-medium">
                          {usuarios.find(u => u.id === movimentacao.usuario_id)?.nome || `Usuário #${movimentacao.usuario_id}`}
                        </td>
                      )}
                      <td className="p-4 text-sm text-gray-600">
                        {movimentacao.documento && (
                          <div className="flex items-center gap-1 text-raiz-verde">
                            <FileText size={14} /> {movimentacao.documento}
                          </div>
                        )}
                        <div
                          className="truncate max-w-[200px]"
                          title={movimentacao.observacao}
                        >
                          {movimentacao.observacao || '---'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setMovimentacaoDetalhe(movimentacao)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex"
                          title="Ver Detalhes Completos"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {movimentacoesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        {filtro !== '' || dataInicio !== '' || dataFim !== ''
                          ? 'Nenhuma movimentação encontrada para estes filtros.' 
                          : 'Nenhuma movimentação registrada no histórico.'}
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
            <Paginacao
              totalItens={movimentacoesFiltradas.length}
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
        titulo="Nova Movimentação" 
        maxWidth="max-w-2xl"
      >
        <FormularioBase 
          onSubmit={handleSubmit} 
          processando={processando} 
          textoBotaoSubmit="Confirmar e Gravar Movimento"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual operação deseja realizar?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE'] as TipoMovimentacao[]).map(
                (tipo) => (
                  <label
                    key={tipo}
                    className={`flex items-center justify-center py-2 px-1 border rounded-lg cursor-pointer text-xs font-bold transition-all ${
                      form.tipo === tipo
                        ? 'bg-raiz-verde text-white border-raiz-verde shadow-md'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo}
                      checked={form.tipo === tipo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tipo: e.target.value as TipoMovimentacao,
                          produto_id: '',
                          unidade_origem_id: '',
                          unidade_destino_id: '',
                        })
                      }
                      className="sr-only"
                    />
                    {tipo}
                  </label>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {(form.tipo === 'SAIDA' || form.tipo === 'TRANSFERENCIA' || form.tipo === 'AJUSTE') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Origem *
                </label>
                <select
                  required
                  value={form.unidade_origem_id}
                  onChange={(e) =>
                    setForm({ ...form, unidade_origem_id: e.target.value, produto_id: '' })
                  }
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde ${
                    isEstoquista ? 'bg-gray-100 text-gray-600' : 'bg-white'
                  }`}
                >
                  <option value="">Retirar de...</option>
                  {unidades
                    .filter((unidade) => !isEstoquista || unidade.id === usuarioLogado?.unidade_id)
                    .map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {(form.tipo === 'ENTRADA' || form.tipo === 'TRANSFERENCIA') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Destino *
                </label>
                <select
                  required
                  value={form.unidade_destino_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unidade_destino_id: e.target.value,
                      produto_id: form.tipo === 'ENTRADA' ? '' : form.produto_id,
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde ${
                    isEstoquista && form.tipo === 'ENTRADA'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-white'
                  }`}
                >
                  <option value="">Enviar para...</option>
                  {unidades
                    .filter(
                      (unidade) =>
                        !(isEstoquista && form.tipo === 'ENTRADA') ||
                        unidade.id === usuarioLogado?.unidade_id
                    )
                    .map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto (Aprovados) *
              </label>
              <select
                required
                value={form.produto_id}
                onChange={(e) => setForm({ ...form, produto_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  (form.tipo === 'ENTRADA' && !form.unidade_destino_id) ||
                  (form.tipo !== 'ENTRADA' && !form.unidade_origem_id)
                }
              >
                <option value="">
                  {(form.tipo === 'ENTRADA' && !form.unidade_destino_id) ||
                  (form.tipo !== 'ENTRADA' && !form.unidade_origem_id)
                    ? 'Selecione uma unidade primeiro...'
                    : 'Selecione o Item...'}
                </option>
                {produtosDisponiveis.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} (Estoque: {produto.quantidade_estoque})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                required
                type="number"
                min="1"
                data-testid="movimentacoes-input-quantidade"
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                placeholder="Ex: 50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento / NF
              </label>
              <input
                type="text"
                maxLength={50}
                data-testid="movimentacoes-input-documento"
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                placeholder="Ex: NF-123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <input
                type="text"
                maxLength={500}
                data-testid="movimentacoes-input-observacao"
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                placeholder="Motivo da movimentação"
              />
            </div>
          </div>
        </FormularioBase>
      </Modal>

      <Modal 
        isOpen={!!movimentacaoDetalhe} 
        onClose={() => setMovimentacaoDetalhe(null)} 
        titulo="Detalhes da Movimentação" 
        maxWidth="max-w-lg"
      >
        {movimentacaoDetalhe && (
          (() => {
            const produtoMov = produtos.find(p => p.id === movimentacaoDetalhe.produto_id);
          const fornecedorId = produtoMov?.fornecedor_id ?? movimentacaoDetalhe.produto?.fornecedor_id;
          const fornecedor = fornecedores.find(f => f.id === Number(fornecedorId));
            return (
          <div className="p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Produto Movimentado</p>
                <p className="text-lg font-bold text-gray-900">{movimentacaoDetalhe.Produto?.nome || produtos.find(p => p.id === movimentacaoDetalhe.produto_id)?.nome || `Produto #${movimentacaoDetalhe.produto_id}`}</p>
              </div>
              <div className="mt-1">
                {renderBadgeTipo(movimentacaoDetalhe.tipo)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Data e Hora</p>
                <p className="text-gray-900 font-medium">
                  {new Date(movimentacaoDetalhe.data_movimentacao).toLocaleDateString('pt-BR')} <span className="text-gray-400 font-normal">às {new Date(movimentacaoDetalhe.data_movimentacao).toLocaleTimeString('pt-BR')}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Quantidade</p>
                <p className="text-gray-900 font-bold">{movimentacaoDetalhe.quantidade} un</p>
              </div>

              {(movimentacaoDetalhe.tipo === 'SAIDA' || movimentacaoDetalhe.tipo === 'TRANSFERENCIA' || movimentacaoDetalhe.tipo === 'AJUSTE') && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">
                    {movimentacaoDetalhe.tipo === 'SAIDA' ? 'Retirado de' : 
                     movimentacaoDetalhe.tipo === 'AJUSTE' ? 'Unidade do Ajuste' : 
                     'Unidade de Origem'}
                  </p>
                  <p className="text-gray-900 font-medium">{unidades.find(u => u.id === movimentacaoDetalhe.unidade_origem_id)?.nome || <span className="text-gray-400 italic font-normal">Não informada</span>}</p>
                </div>
              )}

              {(movimentacaoDetalhe.tipo === 'ENTRADA' || movimentacaoDetalhe.tipo === 'TRANSFERENCIA') && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">
                    {movimentacaoDetalhe.tipo === 'ENTRADA' ? 'Enviado para' : 'Unidade de Destino'}
                  </p>
                  <p className="text-gray-900 font-medium">{unidades.find(u => u.id === movimentacaoDetalhe.unidade_destino_id)?.nome || <span className="text-gray-400 italic font-normal">Não informada</span>}</p>
                </div>
              )}

              {isGerente && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-1">Usuário Responsável</p>
                  <p className="text-gray-900 font-medium">{usuarios.find(u => u.id === movimentacaoDetalhe.usuario_id)?.nome || `Usuário #${movimentacaoDetalhe.usuario_id}`}</p>
                </div>
              )}
            </div>

            {produtoMov && (
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Fornecedor Preferencial</p>
                <p className="text-gray-900 font-medium">{fornecedor ? (fornecedor.nome_fantasia || fornecedor.razao_social) : <span className="text-gray-400 italic font-normal">Diversos / Não Mapeado</span>}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Documento / NF</p>
              {movimentacaoDetalhe.documento ? (
                <div className="flex items-center gap-2 text-raiz-verde font-medium bg-green-50 p-2 rounded-lg w-max">
                  <FileText size={16} /> {movimentacaoDetalhe.documento}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Sem documento vinculado</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Observação</p>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {movimentacaoDetalhe.observacao || <span className="italic text-gray-400">Nenhuma observação registrada para esta movimentação.</span>}
              </div>
            </div>
          </div>
            );
          })()
        )}
      </Modal>
    </Layout>
  );
};
