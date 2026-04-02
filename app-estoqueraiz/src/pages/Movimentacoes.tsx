import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  FileText,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '../components/Feedbacks';
import Layout from '../components/Layout';
import { movimentacaoService, type Movimentacao } from '../services/movimentacaoService';
import { produtoService, type Produto } from '../services/produtoService';
import { unidadeService, type Unidade } from '../services/unidadeService';

type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA' | 'AJUSTE';

export const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [processando, setProcessando] = useState(false);

  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const isEstoquista = usuarioLogado?.cargo === 'estoquista';

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
      const [dadosMov, dadosProd, dadosUnid] = await Promise.all([
        movimentacaoService.listarTodas(),
        produtoService.listarTodos(),
        unidadeService.listarTodas(),
      ]);

      setMovimentacoes(Array.isArray(dadosMov) ? dadosMov : []);

      // O estoquista só pode operar com produtos aprovados da própria unidade.
      const produtosAprovados = Array.isArray(dadosProd)
        ? dadosProd.filter((produto) => produto.statusProduto === 'aprovado')
        : [];

      setProdutos(
        isEstoquista
          ? produtosAprovados.filter((produto) => produto.unidade_id === usuarioLogado?.unidade_id)
          : produtosAprovados
      );

      setUnidades(Array.isArray(dadosUnid) ? dadosUnid : []);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessando(true);

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
      alert(`Movimentação de ${form.tipo} registrada com sucesso!`);
      setModalAberto(false);
      setForm({ ...form, quantidade: '', documento: '', observacao: '' });
      await carregarDados();
    } catch (error) {
      const mensagemErro =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao registrar movimentação. Verifique os dados informados.';

      alert(mensagemErro);
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
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} /> Registrar Movimento
          </button>
        </header>

        {carregando ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold">Tipo</th>
                    <th className="p-4 font-semibold">Produto</th>
                    <th className="p-4 font-semibold">Qtd</th>
                    <th className="p-4 font-semibold">Doc / Obs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movimentacoes.map((movimentacao) => (
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
                          {movimentacao.Produto?.nome || `Prod #${movimentacao.produto_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movimentacao.UnidadeOrigem && `De: ${movimentacao.UnidadeOrigem.nome}`}
                          {movimentacao.UnidadeOrigem && movimentacao.UnidadeDestino && ' | '}
                          {movimentacao.UnidadeDestino && `Para: ${movimentacao.UnidadeDestino.nome}`}
                        </p>
                      </td>
                      <td className="p-4 text-gray-900 font-bold">{movimentacao.quantidade}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {movimentacao.documento && (
                          <div className="flex items-center gap-1 text-indigo-600">
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
                    </tr>
                  ))}
                  {movimentacoes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Nenhuma movimentação registrada no histórico.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Nova Movimentação</h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
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
                      className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                      className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Motivo da movimentação"
                  />
                </div>
              </div>

              <div className="pt-4 mt-6">
                <button
                  type="submit"
                  disabled={processando}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {processando ? 'Processando...' : 'Confirmar e Gravar Movimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
