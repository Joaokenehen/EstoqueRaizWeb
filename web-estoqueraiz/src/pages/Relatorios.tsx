import { useState, useEffect, useMemo } from 'react';
import { relatorioService, type ResultadoCurvaABC, type ResultadoEstatisticas, type ResultadoRelatorioFinanceiro } from '../services/relatorioService';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { TrendingUp, Filter, FileSpreadsheet, PlusCircle, DollarSign, Download } from 'lucide-react';
import { LoadingSpinner, MensagemErro } from '../components/Feedbacks';
import Layout from '../components/Layout';
import { ComposedChart, BarChart, LineChart, PieChart, Pie, Cell, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';

type TipoGrafico = 'composed' | 'bar' | 'line' | 'pie';
const CORES_PIE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// Utilitário para converter a imagem da logo para Base64 (Requisito do jsPDF)
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

export const Relatorios = () => {
  const [dados, setDados] = useState<ResultadoCurvaABC | null>(null);
  const [estatisticas, setEstatisticas] = useState<ResultadoEstatisticas | null>(null);
  const [financeiro, setFinanceiro] = useState<ResultadoRelatorioFinanceiro | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [limiteVisivel, setLimiteVisivel] = useState(10);
  const [limiteVisivelTendencia, setLimiteVisivelTendencia] = useState(6);
  const [erro, setErro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('composed');

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
    setDados(null);
    setFinanceiro(null);
    setErro('');
    setLimiteVisivel(10);
    setLimiteVisivelTendencia(6);
    try {
      const filtros = {
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        unidade_id: unidadeId ? Number(unidadeId) : undefined,
        pagina: 1,
        limite: 9999,
      };

      const [resultadoCurva, resultadoEstatisticas, resultadoFinanceiro] = await Promise.all([
        relatorioService.gerarCurvaABC(filtros),
        relatorioService.obterEstatisticasGerais(filtros),
        relatorioService.obterRelatorioFinanceiro(filtros)
      ]);

      setDados(resultadoCurva);
      setEstatisticas(resultadoEstatisticas);
      setFinanceiro(resultadoFinanceiro);
    } catch (error) {
      setErro('Não foi possível gerar o relatório. Tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const exportarParaPDF = async () => {
    if (!dados || dados.produtos.length === 0) return;
    
    // Paisagem (landscape) para caber bem as colunas da Curva ABC
    const doc = new jsPDF('landscape'); 
    
    try {
      const logoBase64 = await getBase64ImageFromUrl(logoEstoque);
      doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
    } catch (e) {
      console.warn("Aviso: Logo não carregada no PDF", e);
    }

    doc.setFontSize(16);
    doc.text('Relatório Gerencial - Curva ABC', 14, 36);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 44);
    
    let currentY = 52;
    if (unidadeId) {
      const nomeUnidade = unidades.find(u => u.id === Number(unidadeId))?.nome;
      if (nomeUnidade) {
        doc.text(`Filtro de Unidade: ${nomeUnidade}`, 14, 50);
        currentY = 56;
      }
    }

    const dadosTabela = dados.produtos.map((item, index) => [
      index + 1,
      item.nome,
      item.categoria,
      item.unidade,
      item.quantidade_vendida,
      `R$ ${item.valor_total.toFixed(2)}`,
      `${(item.percentual_participacao || 0).toFixed(1)}%`,
      `${(item.percentual_acumulado || 0).toFixed(1)}%`,
      item.classificacao
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Produto', 'Categoria', 'Unidade', 'Qtd.', 'Faturamento', 'Part. (%)', 'Acum. (%)', 'Curva']],
      body: dadosTabela,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50] }, // Verde do Estoque Raiz
    });

    doc.save('relatorio-curva-abc.pdf');
  };

  const exportarFinanceiroPDF = async () => {
    if (!financeiro || financeiro.balanco_mensal.length === 0) return;
    
    const doc = new jsPDF();

    try {
      const logoBase64 = await getBase64ImageFromUrl(logoEstoque);
      doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
    } catch (e) {}

    doc.setFontSize(16);
    doc.text('Relatório Gerencial - Balanço Financeiro', 14, 36);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 44);
    
    let currentY = 52;
    if (unidadeId) {
      const nomeUnidade = unidades.find(u => u.id === Number(unidadeId))?.nome;
      if (nomeUnidade) {
        doc.text(`Filtro de Unidade: ${nomeUnidade}`, 14, 50);
        currentY = 56;
      }
    }

    const dadosTabela = dadosGraficoFinanceiro.map(item => [
      item.mes_formatado,
      formatarMoeda(item.total_gastos),
      formatarMoeda(item.total_faturamento),
      formatarMoeda(item.total_custo_saidas),
      formatarMoeda(item.lucro_bruto)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Período', 'Gastos (Entradas)', 'Faturamento Bruto', 'Custo das Saídas', 'Lucro Bruto']],
      body: dadosTabela,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50] },
    });

    doc.save('relatorio-financeiro.pdf');
  };

  const exportarTendenciaPDF = async () => {
    if (!tendenciaMensal || tendenciaMensal.length === 0) return;
    
    const doc = new jsPDF();

    try {
      const logoBase64 = await getBase64ImageFromUrl(logoEstoque);
      doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
    } catch (e) {}

    doc.setFontSize(16);
    doc.text('Relatório Gerencial - Tendência Mensal de Movimentações', 14, 36);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 44);
    
    let currentY = 52;
    if (unidadeId) {
      const nomeUnidade = unidades.find(u => u.id === Number(unidadeId))?.nome;
      if (nomeUnidade) {
        doc.text(`Filtro de Unidade: ${nomeUnidade}`, 14, 50);
        currentY = 56;
      }
    }

    const dadosTabela = tendenciaMensal.map((item: any) => [
      item.label,
      item.total,
      item.entrada,
      item.saida,
      item.transferencia,
      item.ajuste
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Período', 'Total Mov.', 'Entradas', 'Saídas', 'Transferências', 'Ajustes']],
      body: dadosTabela,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50] },
    });

    doc.save('relatorio-tendencia-movimentacoes.pdf');
  };

  const tendenciaMensal = useMemo(() => {
    if (!estatisticas?.movimentacoes_por_mes?.length) return [];

    // Pega as datas que foram de fato aplicadas no botão "Gerar Relatório" (formato YYYY-MM)
    const inicioAplicado = dados?.estatisticas?.periodo?.data_inicio?.substring(0, 7);
    const fimAplicado = dados?.estatisticas?.periodo?.data_fim?.substring(0, 7);

    const agregado = estatisticas.movimentacoes_por_mes.reduce((acc: Record<string, any>, item: any) => {
      const data = new Date(item.mes);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      // Ignora e não exibe no gráfico os meses que estiverem fora do intervalo
      if (inicioAplicado && chave < inicioAplicado) return acc;
      if (fimAplicado && chave > fimAplicado) return acc;

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

    // Ordena de forma decrescente: meses mais recentes no topo
    return Object.values(agregado).sort((a: any, b: any) => b.chave.localeCompare(a.chave));
  }, [estatisticas, dados]);

  const dadosGraficoFinanceiro = useMemo(() => {
    if (!financeiro?.balanco_mensal) return [];
    
    return financeiro.balanco_mensal.map(item => {
      const data = new Date(item.ano, Number(item.mes) - 1);
      return {
        ...item,
        mes_formatado: data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        lucro_bruto_positivo: item.lucro_bruto > 0 ? item.lucro_bruto : 0,
        lucro_bruto_negativo: item.lucro_bruto < 0 ? item.lucro_bruto : 0
      };
    });
  }, [financeiro]);

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

  const produtosParaExibir = dados?.produtos.slice(0, limiteVisivel) || [];
  const temMais = dados ? dados.produtos.length > limiteVisivel : false;
  const temMenos = limiteVisivel > 10;
  const tendenciaParaExibir = tendenciaMensal.slice(0, limiteVisivelTendencia);
  const temMaisTendencia = tendenciaMensal.length > limiteVisivelTendencia;
  const temMenosTendencia = limiteVisivelTendencia > 6;

  return (
  <Layout>
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-raiz-verde" /> Relatório Curva ABC
          </h1>
          <p className="text-gray-500 mt-2">Analise a relevância dos seus produtos baseada no valor total de saídas.</p>
        </header>

        <form onSubmit={gerarRelatorio} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-end gap-4 mb-6">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unidade</label>
            <select value={unidadeId} onChange={e => setUnidadeId(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde bg-white">
              <option value="">Todas as Unidades</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <button type="submit" disabled={carregando} className="w-full md:w-auto px-6 py-2 bg-raiz-verde text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Filter size={18} /> {carregando ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </form>

        {erro && (
          <MensagemErro mensagem={erro} />
        )}

        {!carregando && financeiro && financeiro.balanco_mensal.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="text-raiz-verde" size={20} /> Balanço Financeiro
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <button
                  onClick={exportarFinanceiroPDF}
                  className="px-4 py-1.5 bg-raiz-verde text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download size={16} /> Exportar PDF
                </button>
                <select 
                  value={tipoGrafico} 
                  onChange={(e) => setTipoGrafico(e.target.value as TipoGrafico)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-raiz-verde bg-gray-50 cursor-pointer"
                >
                  <option value="composed">Visão Completa (Misto)</option>
                  <option value="bar">Gastos vs Faturamento (Barras)</option>
                  <option value="line">Evolução de Lucro (Linha)</option>
                  <option value="pie">Faturamento Bruto (Pizza)</option>
                </select>
              </div>
            </div>
            
            <div className="h-[400px] w-full mt-4 bg-white">
              <ResponsiveContainer width="100%" height="100%">
                {tipoGrafico === 'composed' ? (
                  <ComposedChart data={dadosGraficoFinanceiro} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="mes_formatado" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => formatarMoeda(Number(value))} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="total_gastos" name="Gastos (Entradas)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar yAxisId="left" dataKey="total_faturamento" name="Faturamento Bruto" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Line yAxisId="left" type="monotone" dataKey="lucro_bruto" name="Lucro Bruto" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                ) : tipoGrafico === 'bar' ? (
                  <BarChart data={dadosGraficoFinanceiro} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="mes_formatado" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => formatarMoeda(Number(value))} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total_gastos" name="Gastos (Entradas)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="total_faturamento" name="Faturamento Bruto" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                ) : tipoGrafico === 'line' ? (
                  <LineChart data={dadosGraficoFinanceiro} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="mes_formatado" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => formatarMoeda(Number(value))} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="lucro_bruto" name="Lucro Bruto" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Tooltip formatter={(value: any) => formatarMoeda(Number(value))} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Pie
                      data={dadosGraficoFinanceiro}
                      dataKey="total_faturamento"
                      nameKey="mes_formatado"
                      cx="50%"
                      cy="50%"
                      outerRadius={130}
                      label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {dadosGraficoFinanceiro.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>
        )}

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

        {!carregando && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Tendência mensal de movimentações</h2>
              <button
                onClick={exportarTendenciaPDF}
                className="px-4 py-1.5 bg-raiz-verde text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download size={16} /> Exportar PDF
              </button>
            </div>

            {tendenciaMensal.length === 0 ? (
              <p className="text-sm text-gray-500">Sem dados mensais para o período selecionado.</p>
            ) : (
            <div className="space-y-3 pb-2">
                {tendenciaParaExibir.map((item: any) => {
                  const maximo = Math.max(...tendenciaParaExibir.map((m: any) => m.total), 1);
                  const largura = (item.total / maximo) * 100;

                  return (
                    <div key={item.chave}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.total} mov.</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-raiz-verde rounded-full" style={{ width: `${largura}%` }} />
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
            
            {!carregando && (temMaisTendencia || temMenosTendencia) && (
              <div className="pt-4 mt-2 flex items-center justify-center gap-4 border-t border-gray-200">
                {temMaisTendencia && (
                  <button
                    onClick={() => setLimiteVisivelTendencia(prev => prev + 6)}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <PlusCircle size={18} /> Ver mais meses
                  </button>
                )}
                {temMenosTendencia && (
                  <button
                    onClick={() => setLimiteVisivelTendencia(6)}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Ver menos
                  </button>
                )}
              </div>
            )}
          </section>
        )}

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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {carregando ? (
            <LoadingSpinner />
          ) : !dados || dados.produtos.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <FileSpreadsheet size={48} className="text-gray-300 mb-3" />
              <p>Nenhuma venda registrada para os filtros aplicados.</p>
            </div>
          ) : (<>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="font-semibold text-gray-800">Listagem Completa (Curva ABC)</h3>
              <button
                onClick={exportarParaPDF}
                className="px-4 py-2 bg-raiz-verde text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download size={16} /> Exportar PDF
              </button>
            </div>
            <div className="overflow-x-auto max-h-600px overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                  <tr className="text-xs text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Produto</th>
                    <th className="p-4 font-semibold">Unidade/Cat</th>
                    <th className="p-4 font-semibold text-right">Qtd. Vendida</th>
                    <th className="p-4 font-semibold text-right">Valor Total (R$)</th>
                    <th className="p-4 font-semibold text-center">Participação (%)</th>
                    <th className="p-4 font-semibold text-center">% Acumulado</th>
                    <th className="p-4 font-semibold text-center">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosParaExibir.map((p, index) => (
                    <tr key={`${p.produto_id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{p.nome}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {p.unidade} <br/> <span className="text-xs">{p.categoria}</span>
                      </td>
                      <td className="p-4 text-right text-gray-700 font-semibold">{p.quantidade_vendida}</td>
                      <td className="p-4 text-right text-gray-700 font-semibold">
                        R$ {p.valor_total.toFixed(2)}
                      </td>
                      <td className="p-4 text-center text-gray-700 font-semibold">
                        {(p.percentual_participacao || 0).toFixed(1)}%
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
            {!carregando && (temMais || temMenos) && (
              <div className="p-4 flex items-center justify-center gap-4 border-t border-gray-200 bg-gray-50">
                {temMais && (
                  <button
                    onClick={() => setLimiteVisivel(prev => prev + 10)}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <PlusCircle size={18} /> Ver mais
                  </button>
                )}
                {temMenos && (
                  <button
                    onClick={() => setLimiteVisivel(10)}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Ver menos
                  </button>
                )}
              </div>
            )}
          </>
          )}
        </div>

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
