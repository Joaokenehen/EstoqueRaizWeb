import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login disparado com:", email);
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
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              input-testid="senha-input"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-raiz-verde hover:bg-opacity-90 text-white font-bold py-3 rounded-lg shadow-md transform active:scale-[0.98] transition-all duration-150 mt-2"
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