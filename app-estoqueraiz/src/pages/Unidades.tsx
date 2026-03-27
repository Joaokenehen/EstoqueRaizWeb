import { useState, useEffect } from 'react';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { BarraFiltros } from '../components/BarraFiltro';
import { AlertCircle, Plus, X, MapPin } from 'lucide-react';
import { BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';


export const Unidades = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [unidadeEditando, setUnidadeEditando] = useState<Unidade | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
    const [formData, setFormData] = useState({
    nome: '', descricao: '', cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
  });

  const carregarUnidades = async () => {
    try {
      setCarregando(true);
      const dados = await unidadeService.listarTodas();
      setUnidades(dados);
    } catch (error) {
      setErro('Não foi possível carregar as unidades.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUnidades();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTexto, itensPorPagina]);

  const unidadesFiltradas = unidades.filter((u) => {
    const termo = buscaTexto.toLowerCase();
    return u.nome.toLowerCase().includes(termo) || u.cidade.toLowerCase().includes(termo);
  });

  const totalPaginas = Math.max(1, Math.ceil(unidadesFiltradas.length / itensPorPagina));
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const unidadesPaginadas = unidadesFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);

  const handleBuscaCep = async (cepBuscado: string) => {
    const cepLimpo = cepBuscado.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cepBuscado }));

    if (cepLimpo.length === 8) {
      try {
        const dadosEndereco = await unidadeService.buscarCep(cepLimpo);
        setFormData(prev => ({
          ...prev,
          rua: dadosEndereco.rua,
          bairro: dadosEndereco.bairro,
          cidade: dadosEndereco.cidade,
          estado: dadosEndereco.estado
        }));
      } catch (error) {
        alert('CEP não encontrado.');
      }
    }
  };

  const abrirModal = (unidade?: Unidade) => {
    if (unidade) {
      setUnidadeEditando(unidade);
      setFormData({
        nome: unidade.nome,
        descricao: unidade.descricao || '', 
        cep: unidade.cep,
        rua: unidade.rua,
        numero: unidade.numero,
        bairro: unidade.bairro,
        cidade: unidade.cidade,
        estado: unidade.estado
      });
    } else {
      setUnidadeEditando(null);
      setFormData({ nome: '', descricao: '', cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setUnidadeEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessandoAcao(true);
    try {
      if (unidadeEditando) {
        await unidadeService.atualizar(unidadeEditando.id, formData);
        alert('Unidade atualizada com sucesso!');
      } else {
        await unidadeService.criar(formData);
        alert('Unidade criada com sucesso!');
      }
      fecharModal();
      await carregarUnidades();
    } catch (error) {
      alert('Erro ao guardar a unidade. Verifica os dados e tenta novamente.');
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Atenção: Desejas realmente excluir esta unidade?')) return;
    try {
      await unidadeService.deletar(id);
      await carregarUnidades();
    } catch (error) {
      alert('Erro ao excluir unidade.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Unidades</h1>
            <p className="text-gray-500 mt-2">Gere as tuas lojas, armazéns e depósitos físicos.</p>
          </div>
          <button 
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} /> Nova Unidade
          </button>
        </header>

        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Procurar por nome ou cidade..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        />

        {carregando ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : erro ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} /> {erro}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Unidade</th>
                    <th className="p-4 font-semibold">Localização</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidadesPaginadas.map((unidade) => (
                    <tr key={unidade.id} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{unidade.nome}</span>
                          <span className="text-sm text-gray-500 line-clamp-1">{unidade.descricao || 'Sem descrição'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p>{unidade.rua}, {unidade.numero}</p>
                            <p className="text-gray-500">{unidade.bairro} - {unidade.cidade}/{unidade.estado}</p>
                          </div>
                        </div>
                      </td>

                      {/* COLUNA AÇÕES */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <BotaoEditar 
                            onClick={() => abrirModal(unidade)}
                            title="Editar Unidade"
                          />
                        
                          <BotaoDeletar 
                            onClick={() => handleDeletar(unidade.id)}
                            title="Excluir Unidade"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {unidadesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        Nenhuma unidade encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {unidadesFiltradas.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <p className="text-sm text-gray-700">
                  A mostrar <span className="font-medium">{indicePrimeiroItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, unidadesFiltradas.length)}</span> de <span className="font-medium">{unidadesFiltradas.length}</span> resultados
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} disabled={paginaAtual === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    Anterior
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas} className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    Próxima
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {unidadeEditando ? 'Editar Unidade' : 'Nova Unidade'}
              </h2>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* LINHA 1: NOME DA UNIDADE */}
                <div className="col-span-1 md:col-span-12">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Matriz São Paulo" />
                </div>
                
                {/* LINHA 2: DESCRIÇÃO */}
                <div className="col-span-1 md:col-span-12">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Armazém principal de distribuição" />
                </div>

                {/* LINHA 3: CEP E RUA */}
                <div className="col-span-1 md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <input required type="text" maxLength={9} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.cep} onChange={e => handleBuscaCep(e.target.value)} placeholder="00000-000" />
                </div>

                <div className="col-span-1 md:col-span-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.rua} onChange={e => setFormData({...formData, rua: e.target.value})} />
                </div>

                {/* LINHA 4: NÚMERO, BAIRRO, CIDADE E ESTADO */}
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                </div>

                <div className="col-span-1 md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <input required type="text" maxLength={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase text-center" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} placeholder="UF" />
                </div>
              </div>

              {/* BOTÕES DE AÇÃO DO FORMULÁRIO */}
              <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={fecharModal} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={processandoAcao} className="px-5 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                  {processandoAcao && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {processandoAcao ? 'A guardar...' : 'Guardar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};