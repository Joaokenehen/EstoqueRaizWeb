import { useState, useEffect } from 'react';
import { usuarioService, type Usuario } from '../services/usuarioService';
import { Check, Trash2, AlertCircle, ShieldAlert, UserCheck, Filter } from 'lucide-react';
import { BarraFiltros } from '../components/BarraFiltro';
import { unidadeService, type Unidade } from '../services/unidadeService';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cargosSelecionados, setCargosSelecionados] = useState<Record<number, string>>({});
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<Record<number, string>>({});

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const [dadosUsuarios, dadosUnidades] = await Promise.all([
        usuarioService.listarTodos(),
        unidadeService.listarTodas()
      ]);

      setUsuarios(dadosUsuarios);
      setUnidades(dadosUnidades);

      const cargosIniciais: Record<number, string> = {};
      const unidadesIniciais: Record<number, string> = {};
      
      dadosUsuarios.forEach(u => {
        cargosIniciais[u.id] = u.cargo ? u.cargo : '';
        unidadesIniciais[u.id] = u.unidade_id ? String(u.unidade_id) : '';
      });
      
      setCargosSelecionados(cargosIniciais);
      setUnidadesSelecionadas(unidadesIniciais);

    } catch (error) {
      setErro('Não foi possível carregar a lista de usuários.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTexto, filtroStatus, filtroCargo, itensPorPagina]);

  useEffect(() => {
    carregarDados();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = buscaTexto.toLowerCase();
    const passouNoTexto = 
      usuario.nome.toLowerCase().includes(termo) || 
      usuario.email.toLowerCase().includes(termo);

    const passouNoStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;

    let passouNoCargo = true;
    if (filtroCargo !== 'todos') {
      if (filtroCargo === 'nenhum') {
        passouNoCargo = usuario.cargo === null;
      } else {
        passouNoCargo = usuario.cargo === filtroCargo;
      }
    }

    return passouNoTexto && passouNoStatus && passouNoCargo;
  });

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / itensPorPagina));
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  const handleMudancaSelect = (id: number, novoCargo: string) => {
    setCargosSelecionados(prev => ({ ...prev, [id]: novoCargo }));
  };

