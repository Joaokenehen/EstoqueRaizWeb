import { MovimentacoesService } from '../services/MovimentacoesService';
import MovimentacoesModel from '../models/MovimentacoesModel';

// Mocks para não acessar o banco de dados real nem o Redis durante o teste unitário
jest.mock('../models/MovimentacoesModel');
jest.mock('../../../shared/utils/redisLock', () => ({
  executeWithLock: jest.fn(async (key, ttl, cb) => await cb()),
}));
jest.mock('../../../shared/config/database', () => ({
  sequelize: { query: jest.fn() }
}));

describe('MovimentacoesService - Testes Unitários', () => {
  const service = new MovimentacoesService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Método: criar() (CREATE)', () => {
    it('Deve lançar erro de validação se faltarem campos obrigatórios', async () => {
      const dadosIncompletos = { tipo: 'SAIDA', quantidade: 10 } as any;
      
      await expect(service.criar(dadosIncompletos))
        .rejects
        .toThrow('Campos obrigatórios faltando');
    });

    it('Deve lançar erro de validação se a quantidade for menor ou igual a zero', async () => {
      const dadosZerados = { tipo: 'ENTRADA', quantidade: 0, produto_id: 1, usuario_id: 1 } as any;
      
      await expect(service.criar(dadosZerados))
        .rejects
        .toThrow('Quantidade deve ser maior que zero');
    });

    it('Deve bloquear transferências com a mesma unidade de origem e destino', async () => {
      const dadosTransferencia = { 
        tipo: 'TRANSFERENCIA', quantidade: 5, produto_id: 1, usuario_id: 1, 
        unidade_origem_id: 2, unidade_destino_id: 2 
      } as any;
      
      await expect(service.criar(dadosTransferencia))
        .rejects
        .toThrow('Unidade de origem deve ser diferente da de destino');
    });
  });

  describe('Método: buscarPorId() (READ)', () => {
    it('Deve lançar erro NotFound se a movimentação não existir no banco', async () => {
      // Simulamos o banco de dados retornando vazio (null)
      (MovimentacoesModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.buscarPorId(999)).rejects.toThrow('Movimentação não encontrada');
    });
  });
});