import { Router } from 'express';
import { FornecedorController } from '../controllers/FornecedorController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Aplica a verificação de Token em todas as rotas abaixo:
// Apenas gerentes e financeiros podem gerenciar ou ler a lista de fornecedores.
router.use(authMiddleware(['gerente', 'financeiro']));

router.get('/', FornecedorController.listar);
router.post('/', FornecedorController.criar);
router.put('/:id', FornecedorController.atualizar);
router.delete('/:id', FornecedorController.deletar);

export default router;