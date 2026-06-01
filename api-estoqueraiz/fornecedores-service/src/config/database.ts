import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { info, error } from '../utils/logger';

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  logging: (msg: string) => info(`[Sequelize] ${msg}`),
});

export const conectarBanco = async () => {
  try {
    await sequelize.authenticate();
    info('Conectado ao banco de dados');
  } catch (erro) {
    error('Erro ao conectar banco:', erro);
    throw erro;
  }
};
