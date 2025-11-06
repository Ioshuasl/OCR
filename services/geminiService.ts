import { GoogleGenAI, Type } from "@google/genai";
import type { DocumentData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        tipoDocumento: {
            type: Type.STRING,
            description: "Classifique o tipo de documento principal na imagem (ex: 'RG', 'CNH', 'Comprovante de Residência', 'Desconhecido')."
        },
        // --- Campos de Identidade (RG/CNH) ---
        nome: { 
            type: Type.STRING, 
            description: "Nome completo da pessoa." 
        },
        filiacaoMae: { 
            type: Type.STRING, 
            description: "Nome completo da mãe (se houver)." 
        },
        filiacaoPai: { 
            type: Type.STRING, 
            description: "Nome completo do pai (se houver)." 
        },
        dataNascimento: { 
            type: Type.STRING, 
            description: "Data de nascimento no formato DD/MM/AAAA." 
        },
        naturalidade: {
            type: Type.STRING,
            description: "Local de nascimento (cidade e UF) como exibido no documento."
        },
        rg: { 
            type: Type.STRING, 
            description: "O número do 'Registro Geral' (RG)." 
        },
        cpf: { 
            type: Type.STRING, 
            description: "O número do 'Cadastro de Pessoas Físicas' (CPF), formatado como XXX.XXX.XXX-XX." 
        },
        dataEmissao: {
            type: Type.STRING,
            description: "Data de Emissão do documento (seja RG ou CNH) no formato DD/MM/AAAA."
        },
        orgaoEmissorUF: {
            type: Type.STRING,
            description: "Órgão Emissor e a UF (Unidade Federativa) do documento (ex: SSP/SP, DETRAN/GO)."
        },
        numeroRegistroCNH: {
            type: Type.STRING,
            description: "Número de Registro da CNH (também pode ser chamado de RENACH)."
        },
        dataValidade: {
            type: Type.STRING,
            description: "Data de Validade da CNH no formato DD/MM/AAAA."
        },
        categoriaHabilitacao: {
            type: Type.STRING,
            description: "Categoria da Habilitação (ex: A, B, AB, etc.)."
        },
        
        // --- Novos Campos (Comprovante de Residência) ---
        destinatario: {
            type: Type.STRING,
            description: "O nome do destinatário da conta (a quem a conta é endereçada)."
        },
        logradouro: {
            type: Type.STRING,
            description: "O endereço completo (Rua/Avenida, etc.), sem o número."
        },
        numero: {
            type: Type.STRING,
            description: "O número do imóvel."
        },
        bairro: {
            type: Type.STRING,
            description: "O bairro."
        },
        cidade: {
            type: Type.STRING,
            description: "A cidade."
        },
        estado: {
            type: Type.STRING,
            description: "O estado (ex: 'SP', 'GO')."
        },
        cep: {
            type: Type.STRING,
            description: "O CEP (Código de Endereçamento Postal)."
        },
        dataEmissaoConta: {
            type: Type.STRING,
            description: "A data de emissão da conta/fatura no formato DD/MM/AAAA."
        }
    },
     // --- MUDANÇA CRÍTICA ---
     // Apenas o tipo de documento é obrigatório.
     // Todo o resto é opcional, pois depende do tipo de documento.
     required: ["tipoDocumento"],
};

export const extractDataFromImage = async (base64Image: string, mimeType: string): Promise<DocumentData> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              // Prompt atualizado para incluir comprovantes
              text: "Você é um sistema de OCR especialista em documentos brasileiros (RG, CNH, Comprovantes de Residência, etc.). **Primeiro, classifique o tipo de documento**. Depois, extraia o máximo de informações possíveis da imagem e retorne-as como um objeto JSON. Se um campo não for encontrado, retorne uma string vazia para seu valor.",
            },
          ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        throw new Error("A API retornou uma resposta vazia.");
    }

    const parsedData = JSON.parse(jsonString);

    // Adicionado todos os campos ao defaultData
    const defaultData = {
        tipoDocumento: "Desconhecido",
        nome: "",
        filiacaoMae: "",
        filiacaoPai: "",
        dataNascimento: "",
        naturalidade: "",
        rg: "",
        cpf: "",
        dataEmissao: "",
        orgaoEmissorUF: "",
        numeroRegistroCNH: "",
        dataValidade: "",
        categoriaHabilitacao: "",
        // Novos campos
        destinatario: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        dataEmissaoConta: ""
    };

    return { ...defaultData, ...parsedData };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao processar o documento. O modelo de IA não conseguiu extrair os dados.");
  }
};