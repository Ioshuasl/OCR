import React, { ChangeEvent, useState } from 'react';
// Importa o novo tipo de união e os tipos individuais
import type { AllDocumentData, RgData, CnhData, EnderecoData, ProcuracaoData, EscrituraData, EstatutoData, AtaData } from '../types';
import Spinner from './Spinner';
import { askQuestionAboutDocument } from '@/services/geminiService';
// --- COMPONENTE DE INPUT REUTILIZÁVEL ---
// (Este LabeledInput que já tínhamos é perfeito)
const LabeledInput: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

const LabeledTextarea: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, name, value, onChange, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);

// --- FORMULÁRIOS ESPECIALIZADOS ---
// Você deve criar um para cada tipo de documento.
// Eu movi o formulário antigo de ID/Endereço para cá.

const FormularioIdentidade: React.FC<{ data: RgData | CnhData; onUpdate: (data: AllDocumentData) => void }> = ({ data, onUpdate }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-300 dark:border-slate-600 pb-2">
                Dados Pessoais
            </h4>
            <LabeledInput label="Nome Completo" name="nome" value={data.nome} onChange={handleChange} />
            <LabeledInput label="Nome da Mãe" name="filiacaoMae" value={data.filiacaoMae} onChange={handleChange} />
            <LabeledInput label="Nome do Pai" name="filiacaoPai" value={data.filiacaoPai} onChange={handleChange} />
            <LabeledInput label="Data de Nascimento" name="dataNascimento" value={data.dataNascimento} onChange={handleChange} />
            <LabeledInput label="CPF" name="cpf" value={data.cpf} onChange={handleChange} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="RG" name="rg" value={data.rg} onChange={handleChange} />
                <LabeledInput label="Data de Emissão" name="dataEmissao" value={data.dataEmissao} onChange={handleChange} />
            </div>
            <LabeledInput label="Órgão Emissor / UF" name="orgaoEmissorUF" value={data.orgaoEmissorUF} onChange={handleChange} />

            {/* Campos Específicos do RG */}
            {data.tipoDocumento === 'RG' && (
                 <LabeledInput label="Naturalidade" name="naturalidade" value={data.naturalidade} onChange={handleChange} />
            )}
            {/* Campos Específicos da CNH */}
            {data.tipoDocumento === 'CNH' && (
                <>
                    <LabeledInput label="Nº Registro CNH" name="numeroRegistroCNH" value={data.numeroRegistroCNH} onChange={handleChange} />
                    <LabeledInput label="Validade CNH" name="dataValidade" value={data.dataValidade} onChange={handleChange} />
                    <LabeledInput label="Categoria CNH" name="categoriaHabilitacao" value={data.categoriaHabilitacao} onChange={handleChange} />
                </>
            )}
        </div>
    );
};

const FormularioEndereco: React.FC<{ data: EnderecoData; onUpdate: (data: AllDocumentData) => void }> = ({ data, onUpdate }) => {
     const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };
    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                Dados de Endereço
            </h4>
            <LabeledInput label="Destinatário" name="destinatario" value={data.destinatario} onChange={handleChange} />
            <LabeledInput label="Logradouro (Rua/Av)" name="logradouro" value={data.logradouro} onChange={handleChange} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LabeledInput label="Número" name="numero" value={data.numero} onChange={handleChange} />
                <LabeledInput label="CEP" name="cep" value={data.cep} onChange={handleChange} />
                <LabeledInput label="Bairro" name="bairro" value={data.bairro} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Cidade" name="cidade" value={data.cidade} onChange={handleChange} />
                <LabeledInput label="Estado (UF)" name="estado" value={data.estado} onChange={handleChange} />
            </div>
            <LabeledInput label="Data de Emissão da Conta" name="dataEmissaoConta" value={data.dataEmissaoConta} onChange={handleChange} />
        </div>
    );
};

// --- CRIE NOVOS FORMULÁRIOS AQUI ---

