import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importação da logo (ajuste o caminho se necessário)
import logoEstoque from '../assets/LogoEstoqueRaiz.png';
import '../styles/login.css';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login disparado");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          {/* Adicionando a Logo */}
          <div className="logo-wrapper">
            <img 
              src={logoEstoque} 
              alt="Logo Estoque Raiz" 
              className="login-logo" 
              data-test="img-logo"
            />
          </div>
          
          <h1 className="titulo">Login</h1>
          <p className="subtitulo">Acesse sua conta para continuar</p>
        </header>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              className="web-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-test="input-email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Senha"
              className="web-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              data-test="input-password"
            />
          </div>

          <button 
            type="submit" 
            className="botao-entrar"
            data-test="button-login"
          >
            Entrar
          </button>
        </form>

        <footer className="login-footer">
          <p className="footer-texto">
            Não tem uma conta?{" "}
            <span 
              className="link-cadastro" 
              onClick={() => navigate("/cadastro")}
              data-test="link-cadastro"
            >   
              Crie uma aqui
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};