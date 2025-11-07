import React, { useCallback, useRef, useState } from 'react';
import { UploadCloudIcon, VideoCameraIcon } from './icons'; // Supondo que você tenha um FileTextIcon

// Fallback para o ícone (caso não exista em './icons')
const PdfIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 00-1-1H6zM6 9a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H6zm0 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H6zm4-8a1 1 0 00-1 1v1a1 1 0 001 1h4a1 1 0 001-1V6a1 1 0 00-1-1h-4zm0 4a1 1 0 00-1 1v1a1 1 0 001 1h4a1 1 0 001-1v-1a1 1 0 00-1-1h-4zm0 4a1 1 0 00-1 1v1a1 1 0 001 1h4a1 1 0 001-1v-1a1 1 0 00-1-1h-4z" clipRule="evenodd" />
  </svg>
);

interface FileUploadProps {
  onFileChange: (file: File) => void;
  imageUrl: string | null;
  imageFile: File | null; // Adicionado
  onCameraClick: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imageUrl, imageFile, onCameraClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      onFileChange(files[0]);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]); // Dependência atualizada
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const renderContent = () => {
    // 1. Se tem imageUrl, é uma imagem. Mostre-a.
    if (imageUrl) {
      return <img src={imageUrl} alt="Document preview" className="object-contain h-full w-full rounded-lg p-2" />;
    }
    
    // 2. Se não tem imageUrl, mas tem imageFile, é um PDF.
    if (imageFile) {
      return (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <PdfIcon /> {/* Ícone de PDF */}
          <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Arquivo PDF Selecionado:</p>
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 truncate max-w-full">
            {imageFile.name}
          </p>
        </div>
      );
    }

    // 3. Se não tem nenhum, mostre o prompt de upload.
    return (
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <UploadCloudIcon className="w-10 h-10 mb-3 text-slate-400" />
        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => { e.preventDefault(); triggerFileSelect(); }}>Clique para enviar</span> ou arraste e solte
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Imagem (PNG, JPG) ou PDF</p>
        
        <div className="my-2 flex items-center w-full max-w-xs">
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">OU</span>
            <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCameraClick();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-600 rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
        >
          <VideoCameraIcon className="w-5 h-5" />
          Usar Câmera
        </button>
      </div>
    );
  };

  return (
    <div>
        <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
            ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
          {renderContent()}
          <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              // Mime types atualizados
              accept="image/png, image/jpeg, image/webp, application/pdf"
          />
        </label>

        {(imageUrl || imageFile) && ( // Mostra o botão se tiver imagem OU pdf
             <div className="mt-4 text-center">
                 <button 
                     type="button" 
                     onClick={triggerFileSelect} 
                     className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                 >
                     Escolher outro arquivo
                 </button>
             </div>
        )}
    </div>
  );
};

export default FileUpload;