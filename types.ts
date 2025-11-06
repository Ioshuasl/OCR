export interface DocumentData {
  tipoDocumento: string;
  
  // Campos de Identidade
  nome: string;
  filiacaoMae: string;
  filiacaoPai: string;
  dataNascimento: string;
  naturalidade: string;
  rg: string;
  cpf: string;
  dataEmissao: string;
  orgaoEmissorUF: string;
  
  // Campos CNH
  numeroRegistroCNH: string;
  dataValidade: string;
  categoriaHabilitacao: string;

  // Campos de Comprovante de Residência
  destinatario: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  dataEmissaoConta: string;
}