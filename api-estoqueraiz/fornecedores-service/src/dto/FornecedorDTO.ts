export interface CriarFornecedorDTO {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface AtualizarFornecedorDTO extends Partial<CriarFornecedorDTO> {}