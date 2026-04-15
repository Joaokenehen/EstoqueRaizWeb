import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 
import logoEstoque from '../assets/LogoEstoqueRaiz.png';
import { usuarioService } from '../services/usuarioService';
import { CheckCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Cadastro = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState(""); 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState({ texto: "", cor: "" });
  const [cpf, setCpf] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagem({ texto: 'As senhas não coincidem!', cor: 'red' });
      return;
    }

    try {
      const response = await usuarioService.cadastrar({
        nome,
        email,
        senha,
        cpf,
      });

      if (response.status === 201) {
        setMensagem({ texto: '', cor: '' });
        setModalSucessoAberto(true);
        setNome(''); setEmail(''); setSenha(''); setConfirmarSenha(''); setCpf('');
      }
    } catch (error: any) {
      const erroBackend = error.response?.data?.message || 'Erro ao cadastrar';
      setMensagem({ texto: erroBackend, cor: 'red' });
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
            data-testid="logo-estoque"
          />
          <h1 className="text-2xl font-bold text-raiz-marrom tracking-tight">
            Criar Nova Conta
          </h1>
          <div className="h-1 w-12 bg-raiz-verde mx-auto mt-2 rounded-full"></div>
        </header>

        {mensagem.texto && (
          <div 
            className={`p-3 mb-4 text-center rounded-lg font-semibold text-white ${mensagem.cor === 'green' ? 'bg-green-500' : 'bg-red-500'}`}
            data-testid="mensagem-feedback"
          >
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde outline-none transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100} 
              required
              data-testid="nome-input" 
            />
            <p className="text-[10px] text-right text-gray-400 mt-1">{nome.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              CPF (Apenas números)
            </label>
            <input
              type="text"
              placeholder="00000000000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde outline-none transition-all"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              required
              data-testid="cpf-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde outline-none transition-all"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                maxLength={32}
                required
                data-testid="senha-input"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-raiz-verde transition-colors"
                data-testid="toggle-password-visibility"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-raiz-marrom mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition-all ${
                  confirmarSenha && senha !== confirmarSenha 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-raiz-verde'
                }`}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                maxLength={32}
                required
                data-testid="confirmar-senha-input"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-raiz-verde transition-colors"
                data-testid="toggle-confirm-password-visibility"
              >
                {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {confirmarSenha && senha !== confirmarSenha && (
              <p className="text-red-500 text-xs mt-1 font-medium" data-testid="senha-error-msg">
                As senhas não conferem.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-raiz-verde hover:bg-opacity-90 text-white font-bold py-3 rounded-lg shadow-md transform active:scale-[0.98] transition-all duration-150 mt-4"
            data-testid="btn-finalizar-cadastro"
          >
            Finalizar Cadastro
          </button>
        </form>

        <footer className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Já possui uma conta?{' '}
            <span 
              onClick={() => navigate('/login')}
              className="text-raiz-verde font-bold cursor-pointer hover:underline"
              data-testid="link-login"
            >
              Fazer Login
            </span>
          </p>
        </footer>
      </div>
      <Modal 
        isOpen={modalSucessoAberto} 
        onClose={() => {
          setModalSucessoAberto(false);
          navigate('/login'); 
        }} 
        titulo="Status do Cadastro" 
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          
          <div className="relative flex items-center justify-center mb-4 mt-2">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
            <div className="relative rounded-full bg-green-100 p-4 shadow-sm" style={{ animation: 'modal-scale-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s', opacity: 0 }}>
              <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800" style={{ animation: 'modal-fade-in 0.8s ease-out forwards 0.3s', opacity: 0 }}>Conta Criada!</h3>
          
          <p className="text-gray-600 text-sm" style={{ animation: 'modal-fade-in 0.8s ease-out forwards 0.4s', opacity: 0 }}>
            Seu cadastro foi realizado com sucesso. Sua conta está <strong>em análise</strong> e, assim que for aprovada por um gerente, você poderá acessar o sistema.
          </p>
          
          <button
            onClick={() => {
              setModalSucessoAberto(false);
              navigate('/login'); 
            }}
            className="mt-6 w-full py-3 bg-raiz-verde text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md active:scale-[0.98]"
            data-testid="btn-ir-para-login"
          >
            Ir para o Login
          </button>
        </div>
      </Modal>
    </div>
  );
};