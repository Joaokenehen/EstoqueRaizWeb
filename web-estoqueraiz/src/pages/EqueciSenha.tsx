import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logoEstoque from '../assets/LogoEstoqueRaiz.png';
import { usuarioService } from '../services/usuarioService';

export const EsqueciSenha = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [loading, setLoading] = useState(false);

  const solicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      await usuarioService.solicitarRecuperacaoSenha(email);
      
      setMensagem({ texto: "Código de verificação enviado para o seu e-mail!", tipo: "sucesso" });
      setEtapa(2);
    } catch (error) {
      setMensagem({ texto: "Erro ao solicitar o código. Tente novamente.", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  const redefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      await usuarioService.redefinirSenha({
        email,
        codigoRecuperacao: codigo,
        novaSenha
      })

      setMensagem({ texto: "Senha redefinida com sucesso! Redirecionando...", tipo: "sucesso" });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setMensagem({ 
        texto: error.response?.data?.message || "Código inválido ou senha fraca.", 
        tipo: "erro" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-raiz-bege via-white to-raiz-bege font-sans p-4">
      <div className="w-full max-w-[400px] p-8 flex flex-col bg-white rounded-xl shadow-lg border-t-8 border-raiz-marrom relative">
        
        <button 
          onClick={() => navigate('/login')}
          className="absolute top-4 left-4 text-gray-400 hover:text-raiz-verde transition-colors"
          title="Voltar para o Login"
          data-testid="esqueci-btn-voltar-login"
        >
          <ArrowLeft size={24} />
        </button>

        <header className="text-center mb-6 mt-2">
          <img src={logoEstoque} alt="Estoque Raiz" className="w-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-raiz-marrom tracking-tight">
            Recuperar Senha
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {etapa === 1 ? "Enviaremos um código para o seu e-mail" : "Crie uma nova senha de acesso"}
          </p>
        </header>

        {mensagem.texto && (
          <div className={`p-3 mb-6 text-center rounded-lg text-sm font-semibold ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mensagem.texto}
          </div>
        )}

        {etapa === 1 ? (
          <form onSubmit={solicitarCodigo} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-raiz-marrom mb-1">Seu E-mail Cadastrado</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  maxLength={100}
                  data-testid="esqueci-input-email"
                  placeholder="exemplo@estoqueraiz.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-raiz-verde text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition-all disabled:opacity-70 mt-2"
            >
              {loading ? 'Enviando...' : 'Receber Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={redefinirSenha} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-sm font-semibold text-raiz-marrom mb-1">Código de 6 Dígitos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  data-testid="esqueci-input-codigo"
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all tracking-[0.2em] font-bold text-center"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-raiz-marrom mb-1">Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  maxLength={32}
                  data-testid="esqueci-input-nova-senha"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-raiz-verde focus:border-transparent outline-none transition-all"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-raiz-verde"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-raiz-verde text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition-all disabled:opacity-70 mt-4"
            >
              {loading ? 'Validando...' : 'Alterar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};