import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { modulos } from '../data/modulos';

export function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@EstoqueRaiz:usuario');
    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  const modulosPermitidos = usuario ? modulos.filter((modulo) => {
    if (!usuario || !usuario.cargo) return false;
    return modulo.cargosPermitidos.includes(usuario.cargo);
  }) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 mt-1">Acesse seus atalhos rápidos abaixo ou use o menu lateral.</p>
        </div>

        {modulosPermitidos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulosPermitidos.map((modulo) => {
              const IconeDoModulo = modulo.icon;
              return (
                <button
                  key={`card-${modulo.nome}`}
                  onClick={() => navigate(modulo.rota)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-raiz-verde transition-all duration-200 flex items-start text-left group"
                >
                  <div className={`p-4 rounded-lg ${modulo.corFundo} ${modulo.corIcone} mr-5 group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                    <IconeDoModulo size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-raiz-verde transition-colors">
                      {modulo.nome}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">{modulo.descricao}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center animate-in fade-in duration-300">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <Lock size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Você ainda não possui permissões associadas à sua conta para acessar os módulos do sistema. 
              Por favor, entre em contato com um <strong className="text-raiz-marrom">Gerente</strong> para solicitar o acesso.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
