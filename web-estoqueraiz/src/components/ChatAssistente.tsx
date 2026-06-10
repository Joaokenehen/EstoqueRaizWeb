import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Mensagem {
  role: 'user' | 'ai';
  texto: string;
}

const getSaudacaoInicial = () => {
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;
  const nome = usuario?.nome?.split(' ')[0] || 'parceiro(a)';
  
  const saudacoes = [
    `Olá, ${nome}! Sou o Assistente Raiz. Como posso ajudar com o estoque hoje?`,
    `E aí, ${nome}! Tudo pronto para organizar nosso estoque?`,
    `Boas-vindas, ${nome}! Qual a missão de hoje no sistema?`,
    `Fala, ${nome}! Precisando de um resumo do estoque ou relatórios? É só pedir!`,
    `Olá, ${nome}! Preparado(a) para manter tudo nos trilhos? Como posso ser útil?`
  ];

  return saudacoes[Math.floor(Math.random() * saudacoes.length)];
};

export const ChatAssistente = () => {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>(() => [
    { role: 'ai', texto: getSaudacaoInicial() }
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);
  const fimChatRef = useRef<HTMLDivElement>(null);

  // Mostra a dica flutuante de forma mais espaçada e garante que só apareça uma vez por sessão
  useEffect(() => {
    const dicaJaMostrada = sessionStorage.getItem('@EstoqueRaiz:dicaIaMostrada');
    
    if (!dicaJaMostrada) {
      const timerShow = setTimeout(() => setMostrarDica(true), 15000); // Aguarda 15s para mostrar
      const timerHide = setTimeout(() => {
        setMostrarDica(false);
        sessionStorage.setItem('@EstoqueRaiz:dicaIaMostrada', 'true');
      }, 25000); // Oculta sozinho após mais 10s visível
      
      return () => { 
        clearTimeout(timerShow); 
        clearTimeout(timerHide); 
      };
    }
  }, []);

  // Rola o chat para baixo automaticamente quando chega uma nova mensagem
  useEffect(() => {
    if (fimChatRef.current) {
      fimChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, aberto]);

  const enviarMensagem = async () => {
    if (!input.trim() || carregando) return;

    const textoUsuario = input.trim();
    setInput('');
    setMensagens(prev => [...prev, { role: 'user', texto: textoUsuario }]);
    setCarregando(true);

    // O Gemini exige que o histórico comece com 'user' e alterne.
    // O slice(1) remove a primeira mensagem de boas-vindas ('ai') gerada pelo nosso frontend.
    const historicoFormatado = mensagens.slice(1).map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.texto }]
    }));

    try {
      // O seu API Gateway já roteia /api/ia para o ia-service!
      const response = await api.post('/api/ia/chat', { mensagem: textoUsuario, historico: historicoFormatado });
      
      setMensagens(prev => [...prev, { 
        role: 'ai', 
        texto: response.data.resposta || 'Desculpe, não consegui processar a resposta.' 
      }]);
    } catch (error) {
      console.error('Erro na IA:', error);
      setMensagens(prev => [...prev, { 
        role: 'ai', 
        texto: 'Ocorreu um erro ao me comunicar com o servidor. Tente novamente mais tarde.' 
      }]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {aberto && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-80 sm:w-96 h-[32rem] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
           {/* Header do Chat */}
           <div className="bg-raiz-verde text-white p-3 flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-2 font-bold">
               <Bot size={20} /> Assistente Raiz
             </div>
             <button onClick={() => setAberto(false)} className="hover:text-gray-200 transition-colors">
               <X size={20}/>
             </button>
           </div>
           
           {/* Corpo do Chat */}
           <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
             {mensagens.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 text-sm rounded-2xl max-w-[85%] shadow-sm ${
                    m.role === 'ai' 
                      ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-none whitespace-pre-wrap' 
                      : 'bg-raiz-verde-claro text-raiz-verde rounded-tr-none font-medium'
                  }`}>
                    {m.texto}
                  </div>
                </div>
             ))}
             {carregando && (
               <div className="flex justify-start">
                  <div className="p-3 text-sm rounded-2xl bg-white border border-gray-200 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-raiz-verde" /> Pesquisando no estoque...
                  </div>
               </div>
             )}
             <div ref={fimChatRef} />
           </div>
           
           {/* Input */}
           <div className="p-3 bg-white border-t border-gray-100 flex flex-col">
             <div className="flex gap-2 items-center">
               <input 
                 className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-raiz-verde focus:border-transparent transition-all" 
                 value={input} 
                 onChange={e => setInput(e.target.value)} 
                 onKeyDown={e => e.key === 'Enter' && enviarMensagem()}
                 placeholder="Pergunte algo..." 
                 disabled={carregando}
                 maxLength={500}
               />
               <button 
                 onClick={enviarMensagem} 
                 disabled={!input.trim() || carregando}
                 className="bg-raiz-verde text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
               >
                 <Send size={18}/>
               </button>
             </div>
             <span className="text-[10px] text-gray-400 self-end pr-[42px] mt-1">
               {input.length}/500
             </span>
           </div>
        </div>
      )}
      
      {!aberto && (
        <div className="relative flex items-end justify-end">
          {mostrarDica && (
            <>
              <style>{`
                @keyframes dica-pop-in {
                  0% { opacity: 0; transform: scale(0.6) translate(20px, 10px); }
                  70% { opacity: 1; transform: scale(1.05) translate(-2px, -2px); }
                  100% { opacity: 1; transform: scale(1) translate(0, 0); }
                }
              `}</style>
              <div 
                className="absolute right-full mr-4 bottom-2 bg-white text-slate-700 text-sm px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-gray-200 w-max max-w-xs cursor-pointer origin-bottom-right"
                style={{ animation: 'dica-pop-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                onClick={() => { 
                  setAberto(true); 
                  setMostrarDica(false); 
                  sessionStorage.setItem('@EstoqueRaiz:dicaIaMostrada', 'true');
                }}
              >
                <span className="font-semibold text-raiz-verde">Psiu!</span> Tô por aqui se precisar de ajuda com o estoque. 👀
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setMostrarDica(false); 
                    sessionStorage.setItem('@EstoqueRaiz:dicaIaMostrada', 'true');
                  }} 
                  className="absolute -top-2 -left-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full p-1 shadow-sm transition-colors"
                  title="Fechar aviso"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            </>
          )}
          <button 
            onClick={() => { 
              setAberto(true); 
              setMostrarDica(false); 
              sessionStorage.setItem('@EstoqueRaiz:dicaIaMostrada', 'true');
            }} 
            className="bg-raiz-verde text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center group"
            title="Falar com o Assistente"
          >
            <Bot size={28} className="group-hover:animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
};