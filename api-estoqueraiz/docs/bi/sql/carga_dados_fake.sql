BEGIN;

TRUNCATE TABLE movimentacoes, produtos, usuarios, unidades, categorias RESTART IDENTITY;

-- =============================
-- 1) Categorias e unidades
-- =============================
INSERT INTO categorias (nome, descricao, "criadoEm", "atualizadoEm") VALUES
  ('Fertilizantes', 'Insumos para nutricao do solo e plantas', NOW(), NOW()),
  ('Defensivos', 'Produtos para controle de pragas e doencas', NOW(), NOW()),
  ('Sementes', 'Sementes para plantio de graos', NOW(), NOW()),
  ('Racao Animal', 'Alimentos para nutricao animal', NOW(), NOW()),
  ('Higiene e Limpeza', 'Produtos de limpeza para uso geral', NOW(), NOW()),
  ('Bebidas', 'Bebidas para revenda e consumo interno', NOW(), NOW());

INSERT INTO unidades (nome, descricao, rua, numero, bairro, cidade, estado, cep) VALUES
  ('Matriz Ribeirao Preto', 'Unidade principal', 'Avenida Brasil', '1200', 'Centro', 'Ribeirao Preto', 'SP', '14010-000'),
  ('Filial Franca', 'Unidade comercial regional', 'Rua das Industrias', '455', 'Distrito Industrial', 'Franca', 'SP', '14401-200'),
  ('Filial Uberaba', 'Unidade de distribuicao local', 'Avenida do Campo', '88', 'Abadia', 'Uberaba', 'MG', '38025-320'),
  ('CD Goiania', 'Centro de distribuicao', 'Rodovia GO-020', '700', 'Zona Rural', 'Goiania', 'GO', '74880-000');

-- =============================
-- 2) Usuarios
-- senha padrao: 123456
-- hash bcrypt gerado em ambiente local
-- =============================
INSERT INTO usuarios (nome, email, senha, cpf, status, cargo, unidade_id, criado_em) VALUES
  ('Ana Paula Gerente', 'ana.gerente@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000001', 'aprovado', 'gerente', 1, NOW() - INTERVAL '180 days'),
  ('Bruno Financeiro', 'bruno.financeiro@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000002', 'aprovado', 'financeiro', 1, NOW() - INTERVAL '170 days'),
  ('Carlos Estoquista RP', 'carlos.rp@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000003', 'aprovado', 'estoquista', 1, NOW() - INTERVAL '160 days'),
  ('Daniela Estoquista Franca', 'daniela.franca@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000004', 'aprovado', 'estoquista', 2, NOW() - INTERVAL '150 days'),
  ('Eduardo Estoquista Uberaba', 'eduardo.uberaba@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000005', 'aprovado', 'estoquista', 3, NOW() - INTERVAL '140 days'),
  ('Fernanda Estoquista Goiania', 'fernanda.goiania@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000006', 'aprovado', 'estoquista', 4, NOW() - INTERVAL '130 days'),
  ('Gabriel Cadastro', 'gabriel.cadastro@estoqueraiz.com', '$2b$10$tzxMjKC.5hB4cBPLoFQk7ODtbIKsr13MxxjavjNZ3slKaddDqJHRa', '10000000007', 'pendente', NULL, 2, NOW() - INTERVAL '10 days');

