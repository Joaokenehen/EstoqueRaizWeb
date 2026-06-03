import { Request, Response } from 'express';
import iaService from '../services/iaService';
import { ChatRequestDTO } from '../dto/ia.dto';

class IaController {
  async conversar(req: Request<{}, {}, ChatRequestDTO>, res: Response) {
    try {
      const { mensagem, historico } = req.body;
      const token = req.headers.authorization;

      if (!mensagem || mensagem.trim() === '') {
        return res.status(400).json({ error: 'A mensagem do usuário é obrigatória.' });
      }

      const resposta = await iaService.processarMensagem(mensagem, token, historico);
      return res.status(200).json({ resposta });
    } catch (error: any) {
      console.error('Erro no IA Controller:', error);
      return res.status(500).json({ error: 'Falha ao processar solicitação de IA', detalhe: error.message });
    }
  }
}

export default new IaController();