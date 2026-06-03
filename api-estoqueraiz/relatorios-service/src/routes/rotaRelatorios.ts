import { Router } from "express";
import {
  gerarCurvaABC,
  obterEstatisticas,
  obterRelatorioFinanceiro,
} from "../controllers/RelatoriosController";
import { autenticacao } from "../middleware/autorizacao";

const router = Router();

router.get("/curva-abc", autenticacao, gerarCurvaABC);
router.get("/estatisticas", autenticacao, obterEstatisticas);
router.get("/financeiro", autenticacao, obterRelatorioFinanceiro);

export default router;
