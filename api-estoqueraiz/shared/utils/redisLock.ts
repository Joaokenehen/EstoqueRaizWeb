import Redis from 'ioredis';
import Redlock from 'redlock';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200, 
  retryJitter: 200,
});

/**
 * Executa uma função crítica com Distributed Lock no Redis e efetua os logs do processo.
 * 
 * @param resource Chave única de identificação do lock (ex: `lock:produto:123`)
 * @param ttl Tempo máximo de vida do lock em milissegundos
 * @param execution Função de callback com a lógica crítica a ser executada
 */
export async function executeWithLock<T>(
  resource: string,
  ttl: number,
  execution: () => Promise<T>
): Promise<T> {
  logger.info(`[Lock] Solicitando lock para o recurso: ${resource}`);
  
  // Tenta adquirir o lock. Se não conseguir no retryCount, lança erro.
  const lock = await redlock.acquire([resource], ttl);
  logger.info(`[Lock] Lock adquirido com sucesso: ${resource}`);
  
  try {
    return await execution();
  } finally {
    await lock.release();
    logger.info(`[Lock] Lock liberado para: ${resource}`);
  }
}