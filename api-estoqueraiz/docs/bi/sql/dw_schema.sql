CREATE SCHEMA IF NOT EXISTS dw;

CREATE TABLE IF NOT EXISTS dw.dim_data (
  sk_data INTEGER PRIMARY KEY,
  data_completa DATE NOT NULL UNIQUE,
  ano SMALLINT NOT NULL,
  semestre SMALLINT NOT NULL,
  trimestre SMALLINT NOT NULL,
  mes SMALLINT NOT NULL,
  nome_mes VARCHAR(20) NOT NULL,
  semana_ano SMALLINT NOT NULL,
  dia_mes SMALLINT NOT NULL,
  dia_semana SMALLINT NOT NULL,
  nome_dia_semana VARCHAR(20) NOT NULL,
  eh_fim_semana BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_categoria (
  sk_categoria BIGSERIAL PRIMARY KEY,
  nk_categoria INTEGER NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  data_atualizacao_fonte TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_unidade (
  sk_unidade BIGSERIAL PRIMARY KEY,
  nk_unidade INTEGER NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  rua VARCHAR(255),
  numero VARCHAR(50),
  bairro VARCHAR(120),
  cidade VARCHAR(120),
  estado VARCHAR(10),
  cep VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS dw.dim_usuario (
  sk_usuario BIGSERIAL PRIMARY KEY,
  nk_usuario INTEGER NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180),
  status VARCHAR(30),
  cargo VARCHAR(30),
  nk_unidade INTEGER,
  data_criacao_fonte TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_tipo_movimentacao (
  sk_tipo_movimentacao BIGSERIAL PRIMARY KEY,
  nk_tipo_movimentacao VARCHAR(20) NOT NULL UNIQUE,
  descricao VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_produto (
  sk_produto BIGSERIAL PRIMARY KEY,
  nk_produto INTEGER NOT NULL UNIQUE,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  codigo_barras VARCHAR(120),
  status_produto VARCHAR(30),
  ativo BOOLEAN,
  preco_custo NUMERIC(14,2),
  preco_venda NUMERIC(14,2),
  quantidade_minima INTEGER,
  data_validade DATE,
  lote VARCHAR(100),
  localizacao VARCHAR(150),
  nk_categoria INTEGER,
  nk_unidade INTEGER,
  nk_usuario_criador INTEGER,
  criado_em_fonte TIMESTAMP,
  atualizado_em_fonte TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.fato_movimentacao_estoque (
  sk_movimentacao BIGSERIAL PRIMARY KEY,
  id_movimentacao_origem INTEGER NOT NULL UNIQUE,
  sk_data INTEGER NOT NULL REFERENCES dw.dim_data(sk_data),
  sk_produto BIGINT NOT NULL REFERENCES dw.dim_produto(sk_produto),
  sk_usuario BIGINT NOT NULL REFERENCES dw.dim_usuario(sk_usuario),
  sk_unidade_origem BIGINT NOT NULL REFERENCES dw.dim_unidade(sk_unidade),
  sk_unidade_destino BIGINT NOT NULL REFERENCES dw.dim_unidade(sk_unidade),
  sk_tipo_movimentacao BIGINT NOT NULL REFERENCES dw.dim_tipo_movimentacao(sk_tipo_movimentacao),
  quantidade_movimentada INTEGER NOT NULL,
  valor_custo_movimentado NUMERIC(14,2) NOT NULL,
  valor_venda_movimentado NUMERIC(14,2) NOT NULL,
  quantidade_entrada INTEGER NOT NULL DEFAULT 0,
  quantidade_saida INTEGER NOT NULL DEFAULT 0,
  quantidade_transferencia INTEGER NOT NULL DEFAULT 0,
  quantidade_ajuste INTEGER NOT NULL DEFAULT 0,
  criado_em_fonte TIMESTAMP,
  atualizado_em_fonte TIMESTAMP,
  data_carga_dw TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dw.fato_snapshot_estoque_diario (
  sk_snapshot BIGSERIAL PRIMARY KEY,
  data_snapshot DATE NOT NULL,
  sk_data INTEGER NOT NULL REFERENCES dw.dim_data(sk_data),
  sk_produto BIGINT NOT NULL REFERENCES dw.dim_produto(sk_produto),
  sk_unidade BIGINT NOT NULL REFERENCES dw.dim_unidade(sk_unidade),
  quantidade_estoque INTEGER NOT NULL,
  quantidade_minima INTEGER NOT NULL,
  valor_custo_estoque NUMERIC(14,2) NOT NULL,
  valor_venda_estoque NUMERIC(14,2) NOT NULL,
  indicador_estoque_baixo BOOLEAN NOT NULL,
  data_validade DATE,
  data_carga_dw TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (data_snapshot, sk_produto, sk_unidade)
);

CREATE INDEX IF NOT EXISTS idx_fato_movimentacao_sk_data
  ON dw.fato_movimentacao_estoque (sk_data);

CREATE INDEX IF NOT EXISTS idx_fato_movimentacao_sk_produto
  ON dw.fato_movimentacao_estoque (sk_produto);

CREATE INDEX IF NOT EXISTS idx_fato_movimentacao_sk_unidade_origem
  ON dw.fato_movimentacao_estoque (sk_unidade_origem);

CREATE INDEX IF NOT EXISTS idx_fato_snapshot_sk_data
  ON dw.fato_snapshot_estoque_diario (sk_data);

CREATE INDEX IF NOT EXISTS idx_fato_snapshot_sk_unidade
  ON dw.fato_snapshot_estoque_diario (sk_unidade);
