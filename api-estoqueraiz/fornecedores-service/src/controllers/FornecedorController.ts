import { Request, Response } from 'express';
import { FornecedorService } from '../services/FornecedorService';
import { info, warn, error } from '../utils/logger';

export const FornecedorController = {
  async listar(req: Request, res: Response) {
    try {
      info('FornecedorController.listar - requisição recebida');
      const fornecedores = await FornecedorService.listarTodos();
      res.json(fornecedores);
    } catch (err: any) {
      error('Erro ao listar fornecedores:', err);
      res.status(500).json({ message: 'Erro ao listar fornecedores', erro: err.message });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      info('FornecedorController.criar - dados recebidos:', req.body);
      const novo = await FornecedorService.criar(req.body);
      res.status(201).json(novo);
    } catch (err: any) {
      error('Erro detalhado ao criar fornecedor:', err);
      res.status(400).json({ message: err.message || 'Erro ao criar fornecedor' });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      info(`FornecedorController.atualizar - id: ${id}, dados:`, req.body);
      const atualizado = await FornecedorService.atualizar(id, req.body);
      res.json(atualizado);
    } catch (err: any) {
      error(`Erro detalhado ao atualizar fornecedor ${req.params.id}:`, err);
      res.status(400).json({ message: err.message || 'Erro ao atualizar fornecedor' });
    }
  },

  async deletar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      info(`FornecedorController.deletar - recebida solicitação de deleção para id: ${id}`);
      await FornecedorService.deletar(id);
      info(`FornecedorController.deletar - deleção concluída para id: ${id}`);
      res.status(200).json({ message: 'Fornecedor deletado com sucesso!' });
    } catch (err: any) {
      error(`Erro detalhado ao deletar fornecedor ${req.params.id}:`, err);
      res.status(400).json({ message: err.message || 'Erro ao deletar fornecedor' });
    }
  }
};