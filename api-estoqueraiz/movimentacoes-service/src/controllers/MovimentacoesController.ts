import { Request, Response } from "express";
import { movimentacoesService } from "../services/MovimentacoesService";
import { asyncHandler } from "../../../shared/utils/tratamentoErros";
import { logger } from "../../../shared/utils/logger";

export const listarMovimentacoes = asyncHandler(
  async (req: Request, res: Response) => {
    const { produto_id, unidade_id, tipo, data_inicio, data_fim, status } = req.query;

    const filtros = {
      produto_id: produto_id ? parseInt(produto_id as string) : undefined,
      unidade_id: unidade_id ? parseInt(unidade_id as string) : undefined,
      tipo: tipo as any,
      data_inicio: data_inicio as string,
      data_fim: data_fim as string,
      status: status as any,
    };

    logger.info("Listando movimentações com filtros");
    const movimentacoes = await movimentacoesService.listarTodos(filtros);
    res.json(movimentacoes);
  }
);

export const buscarMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`Buscando movimentação ID: ${id}`);
    const movimentacao = await movimentacoesService.buscarPorId(parseInt(id));
    res.json(movimentacao);
  }
);

export const criarMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const { tipo, produto_id, valor_custo, valor_venda } = req.body;
    
    const unidade_origem_id = req.body.unidade_origem_id || req.usuario?.unidade_id;
    const unidade_destino_id = req.body.unidade_destino_id;

    // REGRA DE NEGÓCIO: Estoquista só movimenta na sua unidade
    if (req.usuario?.cargo === 'estoquista') {
      if (tipo === 'ENTRADA' && unidade_destino_id !== req.usuario.unidade_id) {
        return res.status(403).json({ message: "Acesso negado: Você só pode dar entrada de estoque na sua unidade." });
      }
      if ((tipo === 'SAIDA' || tipo === 'AJUSTE' || tipo === 'TRANSFERENCIA') && unidade_origem_id !== req.usuario.unidade_id) {
        return res.status(403).json({ message: "Acesso negado: Você só pode retirar estoque da sua unidade." });
      }
    }

    // REGRA: Toda ENTRADA criada pelo estoque começa como PENDENTE para o financeiro aprovar a precificação e a NF.
    const statusInicial = tipo === 'ENTRADA' ? 'pendente' : 'aprovado';

    logger.info(`Criando movimentação ${tipo} para produto ${produto_id}`);
    const movimentacao = await movimentacoesService.criar({
      ...req.body,
      status: statusInicial,
      valor_custo,
      valor_venda,
      usuario_id: req.usuario?.id,
      unidade_origem_id, 
    });
    res.status(201).json({
      message: "Movimentação criada com sucesso",
      movimentacao,
    });
  }
);

export const aprovarMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { valor_custo, valor_venda } = req.body;
    logger.info(`Aprovando entrada pendente ID: ${id}`);
    const movimentacao = await movimentacoesService.aprovar(parseInt(id), {
      valor_custo,
      valor_venda
    });
    res.json({
      message: "Movimentação aprovada com sucesso",
      movimentacao,
    });
  }
);

export const rejeitarMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`Rejeitando movimentação ID: ${id}`);
    const movimentacao = await movimentacoesService.rejeitar(parseInt(id));
    res.json({ message: "Movimentação rejeitada", movimentacao });
  }
);

export const deletarMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`Deletando movimentação ID: ${id}`);
    await movimentacoesService.deletar(parseInt(id));
    res.json({
      message: "Movimentação deletada com sucesso",
    });
  }
);
