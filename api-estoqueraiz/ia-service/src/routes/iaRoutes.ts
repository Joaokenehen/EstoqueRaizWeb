import { Router } from 'express';
import iaController from '../controllers/iaController';

const router = Router();

router.post('/chat', iaController.conversar);

export default router;