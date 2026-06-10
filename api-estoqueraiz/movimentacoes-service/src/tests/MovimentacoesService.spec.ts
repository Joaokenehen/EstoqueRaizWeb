import { MovimentacoesService } from '../services/MovimentacoesService';
import MovimentacoesModel from '../models/MovimentacoesModel';

// 1. Mock do Model para evitar que ele leia o arquivo real e tente iniciar o Sequelize
jest.mock('../models/MovimentacoesModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  }
}));

// 2. Mock do Lock para não tentar conectar no Redis real
jest.mock('../../../shared/utils/redisLock', () => ({
  executeWithLock: jest.fn(async (key, ttl, cb) => await cb()),
}));

// 3. Mock do Banco e Transações
jest.mock('../../../shared/config/database', () => ({
  sequelize: { 
    query: jest.fn(),
    transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() }))
  }
}));

// 4. Mocks de Cache e Mensageria (Isso evita os "Open Handles" e o terminal preso)
jest.mock('../../../shared/utils/cache', () => ({
  cacheService: {
    buscarOuExecutar: jest.fn(async (key, cb) => await cb()),
    invalidarPorPadrao: jest.fn()
  }
}));

jest.mock('../../../shared/eventos/publicador', () => ({
  publicadorEventos: { publicar: jest.fn() },
  EventosTipo: { MOVIMENTACAO_CRIADA: 'MOVIMENTACAO_CRIADA', MOVIMENTACAO_DELETADA: 'MOVIMENTACAO_DELETADA' }
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
