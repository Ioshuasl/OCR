import { GoogleGenAI, Type } from "@google/genai";
// Importará os novos tipos que definiremos em types.ts
import type { AllDocumentData, DocType } from '../types'; 

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- SCHEMA 1: APENAS IDENTIFICAÇÃO ---
// Schema simples usado na primeira chamada.
const responseSchemaIdentification = {
    type: Type.OBJECT,
    properties: {
        tipoDocumento: { 
            type: Type.STRING, 
            description: "Classifique o tipo de documento. Respostas válidas: 'RG', 'CNH', 'COMPROVANTE_ENDERECO', 'PROCURACAO', 'ESCRITURA', 'ESTATUTO', 'ATA', 'DESCONHECIDO'." 
        },
    },
    required: ["tipoDocumento"],
};

// --- DICIONÁRIO DE SCHEMAS PARA EXTRAÇÃO ---
// Definimos um schema de extração detalhado para CADA tipo de documento.

const schemaRG = {
    type: Type.OBJECT,
    properties: {
        nome: { type: Type.STRING },
        filiacaoMae: { type: Type.STRING },
        filiacaoPai: { type: Type.STRING },
        dataNascimento: { type: Type.STRING },
        naturalidade: { type: Type.STRING },
        rg: { type: Type.STRING },
        cpf: { type: Type.STRING },
        dataEmissao: { type: Type.STRING },
        orgaoEmissorUF: { type: Type.STRING },
    },
    required: ["nome", "rg", "cpf"]
};

const schemaCNH = {
    type: Type.OBJECT,
    properties: {
        nome: { type: Type.STRING },
        filiacaoMae: { type: Type.STRING },
        filiacaoPai: { type: Type.STRING },
        dataNascimento: { type: Type.STRING },
        rg: { type: Type.STRING },
        cpf: { type: Type.STRING },
        dataEmissao: { type: Type.STRING },
        orgaoEmissorUF: { type: Type.STRING },
        numeroRegistroCNH: { type: Type.STRING },
        dataValidade: { type: Type.STRING },
        categoriaHabilitacao: { type: Type.STRING },
    },
    required: ["nome", "cpf", "numeroRegistroCNH"]
};

const schemaEndereco = {
    type: Type.OBJECT,
    properties: {
        destinatario: { type: Type.STRING },
        logradouro: { type: Type.STRING },
        numero: { type: Type.STRING },
        bairro: { type: Type.STRING },
        cidade: { type: Type.STRING },
        estado: { type: Type.STRING },
        cep: { type: Type.STRING },
        dataEmissaoConta: { type: Type.STRING },
    },
    required: ["destinatario", "logradouro", "cidade", "cep"]
};

const schemaProcuracao = {
    type: Type.OBJECT,
    properties: {
        outorganteNome: { type: Type.STRING, description: "Nome completo do Outorgante (quem dá os poderes)" },
        outorganteCpf: { type: Type.STRING, description: "CPF/CNPJ do Outorgante" },
        outorgadoNome: { type: Type.STRING, description: "Nome completo do Outorgado (quem recebe os poderes)" },
        outorgadoCpf: { type: Type.STRING, description: "CPF/CNPJ do Outorgado" },
        poderes: { type: Type.STRING, description: "Um resumo breve dos poderes concedidos" },
        localData: { type: Type.STRING, description: "Local e data de assinatura (ex: 'São Paulo, 01 de Janeiro de 2025')" },
    },
    required: ["outorganteNome", "outorgadoNome", "poderes"]
};

const schemaEscritura = {
     type: Type.OBJECT,
    properties: {
        vendedorNome: { type: Type.STRING, description: "Nome completo do Vendedor/Transmitente" },
        vendedorCpf: { type: Type.STRING, description: "CPF/CNPJ do Vendedor" },
        compradorNome: { type: Type.STRING, description: "Nome completo do Comprador/Adquirente" },
        compradorCpf: { type: Type.STRING, description: "CPF/CNPJ do Comprador" },
        descricaoImovel: { type: Type.STRING, description: "Descrição breve do imóvel (ex: 'Lote 10, Quadra 5...')" },
        valorTransacao: { type: Type.STRING, description: "Valor da transação (ex: 'R$ 500.000,00')" },
    },
    required: ["vendedorNome", "compradorNome", "descricaoImovel"]
};

