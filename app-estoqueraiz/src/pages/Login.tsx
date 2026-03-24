import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // <-- Importamos os ícones
import logoEstoque from '../assets/LogoEstoqueRaiz.png';
import api from '../services/api'; 

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false); // <-- Estado do olhinho

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/auth/login', { 
        email, 
        senha 
      });

      const { token, usuario } = response.data;
      localStorage.setItem('@EstoqueRaiz:token', token);
      localStorage.setItem('@EstoqueRaiz:usuario', JSON.stringify(usuario));

      console.log("Login feito com sucesso!");
      navigate('/dashboard'); 

    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      alert("Email ou senha incorretos!");
    }
  };

return (
    <div className="min-h-screen w-full flex items-center justify-center bg-raiz-bege font-sans">
      <div className="w-full max-w-[360px] p-6 flex flex-col bg-white rounded-xl shadow-lg border-t-8 border-raiz-marrom">
        
        <header className="text-center mb-10">
          <img 
            src={logoEstoque} 
            alt="Estoque Raiz" 
            className="w-48 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bem-vindo
          </h1>
          <p className="text-sm text-gray-500 mt-2">
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
              onChange={(e) => setEmail(e.target.value)}
              required
              input-testid="email-input"
            />
          </div>

          <div>
            {/* O "Esqueceu a senha?" agora fica aqui, na mesma linha da Label */}
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-raiz-marrom">
                Senha
              </label>
              <button
                type="button"
                onClick={() => navigate('/esqueci-senha')}
                className="text-xs font-semibold text-raiz-verde hover:text-green-700 transition-colors hover:underline"
                tabIndex={-1} // Evita que o tab pare aqui antes do input da senha
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
                onChange={(e) => setSenha(e.target.value)}
                required
                input-testid="senha-input"
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

          <button
            type="submit"
            className="w-full bg-raiz-verde hover:bg-opacity-90 text-white font-bold py-3 rounded-lg shadow-md transform active:scale-[0.98] transition-all duration-150 mt-6"
          >
            Entrar no Sistema
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <span 
              onClick={() => navigate('/cadastro')}
              className="text-raiz-verde font-bold cursor-pointer hover:underline"
            >
              Cadastre-se aqui
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};