const handleAprovar = async (id: number) => {
    const cargoSelecionado = cargosSelecionados[id];
    const unidadeSelecionada = unidadesSelecionadas[id];

    if (!cargoSelecionado || cargoSelecionado === 'nenhum') {
      alert('Por favor, selecione o CARGO antes de aprovar.');
      return;
    }
    
    if (!unidadeSelecionada) {
      alert('Por favor, selecione a UNIDADE (Filial) do usuário antes de aprovar.');
      return;
    }

    try {
      setProcessandoId(id);
      
      await usuarioService.aprovar(id, { 
        cargo: cargoSelecionado, 
        unidade_id: Number(unidadeSelecionada) 
      });
      
      alert('Usuário aprovado e vinculado à unidade com sucesso!');
    } catch (error) {
      alert('Erro ao aprovar usuário. Verifique sua conexão.');
    } finally {
      setProcessandoId(null);
      await carregarDados();
    }
  };

  const handleRejeitar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este acesso?')) return;
      try {
        setProcessandoId(id);
        await usuarioService.rejeitar(id);
      } catch (error) {
        alert('Erro ao rejeitar usuário. A tela será atualizada.');
      } finally {
        setProcessandoId(null);
        await carregarDados(); 
      }
    };

  const handleSalvarAlteracoes = async (id: number) => {
    const cargoSelecionado = cargosSelecionados[id];
    const unidadeSelecionada = unidadesSelecionadas[id];

    if (cargoSelecionado === undefined || cargoSelecionado === '') return;
    
    const cargoParaEnviar = cargoSelecionado === 'nenhum' ? null : cargoSelecionado;
    
    const unidadeParaEnviar = (cargoParaEnviar === null || !unidadeSelecionada) 
      ? null 
      : Number(unidadeSelecionada);

    try {
      setProcessandoId(id);
      
      await usuarioService.atualizar(id, { 
        cargo: cargoParaEnviar as any,
        unidade_id: unidadeParaEnviar as any
      });
      
      alert('Permissões e unidade atualizadas com sucesso!');
    } catch (error) {
      alert('Erro ao guardar as alterações. A tela será atualizada.');
      console.error(error);
    } finally {
      setProcessandoId(null);
      await carregarDados(); 
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Atenção: Esta ação é irreversível. Deseja excluir este usuário do sistema?')) return;
    try {
      setProcessandoId(id);
      await usuarioService.deletar(id);
      await carregarDados();
    } catch (error) {
      alert('Erro ao deletar usuário.');
    } finally {
      setProcessandoId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Aprovado</span>;
      case 'pendente':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">Pendente</span>;
      case 'rejeitado':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">Rejeitado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-500 mt-2">Aprove cadastros e gerencie os níveis de acesso da sua equipe.</p>
          </div>
        </header>

        <BarraFiltros 
          buscaTexto={buscaTexto} 
          onBuscaChange={setBuscaTexto} 
          placeholderBusca="Buscar por nome ou e-mail..."
          itensPorPagina={itensPorPagina}
          onItensPorPaginaChange={setItensPorPagina}
        >
          <div className="relative md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </div>

          <div className="relative md:w-48">
            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white"
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
            >
              <option value="todos">Todos os Cargos</option>
              <option value="gerente">Gerentes</option>
              <option value="estoquista">Estoquistas</option>
              <option value="financeiro">Financeiro</option>
              <option value="nenhum">Sem Cargo (Restritos)</option>
            </select>
          </div>
        </BarraFiltros>

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
                    <th className="p-4 font-semibold">Usuário</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Atribuir Cargo</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
          <tbody className="divide-y divide-gray-200">
            {usuariosPaginados.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">

                {/* 1. COLUNA: USUÁRIO E E-MAIL */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{usuario.nome}</span>
                    <span className="text-sm text-gray-500">{usuario.email}</span>
                  </div>
                </td>

                {/* 2. COLUNA: STATUS */}
                <td className="p-4">
                  {getStatusBadge(usuario.status)}
                </td>

                {/* 3. COLUNA: SELECTS DE CARGO E UNIDADE */}
                <td className="p-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Select de Cargo */}
                    <select
                      className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-[150px]"
                      value={cargosSelecionados[usuario.id] || ''}
                      onChange={(e) => handleMudancaSelect(usuario.id, e.target.value)}
                      disabled={processandoId === usuario.id || usuario.status === 'rejeitado'}
                    >
                      <option value="" disabled>Cargo...</option>
                      <option value="nenhum" className="text-gray-500 font-semibold">Sem Cargo</option>
                      <option value="gerente">Gerente</option>
                      <option value="estoquista">Estoquista</option>
                      <option value="financeiro">Financeiro</option>
                    </select>

                    {/* Select de Unidade */}
                    <select
                      className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-[150px]"
                      value={unidadesSelecionadas[usuario.id] || ''}
                      onChange={(e) => setUnidadesSelecionadas(prev => ({ ...prev, [usuario.id]: e.target.value }))}
                      disabled={processandoId === usuario.id || usuario.status === 'rejeitado'}
                    >
                      <option value="" disabled>Unidade...</option>
                      {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* 4. COLUNA: AÇÕES */}
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">   
                    {usuario.status === 'aprovado' && (
                      <button
                        onClick={() => handleSalvarAlteracoes(usuario.id)}
                        disabled={
                          processandoId === usuario.id ||
                          (
                            // O botão fica BLOQUEADO se: O cargo for igual ao atual E a unidade for igual a atual
                            cargosSelecionados[usuario.id] === (usuario.cargo || 'nenhum') &&
                            unidadesSelecionadas[usuario.id] === (usuario.unidade_id ? String(usuario.unidade_id) : '')
                          )
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          // O botão fica AZUL se: Houver alteração no cargo OU alteração na unidade
                          (cargosSelecionados[usuario.id] !== (usuario.cargo || 'nenhum')) ||
                          (unidadesSelecionadas[usuario.id] !== (usuario.unidade_id ? String(usuario.unidade_id) : ''))
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Salvar alterações"
                      >
                        <UserCheck size={18} />
                      </button>
                    )}

                    {usuario.status === 'pendente' && (
                      <>
                        <button
                          onClick={() => handleAprovar(usuario.id)}
                          disabled={processandoId === usuario.id}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Aprovar Usuário"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleRejeitar(usuario.id)}
                          disabled={processandoId === usuario.id}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Rejeitar Usuário"
                        >
                          <AlertCircle size={18} />
                        </button>
                      </>
                    )}

                    {/* LIXEIRA MOVIDA PARA DENTRO DA DIV FLEX! */}
                    <button
                      onClick={() => handleDeletar(usuario.id)}
                      disabled={processandoId === usuario.id}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div> 
                </td>
              </tr>
            ))}

                  {usuariosFiltrados.length === 0 && !carregando && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Nenhum usuário encontrado com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINAÇÃO NO RODAPÉ */}
            {usuariosFiltrados.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indicePrimeiroItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, usuariosFiltrados.length)}</span> de <span className="font-medium">{usuariosFiltrados.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                        disabled={paginaAtual === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Página {paginaAtual} de {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={paginaAtual === totalPaginas}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};