const schemaEstatuto = {
    type: Type.OBJECT,
    properties: {
        razaoSocial: { type: Type.STRING, description: "Nome empresarial completo (Razão Social) da organização." },
        tipoOrganizacao: { type: Type.STRING, description: "Tipo de entidade (ex: 'Organização Religiosa', 'Associação Civil', 'Fundação')." },
        dataFundacao: { type: Type.STRING, description: "Data de fundação da organização (ex: '12 de outubro de 2024')." },
        sedeEndereco: { type: Type.STRING, description: "Endereço completo da sede (Rua, Nº, Bairro, CEP, Cidade, UF)." },
        duracao: { type: Type.STRING, description: "Prazo de duração (ex: 'Indeterminado')." },
        objetoSocial: { type: Type.STRING, description: "Resumo dos objetivos e finalidades da organização." },
        representanteLegal: { type: Type.STRING, description: "Nome completo do Representante Legal (ex: 'Primeiro Presidente')." },
        membrosDiretoria: { type: Type.STRING, description: "Lista dos membros da diretoria, seus cargos e mandatos (ex: 'Maria Elza - 1ª Presidente (Indeterminado), Cícero Cunha - 2º Presidente (Indeterminado)...')." },
        clausulaReforma: { type: Type.STRING, description: "Resumo da regra para reformar o estatuto (ex: '2/3 dos membros em Assembleia Geral Extraordinária')." },
        clausulaDissolucao: { type: Type.STRING, description: "Resumo da regra de dissolução e destino do patrimônio." },
    },
    required: ["razaoSocial", "tipoOrganizacao", "sedeEndereco", "objetoSocial", "representanteLegal"]
};

const schemaAta = {
    type: Type.OBJECT,
    properties: {
        nomeOrganizacao: { type: Type.STRING, description: "Nome da entidade/organização que está realizando a reunião." },
        tipoAta: { type: Type.STRING, description: "Tipo da Ata (ex: 'Ata de Fundação', 'Ata de Assembleia Geral Ordinária')." },
        dataReuniao: { type: Type.STRING, description: "Data e hora da reunião (ex: '12 de outubro de 2024, às 20h')." },
        localReuniao: { type: Type.STRING, description: "Endereço completo onde a reunião ocorreu." },
        presidenteAta: { type: Type.STRING, description: "Nome de quem presidiu a reunião." },
        secretarioAta: { type: Type.STRING, description: "Nome de quem secretariou a reunião." },
        pauta: { type: Type.STRING, description: "Resumo dos objetivos/pauta da reunião (ex: 'Eleição da diretoria, aprovação do estatuto...')." },
        deliberacoes: { type: Type.STRING, description: "Resumo das principais decisões tomadas." },
        membrosEleitos: { type: Type.STRING, description: "Lista de membros eleitos, seus cargos e mandatos (ex: 1ª Presidente (Indeterminado), 2º Presidente." },
        signatarios: { type: Type.STRING, description: "Lista dos nomes dos principais signatários (ex: 'Presidente, Secretário, Advogado')." },
    },
    required: ["nomeOrganizacao", "tipoAta", "dataReuniao", "localReuniao", "pauta"]
};

// Mapeamento de tipos para os schemas
const extractionSchemas = {
    'RG': schemaRG,
    'CNH': schemaCNH,
    'COMPROVANTE_ENDERECO': schemaEndereco,
    'PROCURACAO': schemaProcuracao,
    'ESCRITURA': schemaEscritura,
    'ESTATUTO': schemaEstatuto,
    'ATA': schemaAta,         
};

// --- FUNÇÃO 1: IDENTIFICAR O DOCUMENTO ---
export const identifyDocumentType = async (base64Image: string, mimeType: string): Promise<{ tipoDocumento: DocType }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: "Classifique o tipo deste documento. Responda apenas com o JSON." },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchemaIdentification,
            }
        });
        const parsedData = JSON.parse(response.text.trim());
        return parsedData;

    } catch (error) {
        console.error("Error identifying document:", error);
        throw new Error("Falha ao identificar o tipo de documento.");
    }
};

// --- FUNÇÃO 2: EXTRAIR OS DADOS (COM BASE NO TIPO) ---
export const extractDataFromImage = async (base64Image: string, mimeType: string, docType: DocType): Promise<AllDocumentData> => {
    
    // @ts-ignore
    const schema = extractionSchemas[docType];

    if (!schema) {
        throw new Error(`Não há um schema de extração definido para o tipo: ${docType}`);
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: `O documento é um(a) ${docType}. Extraia as informações solicitadas no schema JSON.` },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        
        const parsedData = JSON.parse(response.text.trim());
        
        // Adiciona o tipo do documento ao objeto final para
        // que o frontend saiba qual formulário renderizar
        return { ...parsedData, tipoDocumento: docType };

    } catch (error) {
        console.error("Error extracting data:", error);
        throw new Error(`Falha ao extrair dados para ${docType}.`);
    }
};