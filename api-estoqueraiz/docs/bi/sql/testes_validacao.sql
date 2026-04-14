-- Testes de validacao do DW BI (PostgreSQL)
-- Execute apos rodar dw_schema.sql e etl_carga.sql

-- =========================
-- 1) Smoke test de objetos
-- =========================
SELECT
  tablename,
  CASE WHEN tablename IS NOT NULL THEN 'OK' ELSE 'FALHA' END AS status
FROM pg_tables
WHERE schemaname = 'dw'
  AND tablename IN (
    'dim_data',
    'dim_categoria',
    'dim_unidade',
    'dim_usuario',
    'dim_tipo_movimentacao',
    'dim_produto',
    'fato_movimentacao_estoque',
    'fato_snapshot_estoque_diario'
  )
ORDER BY tablename;

-- ====================================
-- 2) Contagem basica de linhas no DW
-- ====================================
SELECT 'dw.dim_data' AS tabela, COUNT(*) AS total FROM dw.dim_data
UNION ALL
SELECT 'dw.dim_categoria', COUNT(*) FROM dw.dim_categoria
UNION ALL
SELECT 'dw.dim_unidade', COUNT(*) FROM dw.dim_unidade
UNION ALL
SELECT 'dw.dim_usuario', COUNT(*) FROM dw.dim_usuario
UNION ALL
SELECT 'dw.dim_tipo_movimentacao', COUNT(*) FROM dw.dim_tipo_movimentacao
UNION ALL
SELECT 'dw.dim_produto', COUNT(*) FROM dw.dim_produto
UNION ALL
SELECT 'dw.fato_movimentacao_estoque', COUNT(*) FROM dw.fato_movimentacao_estoque
UNION ALL
SELECT 'dw.fato_snapshot_estoque_diario', COUNT(*) FROM dw.fato_snapshot_estoque_diario;

-- ======================================================
-- 3) Cobertura das dimensoes em relacao as tabelas fonte
-- ======================================================
SELECT
  'categorias' AS origem,
  (SELECT COUNT(*) FROM categorias) AS origem_total,
  (SELECT COUNT(*) FROM dw.dim_categoria WHERE nk_categoria <> 0) AS dw_total,
  CASE
    WHEN (SELECT COUNT(*) FROM dw.dim_categoria WHERE nk_categoria <> 0) >= (SELECT COUNT(*) FROM categorias)
      THEN 'OK'
    ELSE 'FALHA'
  END AS status
UNION ALL
SELECT
  'unidades',
  (SELECT COUNT(*) FROM unidades),
  (SELECT COUNT(*) FROM dw.dim_unidade WHERE nk_unidade <> 0),
  CASE
    WHEN (SELECT COUNT(*) FROM dw.dim_unidade WHERE nk_unidade <> 0) >= (SELECT COUNT(*) FROM unidades)
      THEN 'OK'
    ELSE 'FALHA'
  END
UNION ALL
SELECT
  'usuarios',
  (SELECT COUNT(*) FROM usuarios),
  (SELECT COUNT(*) FROM dw.dim_usuario WHERE nk_usuario <> 0),
  CASE
    WHEN (SELECT COUNT(*) FROM dw.dim_usuario WHERE nk_usuario <> 0) >= (SELECT COUNT(*) FROM usuarios)
      THEN 'OK'
    ELSE 'FALHA'
  END
UNION ALL
SELECT
  'produtos',
  (SELECT COUNT(*) FROM produtos),
  (SELECT COUNT(*) FROM dw.dim_produto WHERE nk_produto <> 0),
  CASE
    WHEN (SELECT COUNT(*) FROM dw.dim_produto WHERE nk_produto <> 0) >= (SELECT COUNT(*) FROM produtos)
      THEN 'OK'
    ELSE 'FALHA'
  END;

-- ==============================================
-- 4) Consistencia de volume da fato movimentacao
-- ==============================================
SELECT
  tipo,
  origem_total,
  fato_total,
  CASE WHEN origem_total = fato_total THEN 'OK' ELSE 'ATENCAO' END AS status
