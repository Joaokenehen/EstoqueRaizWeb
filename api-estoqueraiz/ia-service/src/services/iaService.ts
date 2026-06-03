import axios from 'axios';
import { genAI } from '../config/gemini';

class IaService {
  async processarMensagem(mensagemUsuario: string, jwtToken?: string, historico: any[] = []) {
    const ferramentas: any[] = [
      {
        functionDeclarations: [
          {
            name: 'consultar_produtos',
            description: 'Busca os produtos do estoque. Pode buscar todos ou filtrar por um nome específico.',
          },
          {
            name: 'consultar_estatisticas_estoque',
            description: 'Busca as estatísticas gerais (total em estoque, alertas de vencimento, e total de movimentações)',
          }
        ]
      }
    ];

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: ferramentas,
      systemInstruction: `Você é o Assistente Virtual do sistema "Estoque Raiz", um WMS para produtos agrícolas. 
      Você deve ser direto, profissional e ajudar os estoquistas a ler dados reais. 
      Sempre use as ferramentas (funções) para buscar os dados de estoque.`
    });

    const chat = model.startChat({
      history: historico
    });

    // 1. Enviar para o Gemini analisar se precisa usar alguma ferramenta
    const result = await chat.sendMessage(mensagemUsuario);
    const call = result.response.functionCalls()?.[0];
      
    // 2. A IA decidiu chamar uma função?
    if (call) {
      let dadosDaApi: any = null;
      
      // Configuração do Axios para repassar o JWT aos outros microsserviços internos
      const axiosConfig = jwtToken ? { headers: { Authorization: jwtToken } } : {};

      try {
        if (call.name === 'consultar_produtos') {
            // Chama a API interna de produtos via Docker Network
          const res = await axios.get('http://produtos-service:3005/api/produtos', axiosConfig);
          dadosDaApi = res.data;
        } 
        else if (call.name === 'consultar_estatisticas_estoque') {
            // Chama a API interna de relatórios via Docker Network
          const res = await axios.get('http://relatorios-service:3007/api/relatorios/estatisticas', axiosConfig);
          dadosDaApi = res.data;
        }
      } catch (err: any) {
        console.error(`Erro ao chamar microserviço [${call.name}]:`, err.message);
        dadosDaApi = { erro: "Serviço interno não disponível ou sem permissão" };
      }

      // 3. Devolvemos o resultado da API real para o Gemini
      const finalResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name, // <-- A VÍRGULA SALVADORA DEVE ESTAR AQUI
          response: { dados: dadosDaApi }
        }
      }]);

      return finalResult.response.text();
    }

    // 4. Se não chamou ferramenta, apenas devolve a resposta normal
    return result.response.text();
  }
}

export default new IaService();