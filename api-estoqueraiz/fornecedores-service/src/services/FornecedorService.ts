import { Fornecedor } from '../models/Fornecedor';
import { info, warn, error } from '../utils/logger';

export const FornecedorService = {
  async listarTodos() {
    info('FornecedorService.listarTodos - iniciando');
    const lista = await Fornecedor.findAll({ order: [['criado_em', 'DESC']] });
    info(`FornecedorService.listarTodos - ${lista.length} registros retornados`);
    return lista;
  },

  async criar(dados: Partial<Fornecedor>) {
    try {
      info('FornecedorService.criar - dados recebidos:', dados);
      const novo = await Fornecedor.create(dados);
      info('FornecedorService.criar - registro criado:', novo.toJSON());
      return novo;
    } catch (err) {
      error('FornecedorService.criar - erro ao criar:', err);
      throw err;
    }
  },

  async atualizar(id: number, dados: Partial<Fornecedor>) {
    try {
      info(`FornecedorService.atualizar - id: ${id}, dados:`, dados);
      const fornecedor = await Fornecedor.findByPk(id);
      if (!fornecedor) {
        warn(`FornecedorService.atualizar - fornecedor ${id} não encontrado`);
        throw new Error('Fornecedor não encontrado');
      }
      const atualizado = await fornecedor.update(dados);
      info('FornecedorService.atualizar - atualizado:', atualizado.toJSON());
      return atualizado;
    } catch (err) {
      error('FornecedorService.atualizar - erro:', err);
      throw err;
    }
  },

  async deletar(id: number) {
    try {
      info(`FornecedorService.deletar - solicitando deleção id: ${id}`);
      const fornecedor = await Fornecedor.findByPk(id);
      if (!fornecedor) {
        warn(`FornecedorService.deletar - fornecedor ${id} não encontrado`);
        throw new Error('Fornecedor não encontrado');
      }
      await fornecedor.destroy();
      info(`FornecedorService.deletar - fornecedor ${id} removido com sucesso`);
    } catch (err) {
      error('FornecedorService.deletar - erro:', err);
      throw err;
    }
  }
};