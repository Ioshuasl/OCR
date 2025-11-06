import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import DocumentForm from './components/DocumentForm';
import Spinner from './components/Spinner';
import CameraScanner from './components/CameraScanner';
import { extractDataFromImage } from './services/geminiService';
import type { DocumentData } from './types';
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from './components/icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setError(null);
    setScanComplete(false);
  };
  
  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setExtractedData(null);
    setError(null);
    setScanComplete(false);
    setIsLoading(false);
  };

  const handleScan = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setScanComplete(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          const data = await extractDataFromImage(base64String, imageFile.type);
          setExtractedData(data);
          setScanComplete(true);
        } else {
            throw new Error("Falha ao ler o arquivo de imagem.");
        }
      };
      reader.onerror = () => {
        throw new Error("Erro ao ler o arquivo.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha ao extrair os dados. Por favor, tente outra imagem. Erro: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleDataUpdate = (updatedData: DocumentData) => {
    setExtractedData(updatedData);
  };
  
  const handleSave = () => {
    console.log('Salvando dados:', extractedData);
    alert('Dados salvos com sucesso! (Verifique o console para detalhes)');
    resetState();
  };

  const handleCapture = (blob: Blob) => {
    const fileName = `scan-${Date.now()}.jpeg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    handleFileChange(file);
    setIsCameraOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Orius Scanner
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Envie um documento de identidade para extrair as informações automaticamente.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8">
          {!scanComplete ? (
            <div className="space-y-6">
              <FileUpload 
                onFileChange={handleFileChange} 
                imageUrl={imageUrl} 
                onCameraClick={() => setIsCameraOpen(true)}
              />
              
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5"/>
                  <span>{error}</span>
                </div>
              )}

              {imageFile && (
                <div className="text-center">
                  <button
                    onClick={handleScan}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <CameraIcon className="h-5 w-5" />
                        Analisar Documento
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            extractedData && (
              <div>
                 <div className="flex items-center gap-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
                    <CheckCircleIcon className="h-6 w-6"/>
                    <h2 className="text-xl font-semibold">Extração Concluída</h2>
                 </div>
                <DocumentForm 
                    data={extractedData} 
                    onUpdate={handleDataUpdate} 
                    imageUrl={imageUrl}
                />
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                    <button onClick={resetState} className="px-6 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Analisar Outro
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        Salvar Dados
                    </button>
                </div>
              </div>
            )
          )}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} Orius Scanner. Criado com React & Gemini.</p>
        </footer>
      </div>
      {isCameraOpen && (
        <CameraScanner
          onCapture={handleCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};

export default App;