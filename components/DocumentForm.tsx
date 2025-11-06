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
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Informações Extraídas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Revise e edite os dados extraídos abaixo. A IA não é perfeita, então por favor, verifique os detalhes.
            </p>
            <form className="space-y-4 pt-2">
                <LabeledInput label="Nome Completo" name="nome" value={data.nome} onChange={handleChange} />
                <LabeledInput label="Nome da Mãe" name="filiacaoMae" value={data.filiacaoMae} onChange={handleChange} />
                <LabeledInput label="Nome do Pai" name="filiacaoPai" value={data.filiacaoPai} onChange={handleChange} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabeledInput label="Data de Nascimento" name="dataNascimento" value={data.dataNascimento} onChange={handleChange} />
                    <LabeledInput label="RG" name="rg" value={data.rg} onChange={handleChange} />
                </div>
                <LabeledInput label="CPF" name="cpf" value={data.cpf} onChange={handleChange} />
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