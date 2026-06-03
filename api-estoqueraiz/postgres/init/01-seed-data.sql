-- Seed de bootstrap para o banco PostgreSQL do projeto Estoque Raiz.
-- Esta seed cria as tabelas essenciais e popula unidades, categorias, usuários, produtos e movimentações.

-- Habilita a extensão pgcrypto para gerar hashes bcrypt nativamente no banco
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usuarios_status') THEN
    EXECUTE 'CREATE TYPE enum_usuarios_status AS ENUM (''pendente'', ''aprovado'', ''rejeitado'')';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usuarios_cargo') THEN
    EXECUTE 'CREATE TYPE enum_usuarios_cargo AS ENUM (''gerente'', ''estoquista'', ''financeiro'')';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_produtos_statusProduto') THEN
    EXECUTE 'CREATE TYPE "enum_produtos_statusProduto" AS ENUM (''pendente'', ''aprovado'', ''rejeitado'')';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_movimentacoes_tipo') THEN
    EXECUTE 'CREATE TYPE enum_movimentacoes_tipo AS ENUM (''ENTRADA'', ''SAIDA'', ''TRANSFERENCIA'', ''AJUSTE'')';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_movimentacoes_status') THEN
    EXECUTE 'CREATE TYPE enum_movimentacoes_status AS ENUM (''pendente'', ''aprovado'', ''rejeitado'')';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS unidades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255),
  rua VARCHAR(255) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  bairro VARCHAR(255) NOT NULL,
  cidade VARCHAR(255) NOT NULL,
  estado VARCHAR(255) NOT NULL,
  cep VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255),
  "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  rua VARCHAR(255),
  numero VARCHAR(50),
  bairro VARCHAR(255),
  cidade VARCHAR(255),
  estado VARCHAR(2),
  cep VARCHAR(10),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(255) NOT NULL UNIQUE,
  status enum_usuarios_status NOT NULL DEFAULT 'pendente',
  cargo enum_usuarios_cargo,
  unidade_id INTEGER,
  foto_perfil TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  codigo_barras VARCHAR(255),
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER NOT NULL DEFAULT 1,
  data_validade TIMESTAMP WITH TIME ZONE,
  lote VARCHAR(255),
  localizacao VARCHAR(255),
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  "statusProduto" "enum_produtos_statusProduto" NOT NULL DEFAULT 'pendente',
  categoria_id INTEGER NOT NULL,
  unidade_id INTEGER NOT NULL,
  fornecedor_id INTEGER,
  usuario_id INTEGER NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id SERIAL PRIMARY KEY,
  status enum_movimentacoes_status NOT NULL DEFAULT 'aprovado',
  valor_custo DECIMAL(10,2),
  valor_venda DECIMAL(10,2),
  tipo enum_movimentacoes_tipo NOT NULL,
  quantidade INTEGER NOT NULL,
  data_movimentacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  observacao TEXT,
  documento VARCHAR(255),
  produto_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  unidade_origem_id INTEGER,
  unidade_destino_id INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices e constraints que ajudam seed idempotente
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios (cpf);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_nome ON categorias (nome);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unidades_nome_cep ON unidades (nome, cep);

-- Dados de exemplo
INSERT INTO unidades (id, nome, descricao, rua, numero, bairro, cidade, estado, cep)
VALUES
  (1, 'Matriz - São Paulo', 'Central da rede Estoque Raiz', 'Av. Paulista', '1234', 'Bela Vista', 'São Paulo', 'SP', '01311-000'),
  (2, 'Filial - Ribeirão Preto', 'Unidade de atendimento interior', 'Rua Major Fagundes', '987', 'Centro', 'Ribeirão Preto', 'SP', '14010-080'),
  (3, 'Filial - Curitiba', 'Unidade Sul do Brasil', 'Rua das Flores', '321', 'Batel', 'Curitiba', 'PR', '80010-010')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categorias (id, nome, descricao, "criadoEm", "atualizadoEm")
