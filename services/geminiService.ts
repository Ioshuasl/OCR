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
        nome: { 
            type: Type.STRING, 
            description: "Nome completo da pessoa." 
        },
        filiacaoMae: { 
            type: Type.STRING, 
            description: "Nome completo da mãe." 
        },
        filiacaoPai: { 
            type: Type.STRING, 
            description: "Nome completo do pai." 
        },
        dataNascimento: { 
            type: Type.STRING, 
            description: "Data de nascimento no formato DD/MM/AAAA." 
        },
        rg: { 
            type: Type.STRING, 
            description: "O número do 'Registro Geral' (RG)." 
        },
        cpf: { 
            type: Type.STRING, 
            description: "O número do 'Cadastro de Pessoas Físicas' (CPF), formatado como XXX.XXX.XXX-XX." 
        },
    },
     required: ["nome", "filiacaoMae", "filiacaoPai", "dataNascimento", "rg", "cpf"],
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
              text: "Você é um sistema de OCR especialista em documentos de identidade brasileiros. Extraia as seguintes informações da imagem fornecida e retorne-as como um objeto JSON. Se um campo não for encontrado, retorne uma string vazia para seu valor.",
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

    // Ensure all fields are present, even if empty, to match the DocumentData interface
    const defaultData: DocumentData = {
        nome: "",
        filiacaoMae: "",
        filiacaoPai: "",
        dataNascimento: "",
        rg: "",
        cpf: ""
    };

    return { ...defaultData, ...parsedData };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao processar o documento. O modelo de IA não conseguiu extrair os dados.");
  }
};