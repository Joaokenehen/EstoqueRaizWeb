import { type Request, type Response } from "express";

export class UsuarioController {

    //POST
    async create(req: Request, res: Response) {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ 
                    message: 'Nome, email e senha são obrigatórios' 
                });
            }

            console.log(`Logica de criação para: ${email}`);
            
            return res.status(201).json({ 
                message: 'Usuário criado com sucesso', 
                user: { nome, email } 
            });

        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ 
                message: 'Erro interno do servidor' 
            });
        }
    }

    //GET   
    async list(req: Request, res: Response) {
        try {
            console.log('Listando usuários');
            const usuarios = [
                { id: '1', nome: 'João Silva', email: 'joao.silva@example.com' },
            ];
            return res.status(200).json({ usuarios });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar usuários' });
        }
    }
}