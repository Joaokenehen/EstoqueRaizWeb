import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import './models/Fornecedor';
import fornecedorRoutes from './routes/fornecedorRoutes';
import { info, error } from './utils/logger';
import { FornecedorService } from './services/FornecedorService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('Fornecedores Service Online\n');
});

app.use('/api/fornecedores', fornecedorRoutes);

// Rota interna de testes para deletar sem passar pelo auth (protegida por header)
app.delete('/internal/delete/:id', async (req, res) => {
  if (String(req.headers['x-internal-test']) !== 'true') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const id = Number(req.params.id);
  try {
    console.log('Internal delete route - recebida solicitação para id:', id);
    await FornecedorService.deletar(id);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Internal delete route - erro:', err);
    return res.status(400).json({ message: err.message || 'Erro' });
  }
});

sequelize.authenticate().then(() => {
  info('Banco de Dados conectado no serviço de Fornecedores.');
  app.listen(port, () => {
    info(`Fornecedores Service rodando na porta ${port}`);
  });
}).catch((err: any) => {
  error('Erro de banco de dados:', err);
});