-- =============================
-- 3) Produtos
-- =============================
INSERT INTO produtos (
  nome,
  descricao,
  codigo_barras,
  preco_custo,
  preco_venda,
  quantidade_estoque,
  quantidade_minima,
  data_validade,
  lote,
  localizacao,
  imagem_url,
  ativo,
  "statusProduto",
  categoria_id,
  unidade_id,
  usuario_id,
  criado_em,
  atualizado_em
) VALUES
  ('Ureia Granulada 50kg', 'Fertilizante nitrogenado', '789100000001', 130.00, 165.00, 220, 60, NOW() + INTERVAL '300 days', 'UR24A', 'A1-01', NULL, TRUE, 'aprovado', 1, 1, 3, NOW() - INTERVAL '120 days', NOW() - INTERVAL '3 days'),
  ('NPK 20-05-20 50kg', 'Fertilizante composto NPK', '789100000002', 145.00, 182.00, 180, 50, NOW() + INTERVAL '280 days', 'NPK24B', 'A1-02', NULL, TRUE, 'aprovado', 1, 1, 3, NOW() - INTERVAL '118 days', NOW() - INTERVAL '2 days'),
  ('Herbicida Glifosato 20L', 'Controle de plantas daninhas', '789100000003', 220.00, 280.00, 18, 25, NOW() + INTERVAL '220 days', 'GLI24C', 'B2-01', NULL, TRUE, 'aprovado', 2, 2, 4, NOW() - INTERVAL '110 days', NOW() - INTERVAL '2 days'),
  ('Inseticida Piretroide 5L', 'Inseticida para pragas de folhas', '789100000004', 95.00, 129.00, 22, 20, NOW() + INTERVAL '190 days', 'INS24D', 'B2-02', NULL, TRUE, 'aprovado', 2, 2, 4, NOW() - INTERVAL '105 days', NOW() - INTERVAL '2 days'),
  ('Semente Milho Hibrido 60k', 'Semente de milho para alta produtividade', '789100000005', 340.00, 420.00, 140, 40, NOW() + INTERVAL '330 days', 'MIL24E', 'C1-01', NULL, TRUE, 'aprovado', 3, 3, 5, NOW() - INTERVAL '100 days', NOW() - INTERVAL '3 days'),
  ('Semente Soja 40kg', 'Semente tratada de soja', '789100000006', 290.00, 360.00, 30, 45, NOW() + INTERVAL '320 days', 'SOJ24F', 'C1-02', NULL, TRUE, 'aprovado', 3, 3, 5, NOW() - INTERVAL '98 days', NOW() - INTERVAL '2 days'),
  ('Racao Bovino 25kg', 'Racao para gado de corte e leite', '789100000007', 52.00, 69.00, 260, 80, NOW() + INTERVAL '210 days', 'RAC24G', 'D1-01', NULL, TRUE, 'aprovado', 4, 4, 6, NOW() - INTERVAL '95 days', NOW() - INTERVAL '2 days'),
  ('Racao Equino 25kg', 'Racao para equinos adultos', '789100000008', 58.00, 76.00, 190, 60, NOW() + INTERVAL '205 days', 'RAC24H', 'D1-02', NULL, TRUE, 'aprovado', 4, 4, 6, NOW() - INTERVAL '94 days', NOW() - INTERVAL '2 days'),
  ('Detergente Neutro 5L', 'Limpeza geral de superficies', '789100000009', 18.00, 25.00, 75, 30, NOW() + INTERVAL '90 days', 'LIM24I', 'E1-01', NULL, TRUE, 'aprovado', 5, 1, 3, NOW() - INTERVAL '90 days', NOW() - INTERVAL '2 days'),
  ('Sabao em Po 1kg', 'Lavagem de roupas e tecidos', '789100000010', 9.00, 14.00, 120, 35, NOW() + INTERVAL '20 days', 'LIM24J', 'E1-02', NULL, TRUE, 'aprovado', 5, 1, 3, NOW() - INTERVAL '88 days', NOW() - INTERVAL '1 day'),
  ('Agua Mineral 1.5L', 'Bebida sem gas', '789100000011', 2.20, 3.80, 300, 100, NOW() + INTERVAL '25 days', 'BEB24K', 'F1-01', NULL, TRUE, 'aprovado', 6, 2, 4, NOW() - INTERVAL '85 days', NOW() - INTERVAL '1 day'),
  ('Refrigerante Cola 2L', 'Bebida gaseificada', '789100000012', 5.80, 8.50, 180, 70, NOW() + INTERVAL '150 days', 'BEB24L', 'F1-02', NULL, TRUE, 'aprovado', 6, 2, 4, NOW() - INTERVAL '83 days', NOW() - INTERVAL '1 day'),
  ('Calcario Dolomitico 50kg', 'Corretivo de acidez do solo', '789100000013', 45.00, 63.00, 210, 70, NOW() + INTERVAL '365 days', 'FRT24M', 'A2-01', NULL, TRUE, 'aprovado', 1, 4, 6, NOW() - INTERVAL '80 days', NOW() - INTERVAL '1 day'),
  ('Fungicida Triazol 1L', 'Controle de fungos foliares', '789100000014', 120.00, 158.00, 12, 18, NOW() + INTERVAL '170 days', 'DEF24N', 'B3-01', NULL, TRUE, 'aprovado', 2, 3, 5, NOW() - INTERVAL '78 days', NOW() - INTERVAL '1 day'),
  ('Semente Feijao 40kg', 'Semente selecionada de feijao', '789100000015', 260.00, 325.00, 130, 40, NOW() + INTERVAL '300 days', 'SEM24O', 'C2-01', NULL, TRUE, 'aprovado', 3, 1, 3, NOW() - INTERVAL '75 days', NOW() - INTERVAL '1 day'),
  ('Racao Suino 25kg', 'Racao balanceada para suinos', '789100000016', 49.00, 66.00, 170, 55, NOW() + INTERVAL '200 days', 'RAC24P', 'D2-01', NULL, TRUE, 'aprovado', 4, 2, 4, NOW() - INTERVAL '72 days', NOW() - INTERVAL '1 day'),
  ('Alcool 70 1L', 'Desinfeccao de superficies', '789100000017', 6.50, 11.00, 20, 25, NOW() + INTERVAL '60 days', 'LIM24Q', 'E2-01', NULL, TRUE, 'aprovado', 5, 3, 5, NOW() - INTERVAL '68 days', NOW() - INTERVAL '1 day'),
  ('Energetico 473ml', 'Bebida energetica lata', '789100000018', 4.20, 7.50, 240, 90, NOW() + INTERVAL '240 days', 'BEB24R', 'F2-01', NULL, TRUE, 'aprovado', 6, 4, 6, NOW() - INTERVAL '65 days', NOW() - INTERVAL '1 day');

