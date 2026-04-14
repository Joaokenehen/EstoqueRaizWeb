import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await authService.login({ email, senha });

      localStorage.setItem('@EstoqueRaiz:token', resposta.token);
      localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(resposta.usuario));

      navigate('/dashboard');
      
   } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        const mensagemBackend = error.response.data.message;

        if (mensagemBackend.toLowerCase().includes('aprovada') || mensagemBackend.toLowerCase().includes('pendente')) {
          setErro('Sua conta está em análise. Por favor, aguarde a aprovação de um gerente para acessar o sistema.');
        }
        else if (mensagemBackend.toLowerCase().includes('rejeitada')) {
          setErro('O acesso para esta conta foi negado. Contate o administrador.');
        }
        else {
          setErro(mensagemBackend); 
        }
      } else {
        setErro('Falha ao conectar com o servidor. Tente novamente mais tarde.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-raiz-bege via-white to-raiz-bege font-sans p-4">
      <div className="w-full max-w-[400px] p-8 flex flex-col bg-white rounded-xl shadow-lg border-t-8 border-raiz-marrom">
        
        <header className="text-center mb-6">
          <img 
            src={logoEstoque} 
            alt="Estoque Raiz" 
            className="w-48 md:w-56 mx-auto mb-4 drop-shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => navigate('/')}
            title="Voltar para a página inicial"
          />
          <h1 className="text-2xl font-bold text-raiz-marrom tracking-tight">
            Bem-vindo
          </h1>
          <div className="h-1 w-12 bg-raiz-verde mx-auto mt-2 rounded-full mb-4"></div>
          <p className="text-sm text-gray-500">
            Acesse seu painel de estoque
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
              value={email}
              maxLength={100}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-raiz-marrom">
                Senha
              </label>
              <button
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="text-xs font-semibold text-raiz-verde hover:text-green-700 transition-colors hover:underline"
                tabIndex={-1}
                data-testid="login-link-esqueci-senha"
              >
                Esqueceu a senha?
              </button>
            </div>
          
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
                value={senha}
                maxLength={32}
                onChange={(e) => setSenha(e.target.value)}
                required
                data-testid="senha-input"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-raiz-verde transition-colors"
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

         {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold text-center border border-red-200 animate-in fade-in zoom-in duration-200">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando} 
            className={`w-full text-white font-bold py-3 rounded-lg shadow-md transition-all duration-150 mt-6 
              ${carregando 
                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                : 'bg-raiz-verde hover:bg-opacity-90 active:scale-[0.98]'
              }`}
          >
            {carregando ? 'Processando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <footer className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <span 
              onClick={() => navigate('/cadastro')}
              className="text-raiz-verde font-bold cursor-pointer hover:underline"
              data-testid="login-link-cadastro"
            >
              Cadastre-se aqui
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};
