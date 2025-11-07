// Define os tipos de documento que seu serviço conhece
export type DocType = 'RG' | 'CNH' | 'COMPROVANTE_ENDERECO' | 'PROCURACAO' | 'ESCRITURA' | 'ESTATUTO' | 'ATA' | 'DESCONHECIDO';

// Interface base (opcional, mas bom para clareza)
interface BaseDoc {
    tipoDocumento: DocType;
}

// --- Interfaces para cada Schema ---

export interface RgData extends BaseDoc {
    tipoDocumento: 'RG';
    nome: string;
    filiacaoMae: string;
    filiacaoPai: string;
    dataNascimento: string;
    naturalidade: string;
    rg: string;
    cpf: string;
    dataEmissao: string;
    orgaoEmissorUF: string;
}

export interface CnhData extends BaseDoc {
    tipoDocumento: 'CNH';
    nome: string;
    filiacaoMae: string;
    filiacaoPai: string;
    dataNascimento: string;
    rg: string;
    cpf: string;
    dataEmissao: string;
    orgaoEmissorUF: string;
    numeroRegistroCNH: string;
    dataValidade: string;
    categoriaHabilitacao: string;
}

export interface EnderecoData extends BaseDoc {
    tipoDocumento: 'COMPROVANTE_ENDERECO';
    destinatario: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    dataEmissaoConta: string;
}

export interface ProcuracaoData extends BaseDoc {
    tipoDocumento: 'PROCURACAO';
    outorganteNome: string;
    outorganteCpf: string;
    outorgadoNome: string;
    outorgadoCpf: string;
    poderes: string;
    localData: string;
}

export interface EscrituraData extends BaseDoc {
    tipoDocumento: 'ESCRITURA';
    vendedorNome: string;
    vendedorCpf: string;
    compradorNome: string;
    compradorCpf: string;
    descricaoImovel: string;
    valorTransacao: string;
}

export interface EstatutoData extends BaseDoc {
    tipoDocumento: 'ESTATUTO';
    razaoSocial: string;
    tipoOrganizacao: string;
    dataFundacao: string;
    sedeEndereco: string;
    duracao: string;
    objetoSocial: string;
    representanteLegal: string;
    membrosDiretoria: string; // String para lista (compatível com LabeledTextarea)
    clausulaReforma: string;
    clausulaDissolucao: string;
}

export interface AtaData extends BaseDoc {
    tipoDocumento: 'ATA';
    nomeOrganizacao: string;
    tipoAta: string;
    dataReuniao: string;
    localReuniao: string;
    presidenteAta: string;
    secretarioAta: string;
    pauta: string;
    deliberacoes: string;
    membrosEleitos: string; // String para lista (compatível com LabeledTextarea)
    signatarios: string;
}

// Tipo "Desconhecido" para fallback
export interface DesconhecidoData extends BaseDoc {
    tipoDocumento: 'DESCONHECIDO';
}

// --- TIPO DE UNIÃO DISCRIMINADA ---
// O App.tsx e o DocumentForm.tsx usarão este tipo.
export type AllDocumentData = RgData | CnhData | EnderecoData | ProcuracaoData | EscrituraData | DesconhecidoData;