VALUES
  (1, 'Fertilizantes', 'Produtos para nutrição de plantas.', NOW(), NOW()),
  (2, 'Defensivos Agrícolas', 'Produtos para controle de pragas e doenças.', NOW(), NOW()),
  (3, 'Sementes', 'Sementes de alta qualidade para plantio.', NOW(), NOW()),
  (4, 'Ferramentas', 'Ferramentas manuais e equipamentos para o campo.', NOW(), NOW()),
  (5, 'Ração Animal', 'Alimentos para animais de fazenda.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO fornecedores (id, razao_social, nome_fantasia, cnpj, telefone, email, cidade, estado)
VALUES
  (1, 'BAYER S.A.', 'BAYER', '04439071000130', '(11) 5694-5166', 'contato@bayer.com.br', 'São Paulo', 'SP'),
  (2, 'SYNGENTA PROTECAO DE CULTIVOS LTDA', 'SYNGENTA', '60744463000190', '(11) 5643-2322', 'vendas@syngenta.com', 'São Paulo', 'SP'),
  (3, 'BASF S.A.', 'BASF', '57508403000112', '(11) 2039-2273', 'comercial@basf.com', 'São Bernardo do Campo', 'SP'),
  (4, 'JOHN DEERE BRASIL LTDA', 'JOHN DEERE', '89674782000196', '(19) 3311-8100', 'vendas@johndeere.com', 'Indaiatuba', 'SP'),
  (5, 'CARGILL AGRICOLA S A', 'CARGILL', '60498706000157', '(11) 5099-3000', 'pedidos@cargill.com', 'São Paulo', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Senha padrão para todos os usuários da seed: Senha123!
INSERT INTO usuarios (id, nome, email, senha, cpf, status, cargo, unidade_id, criado_em)
VALUES
  (1, 'João Gerente', 'gerente@estoqueraiz.com', crypt('Senha123!', gen_salt('bf', 10)), '82688200046', 'aprovado', 'gerente', NULL, NOW()),
  (2, 'Ana Estoquista', 'estoquista@estoqueraiz.com', crypt('Senha123!', gen_salt('bf', 10)), '66405647005', 'aprovado', 'estoquista', 1, NOW()),
  (3, 'Carlos Financeiro', 'financeiro@estoqueraiz.com', crypt('Senha123!', gen_salt('bf', 10)), '84727540061', 'aprovado', 'financeiro', NULL, NOW()),
  (4, 'Marcos Pendente', 'marcos@estoqueraiz.com', crypt('Senha123!', gen_salt('bf', 10)), '12345678901', 'pendente', NULL, NULL, NOW()),
  (5, 'Julia Pendente', 'julia@estoqueraiz.com', crypt('Senha123!', gen_salt('bf', 10)), '10987654321', 'pendente', NULL, NULL, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO produtos (id, nome, descricao, codigo_barras, preco_custo, preco_venda, quantidade_estoque, quantidade_minima, data_validade, lote, localizacao, imagem_url, ativo, "statusProduto", categoria_id, unidade_id, fornecedor_id, usuario_id, criado_em, atualizado_em)
VALUES
  (1, 'Semente de Soja TMG 7062 IPRO', 'Semente de soja de alto potencial produtivo.', '7891234500012', 150.00, 280.00, 1000, 10, NOW() + INTERVAL '180 days', 'L001', 'Estoque A1', NULL, true, 'aprovado', 3, 1, 3, 2, NOW(), NOW()),
  (2, 'Herbicida Glifosato Atar', 'Herbicida sistêmico de amplo espectro.', '7891234500029', 45.50, 89.90, 500, 5, NOW() - INTERVAL '10 days', 'L002', 'Estoque B1', NULL, true, 'aprovado', 2, 1, 1, 2, NOW(), NOW()),
  (3, 'Fertilizante NPK 20-05-20', 'Fórmula para crescimento e floração.', '7891234500036', 80.00, 150.00, 800, 5, NULL, 'L003', 'Estoque C1', NULL, true, 'aprovado', 1, 1, 2, 2, NOW(), NOW()),
  (4, 'Semente de Milho Híbrido AG 8088', 'Milho de alta produtividade e sanidade.', '7891234500043', 120.00, 220.00, 300, 10, NOW() + INTERVAL '240 days', 'L004', 'Estoque D1', NULL, true, 'aprovado', 3, 2, 3, 2, NOW(), NOW()),
  (5, 'Fungicida Mancozeb', 'Fungicida protetor multissítio.', '7891234500050', 30.00, 65.00, 600, 5, NOW() - INTERVAL '2 days', 'L005', 'Estoque E1', NULL, true, 'aprovado', 2, 1, 4, 2, NOW(), NOW()),
  (6, 'Enxada Larga 2.5', 'Enxada forjada em aço carbono.', '7891234500067', 25.00, 49.90, 50, 1, NULL, 'L006', 'Ferramentaria', NULL, true, 'aprovado', 4, 1, 5, 2, NOW(), NOW()),
  (7, 'Ração para Bovinos de Corte', 'Ração balanceada para ganho de peso.', '7891234500074', 55.00, 95.00, 200, 20, NULL, 'L007', 'Estoque F1', NULL, true, 'aprovado', 5, 3, 1, 2, NOW(), NOW()),
  (8, 'Pulverizador Costal 20L', 'Pulverizador para aplicação de defensivos.', '7891234500081', 90.00, 179.00, 30, 1, NULL, 'L008', 'Ferramentaria', NULL, true, 'aprovado', 4, 2, NULL, 2, NOW(), NOW()),
  (9, 'Adubo Orgânico Líquido', 'Fertilizante orgânico de rápida absorção.', '7891234500098', 0.00, 0.00, 8, 20, NULL, 'L009', 'Estoque C2', NULL, true, 'pendente', 1, 1, 1, 2, NOW(), NOW()),
  (10, 'Semente de Trigo TR 120', 'Sementes de trigo de inverno.', '7891234500104', 0.00, 0.00, 150, 10, NOW() + INTERVAL '15 days', 'L010', 'Estoque A2', NULL, true, 'pendente', 3, 2, 2, 2, NOW(), NOW()),
  (11, 'Ração Suína Crescimento', 'Ração para suínos na fase de crescimento.', '7891234500111', 0.00, 0.00, 15, 50, NOW() + INTERVAL '5 days', 'L011', 'Estoque F2', NULL, true, 'pendente', 5, 3, NULL, 2, NOW(), NOW()),
  (41, 'Fertilizante XYZ (Recusado)', 'Fórmula reprovada em testes de qualidade.', '7891234500418', 90.00, 0.00, 0, 10, NULL, 'L041', 'Quarentena', NULL, true, 'rejeitado', 1, 1, 1, 2, NOW(), NOW()),
  (42, 'Defensivo Genérico (Recusado)', 'Lote sem documentação necessária.', '7891234500425', 200.00, 0.00, 0, 5, NULL, 'L042', 'Quarentena', NULL, true, 'rejeitado', 2, 2, 2, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO movimentacoes (id, tipo, quantidade, data_movimentacao, observacao, documento, produto_id, usuario_id, unidade_origem_id, unidade_destino_id, criado_em, atualizado_em)
VALUES
  (1, 'ENTRADA', 200, NOW() - INTERVAL '30 days', 'Entrada inicial de estoque.', NULL, 1, 2, NULL, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 'SAIDA', 20, NOW() - INTERVAL '10 days', 'Venda corporativa.', 'NF-001', 1, 2, 1, NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (3, 'SAIDA', 50, NOW() - INTERVAL '5 days', 'Venda safra grande.', 'NF-002', 4, 2, 2, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (4, 'ENTRADA', 300, NOW() - INTERVAL '25 days', 'Reposição de fertilizante.', NULL, 3, 2, NULL, 1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (5, 'AJUSTE', 5, NOW() - INTERVAL '2 days', 'Ajuste de contagem de inventário.', NULL, 7, 1, 3, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (6, 'ENTRADA', 8, NOW() - INTERVAL '10 days', 'Compra de adubo orgânico.', NULL, 12, 2, NULL, 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (7, 'ENTRADA', 150, NOW() - INTERVAL '20 days', 'Compra de sementes de trigo.', NULL, 13, 2, NULL, 2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (8, 'ENTRADA', 15, NOW() - INTERVAL '50 days', 'Entrada de ração.', NULL, 14, 2, NULL, 3, NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  (9, 'SAIDA', 25, NOW() - INTERVAL '12 days', 'Venda varejo.', 'NF-003', 7, 2, 3, NULL, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  (10, 'SAIDA', 10, NOW() - INTERVAL '15 days', 'Venda balcão.', 'NF-004', 3, 2, 1, NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (11, 'SAIDA', 5, NOW() - INTERVAL '18 days', 'Venda pequena.', 'NF-005', 5, 2, 1, NULL, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  (12, 'SAIDA', 3, NOW() - INTERVAL '22 days', 'Venda avulsa.', 'NF-006', 6, 2, 1, NULL, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  (13, 'SAIDA', 1, NOW() - INTERVAL '28 days', 'Venda unitária.', 'NF-007', 8, 2, 2, NULL, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  (14, 'SAIDA', 2, NOW() - INTERVAL '3 days', 'Venda rápida.', 'NF-008', 15, 2, 3, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Gerando produtos adicionais em lote para testar a paginação da Curva ABC (Produtos 12 a 40)
INSERT INTO produtos (id, nome, descricao, codigo_barras, preco_custo, preco_venda, quantidade_estoque, quantidade_minima, data_validade, lote, localizacao, imagem_url, ativo, "statusProduto", categoria_id, unidade_id, fornecedor_id, usuario_id, criado_em, atualizado_em)
SELECT 
  i, 
  'Produto Dinâmico ' || i, 
  'Produto gerado para testes de paginação', 
  '7891000000' || LPAD(i::text, 3, '0'), 
  10.00, 
  25.50, 
  100, 
  5, 
  NULL, 
  'L-TESTE', 
  'Prateleira ' || i, 
  NULL, 
  true, 
  'aprovado'::"enum_produtos_statusProduto", 
  (i % 5) + 1, 
  1, 
  CASE WHEN i % 3 = 0 THEN NULL ELSE (i % 5) + 1 END,
  1, 
  NOW(), 
  NOW()
FROM generate_series(12, 40) AS i
ON CONFLICT (id) DO NOTHING;

-- Adicionando saídas para esses produtos dinâmicos para que apareçam no relatório
INSERT INTO movimentacoes (id, tipo, quantidade, data_movimentacao, observacao, documento, produto_id, usuario_id, unidade_origem_id, unidade_destino_id, criado_em, atualizado_em)
SELECT 
  i + 50, -- Usando IDs a partir de 62 para não dar conflito com os de cima
  'SAIDA', 
  (i % 3) + 1, 
  NOW() - ((i * 7) % 120) * INTERVAL '1 day', 
  'Venda teste paginação', 
  'NF-TESTE-' || i, 
  i, 
  2, 
  1, 
  NULL, 
  NOW() - ((i * 7) % 120) * INTERVAL '1 day', 
  NOW() - ((i * 7) % 120) * INTERVAL '1 day'
FROM generate_series(12, 40) AS i
ON CONFLICT (id) DO NOTHING;

-- Gerando histórico longo de movimentações (últimos 2 anos) variando os tipos
INSERT INTO movimentacoes (id, tipo, quantidade, data_movimentacao, observacao, documento, produto_id, usuario_id, unidade_origem_id, unidade_destino_id, criado_em, atualizado_em)
SELECT 
  i + 100, 
  (ARRAY['SAIDA', 'ENTRADA', 'TRANSFERENCIA', 'AJUSTE', 'SAIDA'])[ (i % 5) + 1 ]::enum_movimentacoes_tipo, 
  (i % 10) + 2, 
  NOW() - (i * 4) * INTERVAL '1 day', 
  'Movimentação histórica automatizada', 
  'DOC-HIST-' || i, 
  (i % 10) + 1, 
  2, 
  CASE WHEN (i % 5) + 1 IN (1, 3, 4, 5) THEN 1 ELSE NULL END, 
  CASE WHEN (i % 5) + 1 = 3 THEN 2 WHEN (i % 5) + 1 = 2 THEN 1 ELSE NULL END, 
  NOW() - (i * 4) * INTERVAL '1 day', 
  NOW() - (i * 4) * INTERVAL '1 day'
FROM generate_series(1, 200) AS i
ON CONFLICT (id) DO NOTHING;

SELECT setval('unidades_id_seq', COALESCE((SELECT MAX(id) FROM unidades), 1), true);
SELECT setval('categorias_id_seq', COALESCE((SELECT MAX(id) FROM categorias), 1), true);
SELECT setval('fornecedores_id_seq', COALESCE((SELECT MAX(id) FROM fornecedores), 1), true);
SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval('produtos_id_seq', COALESCE((SELECT MAX(id) FROM produtos), 1), true);
SELECT setval('movimentacoes_id_seq', COALESCE((SELECT MAX(id) FROM movimentacoes), 1), true);
