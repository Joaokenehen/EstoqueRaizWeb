-- ETL/ELT de exemplo para o DW do Estoque Raiz
-- Execute apos criar as tabelas com dw_schema.sql

BEGIN;

-- 1) Linhas padrao para tratar chaves nao encontradas
INSERT INTO dw.dim_data (
  sk_data,
  data_completa,
  ano,
  semestre,
  trimestre,
  mes,
  nome_mes,
  semana_ano,
  dia_mes,
  dia_semana,
  nome_dia_semana,
  eh_fim_semana
)
VALUES (0, DATE '1900-01-01', 1900, 1, 1, 1, 'nao informado', 1, 1, 1, 'nao informado', FALSE)
ON CONFLICT (sk_data) DO NOTHING;

INSERT INTO dw.dim_categoria (sk_categoria, nk_categoria, nome, descricao)
VALUES (0, 0, 'nao informado', 'categoria nao informada')
ON CONFLICT (nk_categoria) DO NOTHING;

INSERT INTO dw.dim_unidade (sk_unidade, nk_unidade, nome, descricao)
VALUES (0, 0, 'nao informado', 'unidade nao informada')
ON CONFLICT (nk_unidade) DO NOTHING;

INSERT INTO dw.dim_usuario (sk_usuario, nk_usuario, nome, email, status, cargo, nk_unidade)
VALUES (0, 0, 'nao informado', NULL, 'nao informado', NULL, 0)
ON CONFLICT (nk_usuario) DO NOTHING;

INSERT INTO dw.dim_tipo_movimentacao (sk_tipo_movimentacao, nk_tipo_movimentacao, descricao)
VALUES (0, 'NAO_INFORMADO', 'tipo de movimentacao nao informado')
ON CONFLICT (nk_tipo_movimentacao) DO NOTHING;

INSERT INTO dw.dim_produto (
  sk_produto,
  nk_produto,
  nome,
  descricao,
  codigo_barras,
  status_produto,
  ativo,
  preco_custo,
  preco_venda,
  quantidade_minima,
  data_validade,
  lote,
  localizacao,
  nk_categoria,
  nk_unidade,
  nk_usuario_criador
)
VALUES (0, 0, 'nao informado', NULL, NULL, 'nao informado', FALSE, 0, 0, 0, NULL, NULL, NULL, 0, 0, 0)
ON CONFLICT (nk_produto) DO NOTHING;

-- 2) Carga da dimensao data
INSERT INTO dw.dim_data (
  sk_data,
  data_completa,
  ano,
  semestre,
  trimestre,
  mes,
  nome_mes,
  semana_ano,
  dia_mes,
  dia_semana,
  nome_dia_semana,
  eh_fim_semana
)
SELECT
  (EXTRACT(YEAR FROM d)::INTEGER * 10000)
  + (EXTRACT(MONTH FROM d)::INTEGER * 100)
  + EXTRACT(DAY FROM d)::INTEGER AS sk_data,
  d::DATE AS data_completa,
  EXTRACT(YEAR FROM d)::SMALLINT AS ano,
  CASE WHEN EXTRACT(MONTH FROM d) <= 6 THEN 1 ELSE 2 END AS semestre,
  EXTRACT(QUARTER FROM d)::SMALLINT AS trimestre,
  EXTRACT(MONTH FROM d)::SMALLINT AS mes,
  (ARRAY[
    'janeiro','fevereiro','marco','abril','maio','junho',
    'julho','agosto','setembro','outubro','novembro','dezembro'
  ])[EXTRACT(MONTH FROM d)::INTEGER] AS nome_mes,
  EXTRACT(WEEK FROM d)::SMALLINT AS semana_ano,
  EXTRACT(DAY FROM d)::SMALLINT AS dia_mes,
  EXTRACT(DOW FROM d)::SMALLINT AS dia_semana,
  (ARRAY[
    'domingo','segunda','terca','quarta','quinta','sexta','sabado'
  ])[EXTRACT(DOW FROM d)::INTEGER + 1] AS nome_dia_semana,
  CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN TRUE ELSE FALSE END AS eh_fim_semana
FROM generate_series(
  DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '5 years',
  DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '2 years' - INTERVAL '1 day',
  INTERVAL '1 day'
) d
ON CONFLICT (sk_data) DO NOTHING;

-- 3) Carga da dimensao tipo de movimentacao
INSERT INTO dw.dim_tipo_movimentacao (nk_tipo_movimentacao, descricao)
VALUES
  ('ENTRADA', 'entrada de estoque'),
  ('SAIDA', 'saida de estoque'),
  ('TRANSFERENCIA', 'transferencia entre unidades'),
  ('AJUSTE', 'ajuste de estoque')
ON CONFLICT (nk_tipo_movimentacao)
DO UPDATE SET descricao = EXCLUDED.descricao;