const FormularioProcuracao: React.FC<{ data: ProcuracaoData; onUpdate: (data: AllDocumentData) => void }> = ({ data, onUpdate }) => {
     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };
    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                Dados da Procuração
            </h4>
            <LabeledInput label="Outorgante (Nome)" name="outorganteNome" value={data.outorganteNome} onChange={handleChange} />
            <LabeledInput label="Outorgante (CPF/CNPJ)" name="outorganteCpf" value={data.outorganteCpf} onChange={handleChange} />
            <LabeledInput label="Outorgado (Nome)" name="outorgadoNome" value={data.outorgadoNome} onChange={handleChange} />
            <LabeledInput label="Outorgado (CPF/CNPJ)" name="outorgadoCpf" value={data.outorgadoCpf} onChange={handleChange} />
            {/* Usando Textarea para poderes */}
            <LabeledTextarea label="Poderes" name="poderes" value={data.poderes} onChange={handleChange} rows={4} />
            <LabeledInput label="Local e Data" name="localData" value={data.localData} onChange={handleChange} />
        </div>
    );
};

const FormularioEstatuto: React.FC<{ data: EstatutoData; onUpdate: (data: AllDocumentData) => void }> = ({ data, onUpdate }) => {
     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };
    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                Dados do Estatuto
            </h4>
            <LabeledInput label="Razão Social" name="razaoSocial" value={data.razaoSocial} onChange={handleChange} />
            <LabeledInput label="Representante Legal" name="representanteLegal" value={data.representanteLegal} onChange={handleChange} />
            <LabeledInput label="Tipo de Organização" name="tipoOrganizacao" value={data.tipoOrganizacao} onChange={handleChange} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Data de Fundação" name="dataFundacao" value={data.dataFundacao} onChange={handleChange} />
                <LabeledInput label="Duração" name="duracao" value={data.duracao} onChange={handleChange} />
            </div>
            <LabeledInput label="Endereço da Sede" name="sedeEndereco" value={data.sedeEndereco} onChange={handleChange} />
            <LabeledTextarea label="Objeto Social (Finalidades)" name="objetoSocial" value={data.objetoSocial} onChange={handleChange} rows={4} />
            <LabeledTextarea label="Membros da Diretoria" name="membrosDiretoria" value={data.membrosDiretoria} onChange={handleChange} rows={4} />
            <LabeledTextarea label="Cláusula de Reforma" name="clausulaReforma" value={data.clausulaReforma} onChange={handleChange} />
            <LabeledTextarea label="Cláusula de Dissolução" name="clausulaDissolucao" value={data.clausulaDissolucao} onChange={handleChange} />
        </div>
    );
};

const FormularioAta: React.FC<{ data: AtaData; onUpdate: (data: AllDocumentData) => void }> = ({ data, onUpdate }) => {
     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };
    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                Dados da Ata
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Nome da Organização" name="nomeOrganizacao" value={data.nomeOrganizacao} onChange={handleChange} />
                <LabeledInput label="Tipo da Ata" name="tipoAta" value={data.tipoAta} onChange={handleChange} />
            </div>
            <LabeledInput label="Data da Reunião" name="dataReuniao" value={data.dataReuniao} onChange={handleChange} />
            <LabeledInput label="Local da Reunião" name="localReuniao" value={data.localReuniao} onChange={handleChange} />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Presidente da Reunião" name="presidenteAta" value={data.presidenteAta} onChange={handleChange} />
                <LabeledInput label="Secretário(a) da Reunião" name="secretarioAta" value={data.secretarioAta} onChange={handleChange} />
            </div>
            <LabeledTextarea label="Pauta (Objetivos)" name="pauta" value={data.pauta} onChange={handleChange} rows={3} />
            <LabeledTextarea label="Deliberações (Decisões)" name="deliberacoes" value={data.deliberacoes} onChange={handleChange} rows={4} />
            <LabeledTextarea label="Membros Eleitos (Diretoria)" name="membrosEleitos" value={data.membrosEleitos} onChange={handleChange} rows={4} />
            <LabeledTextarea label="Signatários" name="signatarios" value={data.signatarios} onChange={handleChange} rows={2} />
        </div>
    );
};

