import { Router } from "express";
import {
  listarMovimentacoes,
  buscarMovimentacao,
  criarMovimentacao,
  aprovarMovimentacao,
  rejeitarMovimentacao,
  deletarMovimentacao,
} from "../controllers/MovimentacoesController";
import {
  autenticacao,
  apenasGerente,
  apenasFinanceiroOuGerente,
  verificarAcessoUnidade,
} from "../middleware/autorizacao";

const router = Router();

router.get("/", autenticacao, listarMovimentacoes);
router.get("/:id", autenticacao, buscarMovimentacao);
router.post("/", autenticacao, verificarAcessoUnidade, criarMovimentacao);
router.patch("/:id/aprovar", autenticacao, apenasFinanceiroOuGerente, aprovarMovimentacao);
router.patch("/:id/rejeitar", autenticacao, apenasFinanceiroOuGerente, rejeitarMovimentacao);
router.delete("/:id", autenticacao, apenasGerente, deletarMovimentacao);

export default router;
