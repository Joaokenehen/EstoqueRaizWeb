import { useState, useEffect } from 'react';
import axios from 'axios';
import { fornecedorService, type Fornecedor } from '../services/fornecedorService';
import { BarraFiltros } from '../components/BarraFiltro';
import { Plus, Truck, MapPin } from 'lucide-react';
import { BotaoEditar, BotaoDeletar } from '../components/BotoesAcao';
import { LoadingSpinner } from '../components/Feedbacks';
import Layout from '../components/Layout';
import { Modal } from '../components/Modal';
import { FormularioBase } from '../components/FormularioBase';
import { Paginacao } from '../components/Paginacao';
import toast from 'react-hot-toast';

export const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dataAbertura, setDataAbertura] = useState('');
  
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuarioLogado = usuarioString ? JSON.parse(usuarioString) : null;
  const podeGerenciar = usuarioLogado?.cargo === 'gerente' || usuarioLogado?.cargo === 'financeiro';
  
  const [buscaTexto, setBuscaTexto] = useState('');
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);
  
  const [formData, setFormData] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '', telefone: '', email: '',
    cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
  });

  const formatarCnpj = (valor: string) => {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 14);

    if (apenasDigitos.length <= 2) return apenasDigitos;
    if (apenasDigitos.length <= 5) return `${apenasDigitos.slice(0, 2)}.${apenasDigitos.slice(2)}`;
    if (apenasDigitos.length <= 8) return `${apenasDigitos.slice(0, 2)}.${apenasDigitos.slice(2, 5)}.${apenasDigitos.slice(5)}`;
    if (apenasDigitos.length <= 12) return `${apenasDigitos.slice(0, 2)}.${apenasDigitos.slice(2, 5)}.${apenasDigitos.slice(5, 8)}/${apenasDigitos.slice(8)}`;

    return `${apenasDigitos.slice(0, 2)}.${apenasDigitos.slice(2, 5)}.${apenasDigitos.slice(5, 8)}/${apenasDigitos.slice(8, 12)}-${apenasDigitos.slice(12)}`;
  };

  const formatarTelefone = (valor: string) => {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 11);

    if (apenasDigitos.length <= 2) return apenasDigitos;
    if (apenasDigitos.length <= 6) return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
    if (apenasDigitos.length <= 10) return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 6)}-${apenasDigitos.slice(6)}`;

    return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7)}`;
  };

  const formatarCep = (valor: string) => {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 8);

    if (apenasDigitos.length <= 5) return apenasDigitos;

    return `${apenasDigitos.slice(0, 5)}-${apenasDigitos.slice(5)}`;
  };

  const formatarData = (valor: string) => {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 8);

    if (apenasDigitos.length <= 2) return apenasDigitos;
    if (apenasDigitos.length <= 4) return `${apenasDigitos.slice(0, 2)}/${apenasDigitos.slice(2)}`;

    return `${apenasDigitos.slice(0, 2)}/${apenasDigitos.slice(2, 4)}/${apenasDigitos.slice(4)}`;
  };

  const carregarFornecedores = async () => {
    try {
      setCarregando(true);
      const dados = await fornecedorService.listarTodos();
      setFornecedores(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarFornecedores(); }, []);
  useEffect(() => { setPaginaAtual(1); }, [buscaTexto, itensPorPagina]);

  const filtrados = fornecedores.filter(f => 
    f.razao_social.toLowerCase().includes(buscaTexto.toLowerCase()) || 
    f.cnpj.includes(buscaTexto) ||
    (f.nome_fantasia && f.nome_fantasia.toLowerCase().includes(buscaTexto.toLowerCase()))
  );

  const handleBuscaCnpj = async (cnpjBuscado: string) => {
    const cnpjLimpo = cnpjBuscado.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cnpj: cnpjLimpo }));

    if (cnpjLimpo.length === 14) {
      const toastId = toast.loading('Consultando Receita Federal...');
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia || data.razao_social,
          telefone: data.ddd_telefone_1 ? data.ddd_telefone_1 : '',
          cep: data.cep || '',
          rua: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.municipio || '',
          estado: data.uf || ''
        }));
        toast.success('Dados preenchidos automaticamente!', { id: toastId });
      } catch {
        toast.error('CNPJ não encontrado.', { id: toastId });
      }
    }
  };

  const abrirModal = (forn?: Fornecedor) => {
    if (forn) {
      setFornecedorEditando(forn);
      setDataAbertura('');
      setFormData({ ...forn, nome_fantasia: forn.nome_fantasia || '', telefone: forn.telefone || '', email: forn.email || '', cep: forn.cep || '', rua: forn.rua || '', numero: forn.numero || '', bairro: forn.bairro || '', cidade: forn.cidade || '', estado: forn.estado || '' });
    } else {
      setFornecedorEditando(null);
      setDataAbertura('');
      setFormData({ razao_social: '', nome_fantasia: '', cnpj: '', telefone: '', email: '', cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' });
    }
    setModalAberto(true);
  };

  const handleSubmit = async () => {
    setProcessandoAcao(true);
    try {
      if (fornecedorEditando) {
        await fornecedorService.atualizar(fornecedorEditando.id, formData);
        toast.success('Fornecedor atualizado!');
      } else {
        await fornecedorService.criar(formData);
        toast.success('Fornecedor cadastrado!');
      }
      setModalAberto(false);
      await carregarFornecedores();
    } catch (error: unknown) {
      const mensagemErro = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Erro ao salvar o fornecedor. Verifique os dados e tente novamente.'
        : 'Erro ao salvar o fornecedor. Verifique os dados e tente novamente.';
      toast.error(mensagemErro);
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleDeletar = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-800 text-sm">Desejas realmente excluir este fornecedor?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700" onClick={async () => {
            toast.dismiss(t.id);
            try {
              await fornecedorService.deletar(id);
              toast.success('Fornecedor excluído com sucesso!');
              await carregarFornecedores();
            } catch (error: unknown) {
              const mensagemErro = axios.isAxiosError(error)
                ? error.response?.data?.message || 'Erro ao excluir fornecedor.'
                : 'Erro ao excluir fornecedor.';
              toast.error(mensagemErro);
            }
          }}>Excluir</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-500 mt-2">Gestão de fornecedores e parceiros de negócios.</p>
          </div>
          {podeGerenciar && (
            <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-raiz-verde text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-sm font-medium">
              <Plus size={20} /> Novo Fornecedor
            </button>
          )}
        </header>

        <BarraFiltros buscaTexto={buscaTexto} onBuscaChange={setBuscaTexto} placeholderBusca="Buscar Razão Social ou CNPJ..." itensPorPagina={itensPorPagina} onItensPorPaginaChange={setItensPorPagina} />

        {carregando ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Empresa</th>
                    <th className="p-4 font-semibold">Contato</th>
                    <th className="p-4 font-semibold">Localização</th>
                    {podeGerenciar && <th className="p-4 font-semibold text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina).map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div>
                        <div>
                          <p className="font-bold text-gray-900">{f.nome_fantasia || f.razao_social}</p>
                          <p className="text-xs text-gray-500">CNPJ: {f.cnpj}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <p className="text-gray-900">{f.email || 'Sem e-mail'}</p>
                        <p className="text-gray-500">{f.telefone || 'Sem telefone'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {f.cidade}/{f.estado}</div>
                      </td>
                      {podeGerenciar && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <BotaoEditar onClick={() => abrirModal(f)} />
                            <BotaoDeletar onClick={() => handleDeletar(f.id)} title="Excluir Fornecedor" />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao totalItens={filtrados.length} itensPorPagina={itensPorPagina} paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />
          </div>
        )}
      </div>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} titulo={fornecedorEditando ? 'Editar Fornecedor' : 'Novo Fornecedor'} maxWidth="max-w-3xl">
        <FormularioBase onSubmit={handleSubmit} processando={processandoAcao} textoBotaoSubmit="Salvar Fornecedor">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100 flex items-center gap-2">
            <Truck size={18} /> Digite o CNPJ para preencher os dados da empresa automaticamente.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium mb-1">CNPJ *</label>
              <input
                required
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                value={formatarCnpj(formData.cnpj)}
                onChange={(e) => handleBuscaCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
            <div className="col-span-12 md:col-span-8">
              <label className="block text-sm font-medium mb-1">Razão Social *</label>
              <input required type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" value={formData.razao_social} onChange={e => setFormData({...formData, razao_social: e.target.value})} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" value={formData.nome_fantasia} onChange={e => setFormData({...formData, nome_fantasia: e.target.value})} />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                value={formatarTelefone(formData.telefone)}
                onChange={e => setFormData({...formData, telefone: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input type="email" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="col-span-12 border-t pt-2 mt-2"><h3 className="font-semibold text-gray-700">Endereço</h3></div>
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                value={formatarCep(formData.cep)}
                onChange={e => setFormData({...formData, cep: e.target.value.replace(/\D/g, '').slice(0, 8)})}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium mb-1">Data de abertura</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde"
                value={formatarData(dataAbertura)}
                onChange={e => setDataAbertura(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde bg-gray-50" value={formData.cidade} readOnly />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="block text-sm font-medium mb-1">UF</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-raiz-verde bg-gray-50" value={formData.estado} readOnly />
            </div>
          </div>
        </FormularioBase>
      </Modal>
    </Layout>
  );
};