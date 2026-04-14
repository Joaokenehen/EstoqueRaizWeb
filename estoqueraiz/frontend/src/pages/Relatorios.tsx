import { useState, useEffect, useMemo } from 'react';
import { relatorioService, type ResultadoCurvaABC, type ResultadoEstatisticas } from '../services/relatorioService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { TrendingUp, Filter, FileSpreadsheet } from 'lucide-react';
import { LoadingSpinner, MensagemErro } from '../components/Feedbacks';
import Layout from '../components/Layout';

export const Relatorios = () => {
  const [dados, setDados] = useState<ResultadoCurvaABC | null>(null);
  const [estatisticas, setEstatisticas] = useState<ResultadoEstatisticas | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [unidadeId, setUnidadeId] = useState('');

  useEffect(() => {
    const carregarUnidades = async () => {
      try {
        const res = await unidadeService.listarTodas();
        setUnidades(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Erro ao carregar unidades', e);
      }
    };
    carregarUnidades();
    gerarRelatorio();
  }, []);

  const gerarRelatorio = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      const filtros = {
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        unidade_id: unidadeId ? Number(unidadeId) : undefined
      };

      const [resultadoCurva, resultadoEstatisticas] = await Promise.all([
        relatorioService.gerarCurvaABC(filtros),
        relatorioService.obterEstatisticasGerais(filtros.unidade_id)
      ]);

      setDados(resultadoCurva);
      setEstatisticas(resultadoEstatisticas);
    } catch (error) {
      setErro('Não foi possível gerar o relatório. Tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const tendenciaMensal = useMemo(() => {
    if (!estatisticas?.movimentacoes_por_mes?.length) return [];

    const agregado = estatisticas.movimentacoes_por_mes.reduce((acc: Record<string, any>, item: any) => {
      const data = new Date(item.mes);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const total = Number(item.total || 0);

      if (!acc[chave]) {
        acc[chave] = {
          chave,
          label: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          total: 0,
          entrada: 0,
          saida: 0,
          transferencia: 0,
          ajuste: 0
        };
      }

      acc[chave].total += total;

      if (item.tipo === 'ENTRADA') acc[chave].entrada += total;
      if (item.tipo === 'SAIDA') acc[chave].saida += total;
      if (item.tipo === 'TRANSFERENCIA') acc[chave].transferencia += total;
      if (item.tipo === 'AJUSTE') acc[chave].ajuste += total;

      return acc;
    }, {});

    return Object.values(agregado).sort((a: any, b: any) => a.chave.localeCompare(b.chave));
  }, [estatisticas]);

  const insights = useMemo(() => {
    if (!dados || !estatisticas) return [];

    const resumoA = dados.resumo.find((r) => r.classe === 'A');
    const topProduto = dados.produtos[0];
    const { total_entradas, total_saidas, produtos_estoque_baixo, produtos_vencendo } = estatisticas.estatisticas_gerais;

    return [
      {
        titulo: 'Foco nos produtos de maior impacto',
        texto: resumoA
          ? `A Classe A concentra ${Number(resumoA.percentual_valor).toFixed(1)}% do valor de saída com ${resumoA.quantidade_produtos} produtos. Priorize compra e reposição desses itens.`
          : 'Sem dados da Classe A para o período selecionado.'
      },
      {
        titulo: 'Leitura do fluxo de estoque',
        texto:
          total_saidas > total_entradas
            ? `Há mais saídas (${total_saidas}) do que entradas (${total_entradas}). Reforce reposição para evitar ruptura.`
            : `Entradas (${total_entradas}) estão sustentando as saídas (${total_saidas}). Mantenha o ritmo de abastecimento.`
      },
      {
        titulo: 'Risco operacional imediato',
        texto: `Existem ${produtos_estoque_baixo} produtos com estoque baixo e ${produtos_vencendo} produtos próximos do vencimento. ${topProduto ? `O item de maior impacto no período foi ${topProduto.nome}.` : ''}`
      }
    ];
  }, [dados, estatisticas]);

  const getClasseBadge = (classe: 'A' | 'B' | 'C') => {
    switch (classe) {
      case 'A': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-xs">Classe A</span>;
      case 'B': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-xs">Classe B</span>;
      case 'C': return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-bold text-xs">Classe C</span>;
      default: return null;
    }
  };

  return (
  <Layout>
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-indigo-600" /> Relatório Curva ABC
          </h1>
          <p className="text-gray-500 mt-2">Analise a relevância dos seus produtos baseada no valor total de saídas.</p>
        </header>

        {/* BARRA DE FILTROS DO RELATÓRIO */}
        <form onSubmit={gerarRelatorio} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-end gap-4 mb-6">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unidade</label>
            <select value={unidadeId} onChange={e => setUnidadeId(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Todas as Unidades</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <button type="submit" disabled={carregando} className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Filter size={18} /> {carregando ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </form>

        {erro && (
          <MensagemErro mensagem={erro} />
        )}

        {/* KPIs GERAIS */}
        {!carregando && estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Valor total em estoque</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatarMoeda(estatisticas.estatisticas_gerais.valor_total_estoque)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Movimentações totais</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{estatisticas.estatisticas_gerais.total_movimentacoes}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Produtos com estoque baixo</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{estatisticas.estatisticas_gerais.produtos_estoque_baixo}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Produtos vencendo (30 dias)</p>
              <p className="text-2xl font-bold text-rose-600 mt-2">{estatisticas.estatisticas_gerais.produtos_vencendo}</p>
            </div>
          </div>
        )}

        {/* TENDENCIA MENSAL */}
        {!carregando && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tendência mensal de movimentações</h2>

            {tendenciaMensal.length === 0 ? (
              <p className="text-sm text-gray-500">Sem dados mensais para o período selecionado.</p>
            ) : (
              <div className="space-y-3">
                {tendenciaMensal.map((item: any) => {
                  const maximo = Math.max(...tendenciaMensal.map((m: any) => m.total), 1);
                  const largura = (item.total / maximo) * 100;

                  return (
                    <div key={item.chave}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.total} mov.</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${largura}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">Entrada: {item.entrada}</span>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Saída: {item.saida}</span>
                        <span className="px-2 py-1 rounded bg-violet-100 text-violet-800">Transferência: {item.transferencia}</span>
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Ajuste: {item.ajuste}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* RESUMO DA CURVA ABC (Cards) */}
          {!carregando && dados && dados.resumo && dados.resumo.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {dados.resumo.map((res) => (
              <div key={res.classe} className={`p-4 rounded-xl border ${res.classe === 'A' ? 'bg-green-50 border-green-200' : res.classe === 'B' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="font-bold text-lg mb-2">Classe {res.classe} ({Number(res.percentual_valor || 0).toFixed(1)}%)</h3>
                <p className="text-sm text-gray-700"><strong>Produtos:</strong> {res.quantidade_produtos} ({Number(res.percentual_produtos || 0).toFixed(1)}%)</p>
                <p className="text-sm text-gray-700"><strong>Faturamento:</strong> R$ {Number(res.valor_total || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABELA DE RESULTADOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {carregando ? (
            <LoadingSpinner />
          ) : !dados || dados.produtos.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <FileSpreadsheet size={48} className="text-gray-300 mb-3" />
              <p>Nenhuma venda registrada para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-600px overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                  <tr className="text-xs text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Produto</th>
                    <th className="p-4 font-semibold">Unidade/Cat</th>
                    <th className="p-4 font-semibold text-right">Qtd. Vendida</th>
                    <th className="p-4 font-semibold text-right">Valor Total (R$)</th>
                    <th className="p-4 font-semibold text-center">% Acumulado</th>
                    <th className="p-4 font-semibold text-center">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dados.produtos.map((p, index) => (
                    <tr key={`${p.produto_id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{p.nome}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {p.unidade} <br/> <span className="text-xs">{p.categoria}</span>
                      </td>
                      <td className="p-4 text-right text-gray-700 font-semibold">{p.quantidade_vendida}</td>
                      <td className="p-4 text-right text-gray-700 font-semibold">
                        R$ {p.valor_total.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${p.classificacao === 'A' ? 'bg-green-500' : p.classificacao === 'B' ? 'bg-yellow-500' : 'bg-gray-500'}`} 
                              style={{ width: `${p.percentual_acumulado}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600">{p.percentual_acumulado.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {getClasseBadge(p.classificacao)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INSIGHTS AUTOMATICOS */}
        {!carregando && insights.length > 0 && (
          <section className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Insights para apresentação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.map((insight) => (
                <div key={insight.titulo} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{insight.titulo}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight.texto}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};