FROM (
  SELECT
    'ENTRADA' AS tipo,
    (SELECT COALESCE(SUM(quantidade), 0) FROM movimentacoes WHERE tipo = 'ENTRADA') AS origem_total,
    (SELECT COALESCE(SUM(quantidade_entrada), 0) FROM dw.fato_movimentacao_estoque) AS fato_total
  UNION ALL
  SELECT
    'SAIDA',
    (SELECT COALESCE(SUM(quantidade), 0) FROM movimentacoes WHERE tipo = 'SAIDA'),
    (SELECT COALESCE(SUM(quantidade_saida), 0) FROM dw.fato_movimentacao_estoque)
  UNION ALL
  SELECT
    'TRANSFERENCIA',
    (SELECT COALESCE(SUM(quantidade), 0) FROM movimentacoes WHERE tipo = 'TRANSFERENCIA'),
    (SELECT COALESCE(SUM(quantidade_transferencia), 0) FROM dw.fato_movimentacao_estoque)
  UNION ALL
  SELECT
    'AJUSTE',
    (SELECT COALESCE(SUM(quantidade), 0) FROM movimentacoes WHERE tipo = 'AJUSTE'),
    (SELECT COALESCE(SUM(quantidade_ajuste), 0) FROM dw.fato_movimentacao_estoque)
) t;

-- ======================================================
-- 5) Verifica uso de chaves desconhecidas (SK = 0) fato
-- ======================================================
SELECT
  COUNT(*) AS total_linhas,
  SUM(CASE WHEN sk_produto = 0 THEN 1 ELSE 0 END) AS produto_desconhecido,
  SUM(CASE WHEN sk_usuario = 0 THEN 1 ELSE 0 END) AS usuario_desconhecido,
  SUM(CASE WHEN sk_data = 0 THEN 1 ELSE 0 END) AS data_desconhecida,
  ROUND(100.0 * SUM(CASE WHEN sk_produto = 0 OR sk_usuario = 0 OR sk_data = 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS pct_linhas_com_desconhecido
FROM dw.fato_movimentacao_estoque;

-- =================================================
-- 6) Snapshot diario: 1 linha por produto e unidade
-- =================================================
SELECT
  data_snapshot,
  COUNT(*) AS linhas_snapshot,
  COUNT(DISTINCT sk_produto || '-' || sk_unidade) AS pares_distintos,
  CASE
    WHEN COUNT(*) = COUNT(DISTINCT sk_produto || '-' || sk_unidade) THEN 'OK'
    ELSE 'FALHA'
  END AS status
FROM dw.fato_snapshot_estoque_diario
GROUP BY data_snapshot
ORDER BY data_snapshot DESC;

-- ==================================================
-- 7) KPI smoke test: estoque baixo por unidade (TOP)
-- ==================================================
SELECT
  u.nome AS unidade,
  COUNT(*) FILTER (WHERE s.indicador_estoque_baixo) AS produtos_estoque_baixo,
  COUNT(*) AS total_produtos_snapshot,
  ROUND(100.0 * COUNT(*) FILTER (WHERE s.indicador_estoque_baixo) / NULLIF(COUNT(*), 0), 2) AS taxa_estoque_baixo_pct
FROM dw.fato_snapshot_estoque_diario s
JOIN dw.dim_unidade u ON u.sk_unidade = s.sk_unidade
WHERE s.data_snapshot = (SELECT MAX(data_snapshot) FROM dw.fato_snapshot_estoque_diario)
GROUP BY u.nome
ORDER BY taxa_estoque_baixo_pct DESC, produtos_estoque_baixo DESC;

-- =====================================================
-- 8) KPI smoke test: top produtos por valor de saida
-- =====================================================
SELECT
  p.nome AS produto,
  SUM(f.quantidade_saida) AS qtd_saida,
  SUM(f.valor_venda_movimentado) AS valor_venda_saida
FROM dw.fato_movimentacao_estoque f
JOIN dw.dim_produto p ON p.sk_produto = f.sk_produto
GROUP BY p.nome
HAVING SUM(f.quantidade_saida) > 0
ORDER BY valor_venda_saida DESC
LIMIT 10;

-- ==================================
-- 9) Teste de idempotencia do ETL
-- ==================================
-- Passo manual recomendado:
-- 1) Rodar etl_carga.sql duas vezes.
-- 2) Confirmar que o total de linhas da fato movimentacao nao aumenta indevidamente.
SELECT
  COUNT(*) AS total_fato_movimentacao,
  COUNT(DISTINCT id_movimentacao_origem) AS total_distinto_origem,
  CASE
    WHEN COUNT(*) = COUNT(DISTINCT id_movimentacao_origem) THEN 'OK'
    ELSE 'FALHA'
  END AS status
FROM dw.fato_movimentacao_estoque;
