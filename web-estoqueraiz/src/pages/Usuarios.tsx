import { useState, useEffect } from 'react';
import { usuarioService, type Usuario } from '../services/usuarioService';
import { ShieldAlert, Filter } from 'lucide-react';
import { BarraFiltros } from '../components/BarraFiltro';
import { unidadeService, type Unidade } from '../services/unidadeService';
import { BotaoAprovar, BotaoRejeitar, BotaoDeletar, BotaoSalvarPermissao } from '../components/BotoesAcao';
import Layout from '../components/Layout';
import { useSelecaoLote } from '../hooks/useSelecaoLote';
import { BarraAcoesLote } from '../components/BarraAcoesLote';
import { LoadingSpinner, MensagemErro } from '../components/Feedbacks';
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';
import { getIniciais, getCorAvatar } from '../utils/avatar';

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
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<Record<number, string>>({});
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  
  const { 
    selecionados, 
    alternarSelecao, 
    selecionarTodos, 
    limparSelecao 
  } = useSelecaoLote<number>();

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
    limparSelecao();
  }, [buscaTexto, filtroStatus, filtroCargo, itensPorPagina, limparSelecao]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuarioLogado(JSON.parse(dadosSalvos));
    }
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

  const handleDeletarLote = () => {
    if (selecionados.length === 0) return;

    if (usuarioLogado && selecionados.includes(usuarioLogado.id)) {
      toast.error('Você não pode excluir a sua própria conta! Desmarque o seu usuário e tente novamente.');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Excluir {selecionados.length} usuário(s)? Ação irreversível.</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              setCarregando(true);
              await Promise.all(selecionados.map(id => usuarioService.deletar(id)));
              toast.success(`${selecionados.length} usuário(s) excluído(s)!`);
              limparSelecao(); 
              await carregarDados();
            } catch (error) {
              toast.error('Erro ao excluir alguns usuários.');
              await carregarDados();
            } finally {
              setCarregando(false);
            }
          }}>Excluir Selecionados</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