interface QnaBoxProps {
    docBase64: string | null;
    docMimeType: string | null;
}

const QnaBox: React.FC<QnaBoxProps> = ({ docBase64, docMimeType }) => {
    const [question, setQuestion] = useState<string>("");
    const [answer, setAnswer] = useState<string | null>(null);
    const [isAsking, setIsAsking] = useState<boolean>(false);
    const [qnaError, setQnaError] = useState<string | null>(null);

    const handleAsk = async () => {
        if (!docBase64 || !docMimeType || !question) return;

        setIsAsking(true);
        setQnaError(null);
        setAnswer(null);

        try {
            const result = await askQuestionAboutDocument(docBase64, docMimeType, question);
            setAnswer(result);
        } catch (err) {
            setQnaError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="pt-6 mt-6 border-t border-slate-300 dark:border-slate-600">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Pergunte ao Documento
            </h4>
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ex: Qual o valor do capital social?"
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                        onClick={handleAsk}
                        disabled={isAsking || !question}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                        {isAsking ? <Spinner /> : "Perguntar"}
                    </button>
                </div>
                {qnaError && (
                    <p className="text-sm text-red-500">{qnaError}</p>
                )}
                {answer && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{answer}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (ROTEADOR) ---

interface DocumentFormProps {
  data: AllDocumentData;
  onUpdate: (updatedData: AllDocumentData) => void;
  imageUrl: string | null;
  docBase64: string | null;
  docMimeType: string | null;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ data, onUpdate, imageUrl, docBase64, docMimeType }) => {
    
  // A lógica de renderização agora é um switch
  const renderFormFields = () => {
    switch (data.tipoDocumento) {
        case 'RG':
        case 'CNH':
            return <FormularioIdentidade data={data} onUpdate={onUpdate} />;
        
        case 'COMPROVANTE_ENDERECO':
            return <FormularioEndereco data={data} onUpdate={onUpdate} />;

        case 'PROCURACAO':
            return <FormularioProcuracao data={data} onUpdate={onUpdate} />;
        
        case 'ESCRITURA':
            // @ts-ignore
            // (Você precisará criar o FormularioEscritura)
            return <p>Formulário para ESCRITURA ainda não implementado.</p>;

        // --- NOVOS CASES ADICIONADOS ---
        case 'ESTATUTO':
             // @ts-ignore
            return <FormularioEstatuto data={data} onUpdate={onUpdate} />;
        
        case 'ATA':
             // @ts-ignore
            return <FormularioAta data={data} onUpdate={onUpdate} />;

        case 'DESCONHECIDO':
        default:
            return <p className="text-red-500">Não foi possível extrair dados estruturados para este tipo de documento ({data.tipoDocumento}).</p>;
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Informações Extraídas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Revise e edite os dados extraídos abaixo.
            </p>

            {/* Badge de Tipo de Documento */}
            <div className="pt-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tipo de Documento Identificado
                </label>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-md font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {data.tipoDocumento || "Desconhecido"}
                </span>
            </div>
            
            <form className="space-y-4 pt-2">
                {/* Renderiza o formulário dinâmico aqui */}
                {renderFormFields()}
            </form>

            {/* --- NOVA SEÇÃO DE Q&A RENDERIZADA --- */}
            <QnaBox docBase64={docBase64} docMimeType={docMimeType} />
        </div>
        
        {/* Lado da Imagem (permanece o mesmo) */}
        <div className="flex flex-col">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Visualização do Documento</h3>
             <div className="flex-grow bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[300px]">
                {imageUrl ? (
                    <img src={imageUrl} alt="Documento escaneado" className="object-contain max-h-full max-w-full" />
                ) : (
                    <div className="text-center p-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Pré-visualização não disponível</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">O arquivo enviado é um PDF.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DocumentForm;
