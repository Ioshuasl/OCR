import React, { ChangeEvent } from 'react';
import type { DocumentData } from '../types';

interface DocumentFormProps {
  data: DocumentData;
  onUpdate: (updatedData: DocumentData) => void;
  imageUrl: string | null;
}

const LabeledInput: React.FC<{ label: string; name: keyof DocumentData; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
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


const DocumentForm: React.FC<DocumentFormProps> = ({ data, onUpdate, imageUrl }) => {
    
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };
  
  // Lógica de exibição condicional atualizada
  const docType = data.tipoDocumento.toUpperCase();
  const isIdentity = docType === 'RG' || docType === 'CNH';
  const isRG = docType === 'RG' || (isIdentity && data.naturalidade.length > 0);
  const isCNH = docType === 'CNH' || (isIdentity && (data.numeroRegistroCNH.length > 0 || data.dataValidade.length > 0));
  const isEndereco = docType.includes('ENDEREÇO') || docType.includes('RESIDÊNCIA') || docType.includes('CONTA') || (data.cep.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Informações Extraídas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Revise e edite os dados extraídos abaixo. A IA não é perfeita, então por favor, verifique os detalhes.
            </p>

            <div className="pt-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tipo de Documento Identificado
                </label>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-md font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {data.tipoDocumento || "Desconhecido"}
                </span>
            </div>
            
            <form className="space-y-4 pt-2">

                {/* --- SEÇÃO: DOCUMENTOS DE IDENTIDADE (RG/CNH) --- */}
                {isIdentity && (
                    <>
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-300 dark:border-slate-600 pb-2">
                            Dados Pessoais
                        </h4>
                        <LabeledInput label="Nome Completo" name="nome" value={data.nome} onChange={handleChange} />
                        <LabeledInput label="Nome da Mãe" name="filiacaoMae" value={data.filiacaoMae} onChange={handleChange} />
                        <LabeledInput label="Nome do Pai" name="filiacaoPai" value={data.filiacaoPai} onChange={handleChange} />
                        <LabeledInput label="Data de Nascimento" name="dataNascimento" value={data.dataNascimento} onChange={handleChange} />

                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 pt-3 mb-2 border-b border-slate-300 dark:border-slate-600 pb-2">
                            Dados do Documento
                        </h4>
                        <LabeledInput label="CPF" name="cpf" value={data.cpf} onChange={handleChange} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LabeledInput label="RG" name="rg" value={data.rg} onChange={handleChange} />
                            <LabeledInput label="Data de Emissão" name="dataEmissao" value={data.dataEmissao} onChange={handleChange} />
                        </div>
                        <LabeledInput label="Órgão Emissor / UF" name="orgaoEmissorUF" value={data.orgaoEmissorUF} onChange={handleChange} />
                    </>
                )}

                {/* --- SEÇÃO (RG) --- */}
                {isRG && (
                    <div className="pt-4">
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                            Informações Adicionais (RG)
                        </h4>
                        <div className="space-y-4">
                            <LabeledInput label="Naturalidade (Cidade/UF)" name="naturalidade" value={data.naturalidade} onChange={handleChange} />
                        </div>
                    </div>
                )}
                
                {/* --- SEÇÃO (CNH) --- */}
                {isCNH && (
                    <div className="pt-4">
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                            Informações da CNH
                        </h4>
                        <div className="space-y-4">
                            <LabeledInput label="Nº Registro CNH / RENACH" name="numeroRegistroCNH" value={data.numeroRegistroCNH} onChange={handleChange} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <LabeledInput label="Data de Validade" name="dataValidade" value={data.dataValidade} onChange={handleChange} />
                                <LabeledInput label="Categoria" name="categoriaHabilitacao" value={data.categoriaHabilitacao} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NOVA SEÇÃO (COMPROVANTE DE RESIDÊNCIA) --- */}
                {isEndereco && (
                    <div className="pt-4">
                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-300 dark:border-slate-600 pb-2">
                            Dados de Endereço
                        </h4>
                        <div className="space-y-4">
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
                    </div>
                )}
            </form>
        </div>
        <div className="flex flex-col">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Visualização do Documento</h3>
             {imageUrl && (
                <div className="flex-grow bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <img src={imageUrl} alt="Documento escaneado" className="object-contain max-h-full max-w-full" />
                </div>
            )}
        </div>
    </div>
  );
};

export default DocumentForm;