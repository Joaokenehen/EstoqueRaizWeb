import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';
import api from '../services/api'; 

export const Cadastro = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState(""); 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState({ texto: "", cor: "" });
  const [cpf, setCpf] = useState("");

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/usuarios', {
        nome,
        email,
        senha,
        cpf, 
      });

      if (response.status === 201) {
        setMensagem({ texto: 'Usuário criado com sucesso!', cor: 'green' });
        setNome(''); setEmail(''); setSenha('');
      }
    } catch (error: any) {
      const erroBackend = error.response?.data?.message || 'Erro ao cadastrar';
      setMensagem({ texto: erroBackend, cor: 'red' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-raiz-bege font-sans p-4">
      <div className="w-full max-w-[400px] p-8 flex flex-col bg-white rounded-xl shadow-lg border-t-8 border-raiz-marrom">
        
        <header className="text-center mb-6">
          <img 
            src={logoEstoque} 
            alt="Estoque Raiz" 
            className="w-48 md:w-56 mx-auto mb-4 drop-shadow-md cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl font-bold text-raiz-marrom tracking-tight">
            Criar Nova Conta
          </h1>
          <div className="h-1 w-12 bg-raiz-verde mx-auto mt-2 rounded-full"></div>
        </header>

        {mensagem.texto && (
          <div className={`p-3 mb-4 text-center rounded-lg font-semibold text-white ${mensagem.cor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              data-testid="nome-input" 
            />
          </div>

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
              data-testid="email-input"
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
              data-testid="senha-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              CPF (Apenas números)
            </label>
            <input
              type="text"
              placeholder="00000000000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} // Expressão para aceitar só números
              maxLength={11}
              required
              data-testid="cpf-input"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-raiz-verde hover:bg-opacity-90 text-white font-bold py-3 rounded-lg shadow-md transform active:scale-[0.98] transition-all duration-150 mt-4"
          >
            Finalizar Cadastro
          </button>
        </form>

        <footer className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Já possui uma conta?{' '}
            <span 
              onClick={() => navigate('/')}
              className="text-raiz-verde font-bold cursor-pointer hover:underline"
            >
              Fazer Login
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};