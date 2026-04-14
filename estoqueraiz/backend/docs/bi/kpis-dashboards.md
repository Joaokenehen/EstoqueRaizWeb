# KPIs e Dashboards - Estoque Raiz

## 1) KPIs Principais

### 1. Valor total em estoque
Formula:
valor_total_estoque = SUM(valor_custo_estoque)

Uso:
1. Medir capital imobilizado em estoque.

### 2. Taxa de estoque baixo
Formula:
taxa_estoque_baixo = produtos_abaixo_minimo / total_produtos_ativos

Uso:
1. Medir risco de ruptura por unidade e categoria.

### 3. Giro de estoque (aproximado)
Formula:
giro = quantidade_saida_periodo / estoque_medio_periodo

Uso:
1. Identificar produtos com alta e baixa rotacao.

### 4. Cobertura de estoque em dias
Formula:
cobertura_dias = estoque_atual / media_saida_diaria

Uso:
1. Apoiar reposicao e transferencia preventiva.

### 5. Percentual por classe ABC
Formula:
percentual_classe = valor_classe / valor_total_geral

Uso:
1. Priorizar produtos classe A para compras e monitoramento.

### 6. Indice de ajustes
Formula:
indice_ajuste = quantidade_ajuste / quantidade_movimentada_total

Uso:
1. Monitorar possiveis falhas operacionais ou divergencias de inventario.

## 2) Dashboards Recomendados

## Painel 1 - Visao Executiva

Objetivo:
1. Mostrar saude geral do estoque e impacto financeiro.

Componentes:
1. Cards: valor total em estoque, taxa de estoque baixo, produtos ativos, produtos vencendo.
2. Linha temporal: entradas x saidas por mes.
3. Barras: top 10 produtos por valor movimentado.
4. Pizza ou barras empilhadas: participacao por classe ABC.

Filtros:
1. Periodo
2. Unidade
3. Categoria

## Painel 2 - Operacional por Unidade

Objetivo:
1. Comparar performance das unidades e apoiar acao rapida.

Componentes:
1. Ranking de unidades por taxa de estoque baixo.
2. Heatmap de produtos abaixo do minimo por unidade.
3. Tabela de transferencias origem x destino.
4. Tendencia mensal de ajustes por unidade.

Filtros:
1. Unidade
2. Tipo de movimentacao
3. Categoria

## Painel 3 - Produtos e Curva ABC

Objetivo:
1. Priorizar itens de maior impacto no negocio.

Componentes:
1. Tabela ABC com classificacao A/B/C.
2. Scatter plot: giro x valor em estoque.
3. Lista de produtos sem movimentacao recente.
4. Lista de produtos com cobertura critica.

Filtros:
1. Periodo
2. Unidade
3. Categoria

## 3) Analises que voce pode apresentar

1. Unidades com maior taxa de estoque baixo e acao sugerida.
2. Produtos classe A com baixa cobertura e necessidade de reposicao.
3. Evolucao mensal das saidas e efeito no valor em estoque.
4. Impacto de ajustes no controle operacional.

## 4) Storyline para apresentacao

1. Contexto: desafio de controle de estoque em multiplas unidades.
2. Evidencia: KPIs mostram risco de ruptura e capital parado.
3. Causa: concentracao de valor em poucos produtos (ABC).
4. Acao: reposicao orientada por cobertura e giro.
5. Resultado esperado: menos ruptura e melhor uso de capital.
