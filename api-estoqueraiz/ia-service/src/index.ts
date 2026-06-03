import express from 'express';
import iaRoutes from './routes/iaRoutes';

const app = express();
app.use(express.json());

// Health Check padrão
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'ia-service' });
});

// Rotas
app.use('/api/ia', iaRoutes);

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`IA Service rodando na porta ${PORT}`);
});