import { useState, useEffect } from 'react';
import { relatorioService, type ResultadoCurvaABC } from '../services/relatorioService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { TrendingUp, Filter, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Layout from '../components/Layout';

export const Relatorios = () => {
  const [dados, setDados] = useState<ResultadoCurvaABC | null>(null);
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
      const resultado = await relatorioService.gerarCurvaABC({
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        unidade_id: unidadeId ? Number(unidadeId) : undefined
      });
      setDados(resultado);
    } catch (error) {
      setErro('Não foi possível gerar o relatório. Tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

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
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 mb-6">
            <AlertCircle size={24} /> {erro}
          </div>
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
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
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
      </div>
    </Layout>
  );
};