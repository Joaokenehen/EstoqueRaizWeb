# Modelagem Dimensional - Estoque Raiz

## 1) Grao das Tabelas Fato

1. fato_movimentacao_estoque:
   - 1 linha por movimentacao registrada no sistema de origem.
2. fato_snapshot_estoque_diario:
   - 1 linha por produto, unidade e dia de captura.

## 2) Modelo Estrela

Dimensoes conectadas a fato_movimentacao_estoque:

1. dim_data
2. dim_produto
3. dim_categoria
4. dim_unidade (origem e destino)
5. dim_usuario
6. dim_tipo_movimentacao

Dimensoes conectadas a fato_snapshot_estoque_diario:

1. dim_data
2. dim_produto
3. dim_unidade

## 3) Dimensoes

### dim_data

Chave:
1. sk_data (YYYYMMDD)

Atributos principais:
1. data_completa
2. ano
3. semestre
4. trimestre
5. mes
6. semana_ano
7. dia_mes
8. dia_semana
9. nome_mes
10. nome_dia_semana
11. eh_fim_semana

### dim_categoria

Chaves:
1. sk_categoria
2. nk_categoria (id da categoria no OLTP)

Atributos:
1. nome
2. descricao
3. data_atualizacao_fonte

### dim_unidade

Chaves:
1. sk_unidade
2. nk_unidade (id da unidade no OLTP)

Atributos:
1. nome
2. descricao
3. rua
4. numero
5. bairro
6. cidade
7. estado
8. cep

### dim_usuario

Chaves:
1. sk_usuario
2. nk_usuario (id do usuario no OLTP)

Atributos:
1. nome
2. email
3. status
4. cargo
5. nk_unidade
6. data_criacao_fonte

### dim_tipo_movimentacao

Chaves:
1. sk_tipo_movimentacao
2. nk_tipo_movimentacao (ENTRADA, SAIDA, TRANSFERENCIA, AJUSTE)

Atributos:
1. descricao

### dim_produto

Chaves:
1. sk_produto
2. nk_produto (id do produto no OLTP)

Atributos:
1. nome
2. descricao
3. codigo_barras
4. status_produto
5. ativo
6. preco_custo
7. preco_venda
8. quantidade_minima
9. data_validade
10. lote
11. localizacao
12. nk_categoria
13. nk_unidade
14. nk_usuario_criador
15. criado_em_fonte
16. atualizado_em_fonte

## 4) Fatos

### fato_movimentacao_estoque

Chaves de relacionamento:
1. sk_data
2. sk_produto
3. sk_usuario
4. sk_unidade_origem
5. sk_unidade_destino
6. sk_tipo_movimentacao

Degenerada:
1. id_movimentacao_origem

Medidas:
1. quantidade_movimentada
2. valor_custo_movimentado
3. valor_venda_movimentado
4. quantidade_entrada
5. quantidade_saida
6. quantidade_transferencia
7. quantidade_ajuste

Campos de auditoria:
1. criado_em_fonte
2. atualizado_em_fonte
3. data_carga_dw

### fato_snapshot_estoque_diario

Chaves de relacionamento:
1. sk_data
2. sk_produto
3. sk_unidade

Medidas:
1. quantidade_estoque
2. quantidade_minima
3. valor_custo_estoque
4. valor_venda_estoque
5. indicador_estoque_baixo

Campos de auditoria:
1. data_snapshot
2. data_carga_dw

## 5) Regras de Negocio Analiticas

1. SAIDA representa consumo de estoque e base de giro.
2. ENTRADA aumenta disponibilidade.
3. TRANSFERENCIA deve ser analisada por origem e destino.
4. AJUSTE representa correcao operacional e deve ser monitorado para identificar divergencias.
5. Produtos ativos e aprovados sao prioridade na visao executiva.

## 6) Mapeamento OLTP -> DW

Tabelas de origem:
1. movimentacoes
2. produtos
3. categorias
4. unidades
5. usuarios

Mapeamentos diretos importantes:
1. movimentacoes.tipo -> dim_tipo_movimentacao.nk_tipo_movimentacao
2. movimentacoes.data_movimentacao -> dim_data.data_completa
3. movimentacoes.produto_id -> dim_produto.nk_produto
4. produtos.categoria_id -> dim_produto.nk_categoria e dim_categoria.nk_categoria
5. produtos.unidade_id -> dim_produto.nk_unidade e dim_unidade.nk_unidade
