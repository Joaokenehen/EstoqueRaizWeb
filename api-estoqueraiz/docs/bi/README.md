# BI - Guia de Implementacao (Estoque Raiz)

Este guia foi montado para voce atender os criterios de avaliacao da disciplina de BI usando os dados reais do projeto Estoque Raiz.

## 1) Problema, Objetivos e Relevancia

### Problema
O time nao possui uma visao analitica unica para entender ruptura, excesso de estoque, giro e impacto financeiro por unidade. As consultas operacionais existem, mas sem consolidacao historica para decisao gerencial.

### Objetivo geral
Construir uma camada BI com modelagem dimensional para monitorar desempenho de estoque, movimentacoes e risco operacional por produto, categoria e unidade.

### Objetivos especificos
1. Medir entradas, saidas, transferencias e ajustes ao longo do tempo.
2. Identificar produtos com maior impacto financeiro (Curva ABC).
3. Monitorar produtos com estoque abaixo do minimo e risco de vencimento.
4. Comparar desempenho entre unidades para apoiar reposicao e transferencia.

### Relevancia
1. Operacional: reduz ruptura e excesso de estoque.
2. Financeira: melhora alocacao de capital em inventario.
3. Gerencial: prioriza acoes com base em indicadores objetivos.
4. Academica: demonstra ciclo completo de BI (problema -> dados -> ETL -> dashboard -> analise).

## 2) Arquitetura de Dados Proposta

1. Fontes OLTP: tabelas transacionais do PostgreSQL (produtos, movimentacoes, categorias, unidades, usuarios).
2. Camada Staging: extracao e padronizacao de tipos e chaves.
3. Camada DW: schema dw com modelo estrela.
4. Camada de Consumo: views SQL e dashboards (Power BI, Metabase ou Grafana).

Arquivos desta pasta:

1. modelagem-dimensional.md
2. kpis-dashboards.md
3. sql/dw_schema.sql
4. sql/etl_carga.sql

## 3) Como Executar o MVP BI

1. Criar estrutura do DW:
   - executar sql/dw_schema.sql
2. Rodar carga inicial e incremental:
   - executar sql/etl_carga.sql
3. Conectar ferramenta de dashboard ao schema dw.
4. Criar paines conforme kpis-dashboards.md.

## 4) Escopo Minimo para Entrega

1. Fato principal: fato_movimentacao_estoque.
2. Fato complementar: fato_snapshot_estoque_diario.
3. Dimensoes: data, produto, categoria, unidade, usuario, tipo_movimentacao.
4. Dashboards:
   - Visao executiva
   - Visao operacional por unidade
   - Visao de produtos e curva ABC

## 5) Checklist por Criterio da Disciplina

### Problema, Objetivos e Relevancia
1. Problema contextualizado com impacto real.
2. Objetivo geral e objetivos especificos mensuraveis.
3. Perguntas analiticas respondiveis por KPIs.

### Modelagem e Arquitetura de Dados
1. Grao da fato definido com clareza.
2. Separacao fato x dimensao coerente.
3. Chaves substitutas e naturais documentadas.

### Processo ETL/ELT
1. Extracao das fontes relevantes.
2. Regras de limpeza e padronizacao registradas.
3. Carga incremental com controle de atualizacao.

### Dashboards e Indicadores
1. KPIs conectados aos objetivos de negocio.
2. Visual limpo e com filtros uteis.
3. Analise final com recomendacoes acionaveis.

## 6) Perguntas Analiticas para Apresentacao

1. Quais produtos mais consomem valor de estoque por unidade?
2. Quais categorias apresentam maior risco de ruptura?
3. Como o volume de saidas evoluiu nos ultimos meses?
4. Qual unidade tem maior incidencia de estoque baixo?
5. Quais produtos sao classe A na Curva ABC?
