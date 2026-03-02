import React, { useState } from 'react';
import '../styles/Cadastro.css';

const Cadastro: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ texto: data.message, cor: 'green' });
        setNome(''); setEmail(''); setSenha(''); // Limpa o formulário
      } else {
        setMensagem({ texto: data.message || 'Erro ao cadastrar', cor: 'red' });
      }
    } catch (error) {
      setMensagem({ texto: 'Não foi possível conectar ao servidor.', cor: 'red' });
    }
  };

  return (
    <div className="cadastro-container">
      <form className="cadastro-card" onSubmit={handleCadastro}>
        <h2>Estoque Raiz - Cadastro</h2>
        
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <input 
            type="password" 
            placeholder="Senha" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="btn-cadastrar">Cadastrar</button>

        {mensagem.texto && (
          <p className="mensagem" style={{ color: mensagem.cor }}>
            {mensagem.texto}
          </p>
        )}
      </form>
    </div>
  );
};

export default Cadastro;