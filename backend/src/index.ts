import express from 'express';
import cors  from 'cors';
import { usuarioRoutes } from './routes/UsuarioRotas';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>  {
    console.log(`Servidor rodando na porta ${PORT}`);
});