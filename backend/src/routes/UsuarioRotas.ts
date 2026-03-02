import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

usuarioRoutes.post('/', usuarioController.create.bind(usuarioController));
usuarioRoutes.get('/', usuarioController.list.bind(usuarioController));

export { usuarioRoutes };