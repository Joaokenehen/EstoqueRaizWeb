export interface CriarMovimentacaoDTO {
  tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
  quantidade: number;
  observacao?: string;
  documento?: string;
  produto_id: number;
  usuario_id?: number;
  unidade_origem_id?: number;
  unidade_destino_id?: number;
  status?: "pendente" | "aprovado" | "rejeitado";
  valor_custo?: number;
  valor_venda?: number;
}

export interface FiltroMovimentacoesDTO {
  produto_id?: number;
  unidade_id?: number;
  tipo?: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
  data_inicio?: string;
  data_fim?: string;
  status?: "pendente" | "aprovado" | "rejeitado";
}

export interface AprovarMovimentacaoDTO {
  valor_custo: number;
  valor_venda: number;
}