-- =============================
-- 4) Movimentacoes fake
-- =============================

-- Entradas (historico de reposicao)
INSERT INTO movimentacoes (
  tipo,
  quantidade,
  data_movimentacao,
  observacao,
  documento,
  produto_id,
  usuario_id,
  unidade_origem_id,
  unidade_destino_id,
  criado_em,
  atualizado_em
)
SELECT
  'ENTRADA'::enum_movimentacoes_tipo,
  20 + ((p.id * 3) % 35),
  NOW() - ((120 - ((p.id * 4) % 90)) || ' days')::interval,
  'Entrada de reposicao de estoque',
  'NF-ENT-2026-' || LPAD(p.id::text, 4, '0'),
  p.id,
  p.usuario_id,
  p.unidade_id,
  NULL,
  NOW() - ((120 - ((p.id * 4) % 90)) || ' days')::interval,
  NOW() - ((120 - ((p.id * 4) % 90)) || ' days')::interval + INTERVAL '10 minutes'
FROM produtos p;

-- Saidas (vendas/consumo)
INSERT INTO movimentacoes (
  tipo,
  quantidade,
  data_movimentacao,
  observacao,
  documento,
  produto_id,
  usuario_id,
  unidade_origem_id,
  unidade_destino_id,
  criado_em,
  atualizado_em
)
SELECT
  'SAIDA'::enum_movimentacoes_tipo,
  10 + ((p.id * 2) % 25),
  NOW() - ((60 - ((p.id * 3) % 45)) || ' days')::interval,
  'Saida para atendimento de pedidos',
  'NF-SAI-2026-' || LPAD(p.id::text, 4, '0'),
  p.id,
  p.usuario_id,
  p.unidade_id,
  NULL,
  NOW() - ((60 - ((p.id * 3) % 45)) || ' days')::interval,
  NOW() - ((60 - ((p.id * 3) % 45)) || ' days')::interval + INTERVAL '6 minutes'
FROM produtos p
WHERE p.id <= 15;

-- Transferencias entre unidades
INSERT INTO movimentacoes (
  tipo,
  quantidade,
  data_movimentacao,
  observacao,
  documento,
  produto_id,
  usuario_id,
  unidade_origem_id,
  unidade_destino_id,
  criado_em,
  atualizado_em
)
SELECT
  'TRANSFERENCIA'::enum_movimentacoes_tipo,
  5 + (p.id % 8),
  NOW() - ((22 - (p.id % 15)) || ' days')::interval,
  'Transferencia para balanceamento entre unidades',
  'TRF-2026-' || LPAD(p.id::text, 4, '0'),
  p.id,
  p.usuario_id,
  p.unidade_id,
  CASE WHEN p.unidade_id = 4 THEN 1 ELSE p.unidade_id + 1 END,
  NOW() - ((22 - (p.id % 15)) || ' days')::interval,
  NOW() - ((22 - (p.id % 15)) || ' days')::interval + INTERVAL '12 minutes'
FROM produtos p
WHERE p.id IN (1, 2, 3, 5, 6, 7, 12, 15);

-- Ajustes de inventario
INSERT INTO movimentacoes (
  tipo,
  quantidade,
  data_movimentacao,
  observacao,
  documento,
  produto_id,
  usuario_id,
  unidade_origem_id,
  unidade_destino_id,
  criado_em,
  atualizado_em
)
SELECT
  'AJUSTE'::enum_movimentacoes_tipo,
  2 + (p.id % 4),
  NOW() - ((12 - (p.id % 8)) || ' days')::interval,
  'Ajuste de inventario apos conferencia ciclica',
  'AJU-2026-' || LPAD(p.id::text, 4, '0'),
  p.id,
  p.usuario_id,
  p.unidade_id,
  NULL,
  NOW() - ((12 - (p.id % 8)) || ' days')::interval,
  NOW() - ((12 - (p.id % 8)) || ' days')::interval + INTERVAL '4 minutes'
FROM produtos p
WHERE p.id IN (3, 8, 10, 14, 17);

COMMIT;
