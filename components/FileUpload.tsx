import React, { useCallback, useRef, useState } from 'react';
import { UploadCloudIcon, VideoCameraIcon } from './icons';

interface FileUploadProps {
  onFileChange: (file: File) => void;
  imageUrl: string | null;
  onCameraClick: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imageUrl, onCameraClick }) => {
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
  }, [onFileChange]);
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
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
        {imageUrl ? (
            <img src={imageUrl} alt="Document preview" className="object-contain h-full w-full rounded-lg p-2" />
        ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <UploadCloudIcon className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" onClick={(e) => { e.preventDefault(); triggerFileSelect(); }}>Clique para enviar</span> ou arraste e solte
                </p>
                
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
        )}
            <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files)}
                accept="image/png, image/jpeg, image/webp"
            />
        </label>

        {imageUrl && (
             <div className="mt-4 text-center">
                 <button 
                     type="button" 
                     onClick={triggerFileSelect} 
                     className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                 >
                     Escolher outra imagem
                 </button>
             </div>
        )}
    </div>
  );
};

export default FileUpload;