-- 4) Carga da dimensao categoria
INSERT INTO dw.dim_categoria (nk_categoria, nome, descricao, data_atualizacao_fonte)
SELECT
  c.id,
  c.nome,
  c.descricao,
  c."atualizadoEm"
FROM categorias c
ON CONFLICT (nk_categoria)
DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  data_atualizacao_fonte = EXCLUDED.data_atualizacao_fonte;

-- 5) Carga da dimensao unidade
INSERT INTO dw.dim_unidade (
  nk_unidade,
  nome,
  descricao,
  rua,
  numero,
  bairro,
  cidade,
  estado,
  cep
)
SELECT
  u.id,
  u.nome,
  u.descricao,
  u.rua,
  u.numero,
  u.bairro,
  u.cidade,
  u.estado,
  u.cep
FROM unidades u
ON CONFLICT (nk_unidade)
DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  rua = EXCLUDED.rua,
  numero = EXCLUDED.numero,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  cep = EXCLUDED.cep;

-- 6) Carga da dimensao usuario
INSERT INTO dw.dim_usuario (
  nk_usuario,
  nome,
  email,
  status,
  cargo,
  nk_unidade,
  data_criacao_fonte
)
SELECT
  u.id,
  u.nome,
  u.email,
  u.status,
  u.cargo,
  COALESCE(u.unidade_id, 0),
  u.criado_em
FROM usuarios u
ON CONFLICT (nk_usuario)
DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  cargo = EXCLUDED.cargo,
  nk_unidade = EXCLUDED.nk_unidade,
  data_criacao_fonte = EXCLUDED.data_criacao_fonte;

-- 7) Carga da dimensao produto
INSERT INTO dw.dim_produto (
  nk_produto,
  nome,
  descricao,
  codigo_barras,
  status_produto,
  ativo,
  preco_custo,
  preco_venda,
  quantidade_minima,
  data_validade,
  lote,
  localizacao,
  nk_categoria,
  nk_unidade,
  nk_usuario_criador,
  criado_em_fonte,
  atualizado_em_fonte
)
SELECT
  p.id,
  p.nome,
  p.descricao,
  p.codigo_barras,
  p."statusProduto",
  p.ativo,
  COALESCE(p.preco_custo, 0),
  COALESCE(p.preco_venda, 0),
  COALESCE(p.quantidade_minima, 0),
  p.data_validade::DATE,
  p.lote,
  p.localizacao,
  COALESCE(p.categoria_id, 0),
  COALESCE(p.unidade_id, 0),
  COALESCE(p.usuario_id, 0),
  p.criado_em,
  p.atualizado_em
FROM produtos p
ON CONFLICT (nk_produto)
DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  codigo_barras = EXCLUDED.codigo_barras,
  status_produto = EXCLUDED.status_produto,
  ativo = EXCLUDED.ativo,
  preco_custo = EXCLUDED.preco_custo,
  preco_venda = EXCLUDED.preco_venda,
  quantidade_minima = EXCLUDED.quantidade_minima,
  data_validade = EXCLUDED.data_validade,
  lote = EXCLUDED.lote,
  localizacao = EXCLUDED.localizacao,
  nk_categoria = EXCLUDED.nk_categoria,
  nk_unidade = EXCLUDED.nk_unidade,
  nk_usuario_criador = EXCLUDED.nk_usuario_criador,
  criado_em_fonte = EXCLUDED.criado_em_fonte,
  atualizado_em_fonte = EXCLUDED.atualizado_em_fonte;

-- 8) Carga incremental da fato de movimentacoes
INSERT INTO dw.fato_movimentacao_estoque (
  id_movimentacao_origem,
  sk_data,
  sk_produto,
  sk_usuario,
  sk_unidade_origem,
  sk_unidade_destino,
  sk_tipo_movimentacao,
  quantidade_movimentada,
  valor_custo_movimentado,
  valor_venda_movimentado,
  quantidade_entrada,
  quantidade_saida,
  quantidade_transferencia,
  quantidade_ajuste,
  criado_em_fonte,
  atualizado_em_fonte,
  data_carga_dw
)
SELECT
  m.id AS id_movimentacao_origem,
  COALESCE(dd.sk_data, 0) AS sk_data,
  COALESCE(dp.sk_produto, 0) AS sk_produto,
  COALESCE(duse.sk_usuario, 0) AS sk_usuario,
  COALESCE(duo.sk_unidade, 0) AS sk_unidade_origem,
  COALESCE(dud.sk_unidade, 0) AS sk_unidade_destino,
  COALESCE(dtm.sk_tipo_movimentacao, 0) AS sk_tipo_movimentacao,
  m.quantidade AS quantidade_movimentada,
  (m.quantidade * COALESCE(dp.preco_custo, 0))::NUMERIC(14,2) AS valor_custo_movimentado,
  (m.quantidade * COALESCE(dp.preco_venda, 0))::NUMERIC(14,2) AS valor_venda_movimentado,
  CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade ELSE 0 END AS quantidade_entrada,
  CASE WHEN m.tipo = 'SAIDA' THEN m.quantidade ELSE 0 END AS quantidade_saida,
  CASE WHEN m.tipo = 'TRANSFERENCIA' THEN m.quantidade ELSE 0 END AS quantidade_transferencia,
  CASE WHEN m.tipo = 'AJUSTE' THEN m.quantidade ELSE 0 END AS quantidade_ajuste,
  m.criado_em,
  m.atualizado_em,
  NOW()
