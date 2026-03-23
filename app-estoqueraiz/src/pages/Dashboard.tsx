import { useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';
import { modulos } from '../data/modulos'; 

export function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@EstoqueRaiz:token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-raiz-verde rounded-lg flex items-center justify-center">
            <Package className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-raiz-marrom">Estoque Raiz</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 font-medium hidden sm:block">
            Bem-vindo(a) ao painel
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg"
          >
            <LogOut size={20} />
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 mt-1">Selecione o módulo que deseja acessar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((modulo) => {
            const IconeDoModulo = modulo.icon;

            return (
              <button
                key={modulo.nome}
                onClick={() => navigate(modulo.rota)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-raiz-verde transition-all duration-200 flex items-start text-left group"
              >
                <div className={`p-4 rounded-lg ${modulo.corFundo} ${modulo.corIcone} mr-5 group-hover:scale-110 transition-transform duration-200`}>
                  <IconeDoModulo size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-raiz-verde transition-colors">
                    {modulo.nome}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {modulo.descricao}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}