const handleAprovar = async (id: number) => {
    const cargoSelecionado = cargosSelecionados[id];
    const unidadeSelecionada = unidadesSelecionadas[id];

    if (!cargoSelecionado || cargoSelecionado === 'nenhum') {
      toast.error('Por favor, selecione o CARGO antes de aprovar.');
      return;
    }
    
    if (cargoSelecionado !== 'financeiro' && cargoSelecionado !== 'gerente' && !unidadeSelecionada) {
      toast.error('Por favor, selecione a UNIDADE (Filial) do usuário antes de aprovar.');
      return;
    }

    try {
      setProcessandoId(id);
      
      const unidadeParaEnviar = (cargoSelecionado === 'financeiro' || cargoSelecionado === 'gerente') ? null : Number(unidadeSelecionada);

      await usuarioService.aprovar(id, { 
        cargo: cargoSelecionado, 
        unidade_id: unidadeParaEnviar as any 
      });

      toast.success('Usuário aprovado com sucesso!');
    } catch (error) {
      toast.error('Erro ao aprovar usuário. Verifique sua conexão.');
    } finally {
      setProcessandoId(null);
      await carregarDados();
    }
  };

  const handleRejeitar = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Tem certeza que deseja rejeitar este acesso?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-600" onClick={async () => {
            toast.dismiss(t.id);
            try {
              setProcessandoId(id);
              await usuarioService.rejeitar(id);
              toast.success('Acesso rejeitado!');
            } catch (error) {
              toast.error('Erro ao rejeitar usuário.');
            } finally {
              setProcessandoId(null);
              await carregarDados(); 
            }
          }}>Rejeitar</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleSalvarAlteracoes = async (id: number) => {
    const cargoSelecionado = cargosSelecionados[id];
    const unidadeSelecionada = unidadesSelecionadas[id];

    if (cargoSelecionado === undefined || cargoSelecionado === '') return;
    
    const cargoParaEnviar = cargoSelecionado === 'nenhum' ? null : cargoSelecionado;
    
    const unidadeParaEnviar = (cargoParaEnviar === null || cargoParaEnviar === 'financeiro' || cargoParaEnviar === 'gerente' || !unidadeSelecionada) 
      ? null 
      : Number(unidadeSelecionada);

    try {
      setProcessandoId(id);
      
      await usuarioService.atualizar(id, { 
        cargo: cargoParaEnviar as any,
        unidade_id: unidadeParaEnviar as any
      });
      
      if (usuarioLogado && id === usuarioLogado.id) {
        const usuarioAtualizado = { ...usuarioLogado, unidade_id: unidadeParaEnviar };
        setUsuarioLogado(usuarioAtualizado);
        localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuarioAtualizado));
      }

      toast.success('Permissões e unidade atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao guardar as alterações.');
      console.error(error);
    } finally {
      setProcessandoId(null);
      await carregarDados(); 
    }
  };

  const handleDeletar = (id: number) => {
    if (usuarioLogado && id === usuarioLogado.id) {
      toast.error('Você não pode excluir sua própria conta. Outro administrador deve realizar esta ação.');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Desejas excluir este usuário do sistema?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              setProcessandoId(id);
              await usuarioService.deletar(id);
              toast.success('Usuário excluído!');
              await carregarDados();
            } catch (error) {
              toast.error('Erro ao deletar usuário.');
            } finally {
              setProcessandoId(null);
            }
          }}>Excluir</button>
        </div>
      </div>
    ), { duration: Infinity });
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
    <Layout>
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

        <BarraAcoesLote 
          quantidadeSelecionada={selecionados.length}
          onExcluir={handleDeletarLote}
          carregando={carregando}
          textoItem="usuário(s)"
        />

        {carregando ? (
          <LoadingSpinner />
        ) : erro ? (
          <MensagemErro mensagem={erro} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-raiz-verde focus:ring-raiz-verde cursor-pointer"
                        checked={
                          usuariosPaginados.length > 0 && 
                          selecionados.length === usuariosPaginados.filter(u => u.id !== usuarioLogado?.id).length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const idsPermitidos = usuariosPaginados.filter(u => u.id !== usuarioLogado?.id).map(u => u.id);
                            selecionarTodos(idsPermitidos);
                          } else {
                            limparSelecao();
                          }
                        }}
                      />
                    </th>
                    <th className="p-4 font-semibold">Usuário</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Atribuir Cargo / Unidade</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosPaginados.map((usuario) => (
                    <tr 
                      key={usuario.id} 
                      className={`transition-colors ${selecionados.includes(usuario.id) ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-raiz-verde focus:ring-raiz-verde cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          checked={selecionados.includes(usuario.id)}
                          onChange={() => alternarSelecao(usuario.id)}
                          disabled={usuarioLogado?.id === usuario.id} 
                          title={usuarioLogado?.id === usuario.id ? "Você não pode excluir sua própria conta" : ""}
                        />
                      </td>

                      <td className="p-4 flex items-center gap-3">
                        {usuario.foto_perfil ? (
                          <img 
                            src={usuario.foto_perfil} 
                            alt={`Foto de ${usuario.nome}`} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" 
                          />
                        ) : (
                          <div className={`w-10 h-10 flex items-center justify-center rounded-full border shadow-sm font-bold text-sm shrink-0 ${getCorAvatar(usuario.nome)}`}>
                            {getIniciais(usuario.nome)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {usuario.nome} {usuarioLogado?.id === usuario.id && <span className="text-xs text-raiz-verde font-bold ml-1">(Você)</span>}
                          </span>
                          <span className="text-sm text-gray-500">{usuario.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {getStatusBadge(usuario.status)}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-150px disabled:opacity-50"
                            data-testid={`usuarios-select-cargo-${usuario.id}`}
                            value={cargosSelecionados[usuario.id] || ''}
                            onChange={(e) => handleMudancaSelect(usuario.id, e.target.value)}
                            disabled={processandoId === usuario.id || usuario.status === 'rejeitado' || usuarioLogado?.id === usuario.id}
                            title={usuarioLogado?.id === usuario.id ? "Você não pode alterar seu próprio cargo" : ""}
                          >
                            <option value="" disabled>Cargo...</option>
                            <option value="nenhum" className="text-gray-500 font-semibold">Sem Cargo</option>
                            <option value="gerente">Gerente</option>
                            <option value="estoquista">Estoquista</option>
                            <option value="financeiro">Financeiro</option>
                          </select>

                          <select
                            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-150px disabled:opacity-50 disabled:bg-gray-100"
                            data-testid={`usuarios-select-unidade-${usuario.id}`}
                          value={(cargosSelecionados[usuario.id] === 'financeiro' || cargosSelecionados[usuario.id] === 'gerente') ? '' : (unidadesSelecionadas[usuario.id] || '')}
                            onChange={(e) => setUnidadesSelecionadas(prev => ({ ...prev, [usuario.id]: e.target.value }))}
                            disabled={
                              processandoId === usuario.id || 
                              usuario.status === 'rejeitado' || 
                            cargosSelecionados[usuario.id] === 'financeiro' ||
                            cargosSelecionados[usuario.id] === 'gerente'
                            }
                          >
                            
                            <option value="" disabled>
                            {(cargosSelecionados[usuario.id] === 'financeiro' || cargosSelecionados[usuario.id] === 'gerente') ? 'Acesso Global' : 'Unidade...'}
                            </option>
                            
                            {unidades.map(u => (
                              <option key={u.id} value={u.id}>{u.nome}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          
                          {usuario.status === 'aprovado' && (
                            <BotaoSalvarPermissao
                              onClick={() => handleSalvarAlteracoes(usuario.id)}
                              disabled={
                                processandoId === usuario.id ||
                                (
                                  cargosSelecionados[usuario.id] === (usuario.cargo || 'nenhum') &&
                                  unidadesSelecionadas[usuario.id] === (usuario.unidade_id ? String(usuario.unidade_id) : '')
                                )
                              }
                            />
                          )}

                          {usuario.status === 'pendente' && (
                            <>
                              <BotaoAprovar
                                onClick={() => handleAprovar(usuario.id)}
                                disabled={processandoId === usuario.id}
                              />
                              <BotaoRejeitar
                                onClick={() => handleRejeitar(usuario.id)}
                                disabled={processandoId === usuario.id}
                              />
                            </>
                          )}

                          <BotaoDeletar 
                            onClick={() => handleDeletar(usuario.id)}
                            disabled={processandoId === usuario.id || usuarioLogado?.id === usuario.id} 
                            title={usuarioLogado?.id === usuario.id ? "Apenas outro administrador pode excluir sua conta" : "Excluir Usuário"}
                          />

                        </div> 
                      </td>
                    </tr>
                  ))}

                  {usuariosFiltrados.length === 0 && !carregando && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Nenhum usuário encontrado com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacao
              totalItens={usuariosFiltrados.length}
              itensPorPagina={itensPorPagina}
              paginaAtual={paginaAtual}
              setPaginaAtual={setPaginaAtual}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};