FROM movimentacoes m
LEFT JOIN dw.dim_data dd
  ON dd.data_completa = m.data_movimentacao::DATE
LEFT JOIN dw.dim_produto dp
  ON dp.nk_produto = m.produto_id
LEFT JOIN dw.dim_usuario duse
  ON duse.nk_usuario = COALESCE(m.usuario_id, 0)
LEFT JOIN dw.dim_unidade duo
  ON duo.nk_unidade = COALESCE(m.unidade_origem_id, 0)
LEFT JOIN dw.dim_unidade dud
  ON dud.nk_unidade = COALESCE(m.unidade_destino_id, 0)
LEFT JOIN dw.dim_tipo_movimentacao dtm
  ON dtm.nk_tipo_movimentacao = COALESCE(m.tipo::text, 'NAO_INFORMADO')
ON CONFLICT (id_movimentacao_origem)
DO UPDATE SET
  sk_data = EXCLUDED.sk_data,
  sk_produto = EXCLUDED.sk_produto,
  sk_usuario = EXCLUDED.sk_usuario,
  sk_unidade_origem = EXCLUDED.sk_unidade_origem,
  sk_unidade_destino = EXCLUDED.sk_unidade_destino,
  sk_tipo_movimentacao = EXCLUDED.sk_tipo_movimentacao,
  quantidade_movimentada = EXCLUDED.quantidade_movimentada,
  valor_custo_movimentado = EXCLUDED.valor_custo_movimentado,
  valor_venda_movimentado = EXCLUDED.valor_venda_movimentado,
  quantidade_entrada = EXCLUDED.quantidade_entrada,
  quantidade_saida = EXCLUDED.quantidade_saida,
  quantidade_transferencia = EXCLUDED.quantidade_transferencia,
  quantidade_ajuste = EXCLUDED.quantidade_ajuste,
  criado_em_fonte = EXCLUDED.criado_em_fonte,
  atualizado_em_fonte = EXCLUDED.atualizado_em_fonte,
  data_carga_dw = NOW();

-- 9) Snapshot diario de estoque atual
INSERT INTO dw.fato_snapshot_estoque_diario (
  data_snapshot,
  sk_data,
  sk_produto,
  sk_unidade,
  quantidade_estoque,
  quantidade_minima,
  valor_custo_estoque,
  valor_venda_estoque,
  indicador_estoque_baixo,
  data_validade,
  data_carga_dw
)
SELECT
  CURRENT_DATE AS data_snapshot,
  COALESCE(dd.sk_data, 0) AS sk_data,
  COALESCE(dp.sk_produto, 0) AS sk_produto,
  COALESCE(du.sk_unidade, 0) AS sk_unidade,
  COALESCE(p.quantidade_estoque, 0) AS quantidade_estoque,
  COALESCE(p.quantidade_minima, 0) AS quantidade_minima,
  (COALESCE(p.quantidade_estoque, 0) * COALESCE(p.preco_custo, 0))::NUMERIC(14,2) AS valor_custo_estoque,
  (COALESCE(p.quantidade_estoque, 0) * COALESCE(p.preco_venda, 0))::NUMERIC(14,2) AS valor_venda_estoque,
  CASE WHEN COALESCE(p.quantidade_estoque, 0) < COALESCE(p.quantidade_minima, 0) THEN TRUE ELSE FALSE END AS indicador_estoque_baixo,
  p.data_validade::DATE,
  NOW()
FROM produtos p
LEFT JOIN dw.dim_data dd
  ON dd.data_completa = CURRENT_DATE
LEFT JOIN dw.dim_produto dp
  ON dp.nk_produto = p.id
LEFT JOIN dw.dim_unidade du
  ON du.nk_unidade = COALESCE(p.unidade_id, 0)
WHERE p.ativo = TRUE
ON CONFLICT (data_snapshot, sk_produto, sk_unidade)
DO UPDATE SET
  quantidade_estoque = EXCLUDED.quantidade_estoque,
  quantidade_minima = EXCLUDED.quantidade_minima,
  valor_custo_estoque = EXCLUDED.valor_custo_estoque,
  valor_venda_estoque = EXCLUDED.valor_venda_estoque,
  indicador_estoque_baixo = EXCLUDED.indicador_estoque_baixo,
  data_validade = EXCLUDED.data_validade,
  data_carga_dw = NOW();

COMMIT;
