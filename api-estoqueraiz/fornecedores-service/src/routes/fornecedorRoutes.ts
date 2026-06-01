import { Router } from 'express';
import { FornecedorController } from '../controllers/FornecedorController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const apenasGestao = authMiddleware(['gerente', 'financeiro']);
const leituraGeral = authMiddleware(['gerente', 'financeiro', 'estoquista']);

router.get('/', leituraGeral, FornecedorController.listar);
router.post('/', apenasGestao, FornecedorController.criar);
router.put('/:id', apenasGestao, FornecedorController.atualizar);
router.delete('/:id', apenasGestao, FornecedorController.deletar);

export default router;