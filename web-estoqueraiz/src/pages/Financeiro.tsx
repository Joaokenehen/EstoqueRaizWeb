import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { produtoService, type Produto } from '../services/produtoService';
import { BarraFiltros } from '../components/BarraFiltro';
import { DollarSign, Image as ImageIcon } from 'lucide-react';
import { BotaoAprovar, BotaoRejeitar, BotaoEditar } from '../components/BotoesAcao';
import { LoadingSpinner } from '../components/Feedbacks';
import Layout from '../components/Layout';
import { Modal } from '../components/Modal';
import { FormularioBase } from '../components/FormularioBase';

export const Financeiro = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'pendentes' | 'aprovados'>('pendentes');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [produtoAtivo, setProdutoAtivo] = useState<Produto | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  const [precos, setPrecos] = useState({ preco_custo: '', preco_venda: '' });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dadosProdutos = await produtoService.listarTodos();
      setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
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
  }, [buscaTexto, abaAtiva, itensPorPagina]);

  const produtosFiltrados = produtos.filter(p => {
    const matchesNome = p.nome?.toLowerCase().includes(buscaTexto.toLowerCase());
    const matchesStatus = abaAtiva === 'pendentes' ? p.statusProduto === 'pendente' : p.statusProduto === 'aprovado';
    return matchesNome && matchesStatus;
  });

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina));
  const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const handleAprovar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoAtivo) return;

    const custo = Number(precos.preco_custo);
    const venda = Number(precos.preco_venda);

    if (venda < custo) {
      alert('O valor de venda não pode ser menor que o valor de custo.');
      return;
    }

    setProcessandoAcao(true);
    try {
      await produtoService.aprovar(produtoAtivo.id, {
        preco_custo: custo,
        preco_venda: venda
      });
      alert('Produto Aprovado e Precificado!');
      setModalAprovacaoAberto(false);
      await carregarDados();
    } catch (error) {
      alert('Erro ao aprovar produto.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleAtualizarPrecos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoAtivo) return;

    const custo = Number(precos.preco_custo);
    const venda = Number(precos.preco_venda);

    if (venda < custo) {
      alert('O valor de venda não pode ser menor que o valor de custo.');
      return;
    }

    setProcessandoAcao(true);
    try {
      await api.put(`/api/produtos/${produtoAtivo.id}`, {
        preco_custo: custo,
        preco_venda: venda
      });
      alert('Preços atualizados com sucesso!');
      setModalEdicaoAberto(false);
      await carregarDados();
    } catch (error) {
      alert('Erro ao atualizar preços.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleRejeitar = async (id: number) => {
    if (!window.confirm('Rejeitar este produto? O item não será ativado no catálogo.')) return;
    try {
      await produtoService.rejeitar(id);
      await carregarDados();
    } catch (error) {
      alert('Erro ao rejeitar produto.');
    }
  };

  const abrirModalAprovacao = (prod: Produto) => {
    setProdutoAtivo(prod);
    setPrecos({ preco_custo: '', preco_venda: '' });
    setModalAprovacaoAberto(true);
  };

  const abrirModalEdicao = (prod: Produto) => {
    setProdutoAtivo(prod);
    setPrecos({ 
      preco_custo: prod.preco_custo ? String(prod.preco_custo) : '', 
      preco_venda: prod.preco_venda ? String(prod.preco_venda) : '' 
    });
    setModalEdicaoAberto(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-2">Gestão de precificação e aprovação comercial de produtos.</p>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setAbaAtiva('pendentes')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === 'pendentes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Pendentes
            </button>
            <button
              onClick={() => setAbaAtiva('aprovados')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === 'aprovados'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Aprovados
            </button>
          </nav>
        </div>

        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Pesquisar por nome do produto..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        />

        {carregando ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Produto</th>
                    <th className="p-4 font-semibold">Estoque</th>
                    <th className="p-4 font-semibold">Custo (R$)</th>
                    <th className="p-4 font-semibold">Venda (R$)</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosPaginados.map((prod) => (
                    <tr key={prod.id} className="transition-colors hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-4">
                        {prod.imagem_url ? (
                          <img src={`${api.defaults.baseURL}${prod.imagem_url}`} alt={prod.nome} className="w-14 h-14 rounded-lg object-cover border" />
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
                      </td>
                      <td className="p-4 text-gray-700">
                        {prod.preco_custo !== null && prod.preco_custo !== undefined ? `R$ ${Number(prod.preco_custo).toFixed(2)}` : '---'}
                      </td>
                      <td className="p-4 text-gray-700 font-semibold">
                        {prod.preco_venda !== null && prod.preco_venda !== undefined ? `R$ ${Number(prod.preco_venda).toFixed(2)}` : '---'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {abaAtiva === 'pendentes' ? (
                            <>
                              <BotaoAprovar onClick={() => abrirModalAprovacao(prod)} title="Aprovar e Precificar" />
                              <BotaoRejeitar onClick={() => handleRejeitar(prod.id)} title="Rejeitar Produto" />
                            </>
                          ) : (
                            <BotaoEditar onClick={() => abrirModalEdicao(prod)} title="Editar Preços" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {produtosFiltrados.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">Nenhum produto encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

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

      <Modal 
        isOpen={modalAprovacaoAberto && produtoAtivo !== null} 
        onClose={() => setModalAprovacaoAberto(false)} 
        titulo={<span className="flex items-center gap-2"><DollarSign /> Aprovar e Precificar</span>} 
        maxWidth="max-w-md"
        headerClasses="bg-green-50 text-green-800 border-green-200"
      >
        <FormularioBase 
          onSubmit={handleAprovar} 
          processando={processandoAcao}
          textoBotaoSubmit="Finalizar e Aprovar"
        >
          <p className="text-sm text-gray-600 mb-2">Defina a precificação para ativar o item no catálogo comercial.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Custo Unitário (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_custo} onChange={e => setPrecos({...precos, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venda Unitária (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_venda} onChange={e => setPrecos({...precos, preco_venda: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
          </div>
        </FormularioBase>
      </Modal>

      <Modal 
        isOpen={modalEdicaoAberto && produtoAtivo !== null} 
        onClose={() => setModalEdicaoAberto(false)} 
        titulo={<span className="flex items-center gap-2"><DollarSign /> Editar Preços</span>} 
        maxWidth="max-w-md"
        headerClasses="bg-indigo-50 text-indigo-800 border-indigo-200"
      >
        <FormularioBase 
          onSubmit={handleAtualizarPrecos} 
          processando={processandoAcao}
          textoBotaoSubmit="Salvar Preços"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Custo Unitário (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_custo} onChange={e => setPrecos({...precos, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venda Unitária (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_venda} onChange={e => setPrecos({...precos, preco_venda: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
          </div>
        </FormularioBase>
      </Modal>
    </Layout>
  );
};