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
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';

export const Financeiro = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'pendentes' | 'aprovados' | 'rejeitados'>('pendentes');
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
    const matchesStatus = abaAtiva === 'pendentes' ? p.statusProduto === 'pendente' : abaAtiva === 'aprovados' ? p.statusProduto === 'aprovado' : p.statusProduto === 'rejeitado';
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
      toast.error('O valor de venda não pode ser menor que o valor de custo.');
      return;
    }

    setProcessandoAcao(true);
    try {
      await produtoService.aprovar(produtoAtivo.id, {
        preco_custo: custo,
        preco_venda: venda
      });
      toast.success('Produto Aprovado e Precificado!');
      setModalAprovacaoAberto(false);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao aprovar produto.');
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
      toast.error('O valor de venda não pode ser menor que o valor de custo.');
      return;
    }

    setProcessandoAcao(true);
    try {
      await api.put(`/api/produtos/${produtoAtivo.id}`, {
        preco_custo: custo,
        preco_venda: venda
      });
      toast.success('Preços atualizados com sucesso!');
      setModalEdicaoAberto(false);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao atualizar preços.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleRejeitar = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Rejeitar este produto? Ele não será ativado no catálogo.</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-600" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await produtoService.rejeitar(id);
              toast.success('Produto rejeitado!');
              await carregarDados();
            } catch (error) {
              toast.error('Erro ao rejeitar produto.');
            }
          }}>Rejeitar</button>
        </div>
      </div>
    ), { duration: Infinity });
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
                  ? 'border-raiz-verde text-raiz-verde'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Pendentes
            </button>
            <button
              onClick={() => setAbaAtiva('aprovados')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === 'aprovados'
                  ? 'border-raiz-verde text-raiz-verde'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Aprovados
            </button>
            <button
              onClick={() => setAbaAtiva('rejeitados')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === 'rejeitados'
                  ? 'border-raiz-verde text-raiz-verde'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Rejeitados
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
                    {abaAtiva === 'aprovados' && (
                      <>
                        <th className="p-4 font-semibold">Custo (R$)</th>
                        <th className="p-4 font-semibold">Venda (R$)</th>
                      </>
                    )}
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
                      {abaAtiva === 'aprovados' && (
                        <>
                          <td className="p-4 text-gray-700">
                            {prod.preco_custo !== null && prod.preco_custo !== undefined ? `R$ ${Number(prod.preco_custo).toFixed(2)}` : '---'}
                          </td>
                          <td className="p-4 text-gray-700 font-semibold">
                            {prod.preco_venda !== null && prod.preco_venda !== undefined ? `R$ ${Number(prod.preco_venda).toFixed(2)}` : '---'}
                          </td>
                        </>
                      )}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {abaAtiva === 'pendentes' ? (
                            <>
                              <BotaoAprovar onClick={() => abrirModalAprovacao(prod)} title="Aprovar e Precificar" />
                              <BotaoRejeitar onClick={() => handleRejeitar(prod.id)} title="Rejeitar Produto" />
                            </>
                          ) : abaAtiva === 'aprovados' ? (
                            <BotaoEditar onClick={() => abrirModalEdicao(prod)} title="Editar Preços" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
                                Rejeitado
                              </span>
                              <BotaoAprovar onClick={() => abrirModalAprovacao(prod)} title="Reavaliar e Aprovar" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {produtosFiltrados.length === 0 && (
                    <tr><td colSpan={abaAtiva === 'aprovados' ? 5 : 3} className="p-12 text-center text-gray-400 italic">Nenhum produto encontrado.</td></tr>
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
        headerClasses="bg-green-50 text-green-800 border-green-200"
      >
        <FormularioBase 
          onSubmit={handleAtualizarPrecos} 
          processando={processandoAcao}
          textoBotaoSubmit="Salvar Preços"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Custo Unitário (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_custo} onChange={e => setPrecos({...precos, preco_custo: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venda Unitária (R$)</label>
            <input required type="number" step="0.01" value={precos.preco_venda} onChange={e => setPrecos({...precos, preco_venda: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" placeholder="0.00" />
          </div>
        </FormularioBase>
      </Modal>
    </Layout>
  );
};