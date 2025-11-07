import React, { useState, useCallback, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DocumentForm from './components/DocumentForm';
import Spinner from './components/Spinner';
import CameraScanner from './components/CameraScanner';
import { identifyDocumentType, extractDataFromImage } from './services/geminiService';
import type { AllDocumentData } from './types'; 
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from './components/icons'; // Adicione ícones

// --- NOVO TIPO PARA GERENCIAR O LOTE ---
type BatchResult = {
    id: string; // Para key do React
    file: File;
    status: 'pending' | 'processing' | 'success' | 'error';
    data: AllDocumentData | null;
    error?: string;
    // Precisamos guardar o base64 e mimetype para o Q&A
    base64?: string; 
    mimeType?: string;
}

const App: React.FC = () => {
  // --- ESTADO REATORADO PARA LOTE ---
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analisando..."); 
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Limpa o Object URL quando o 'currentResultId' muda
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    };
  }, [currentImageUrl]);


  // --- NOVOS HANDLERS DE LOTE ---

  const handleFileChange = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prevFiles => [...prevFiles, ...newFiles]); // Adiciona aos arquivos existentes
    
    // Converte os novos arquivos para o estado 'BatchResult'
    const newResults: BatchResult[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file: file,
      status: 'pending',
      data: null,
    }));
    setResults(prevResults => [...prevResults, ...newResults]);
    
    // Reseta qualquer análise anterior
    setScanComplete(false);
    setError(null);
    setCurrentResultId(null);
  };
  
  const resetState = () => {
    setFiles([]);
    setResults([]);
    setCurrentResultId(null);
    setError(null);
    setScanComplete(false);
    setIsLoading(false);
    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    setCurrentImageUrl(null);
  };

  // Helper de leitura de arquivo
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(new Error("Erro ao ler o arquivo."));
    });
  };

  // --- LÓGICA DE PROCESSAMENTO EM LOTE ---
  const handleScan = useCallback(async () => {
    if (results.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    const newResults = [...results]; // Cópia para mutar

    // Loop sequencial para processar cada arquivo
    for (let i = 0; i < newResults.length; i++) {
        const item = newResults[i];
        
        // Pula arquivos já processados (se o usuário adicionar mais e re-escanear)
        if (item.status !== 'pending') continue;

        try {
            setLoadingMessage(`Processando ${i + 1}/${newResults.length}: ${item.file.name}`);
            
            // 1. Atualiza o status para 'processing'
            newResults[i] = { ...item, status: 'processing' };
            setResults([...newResults]);

            // 2. Lê o arquivo
            const base64String = await getBase64(item.file);
            const mimeType = item.file.type;
            
            // 3. Identifica o tipo
            const { tipoDocumento } = await identifyDocumentType(base64String, mimeType);
            if (!tipoDocumento || tipoDocumento === 'DESCONHECIDO') {
                throw new Error(`Tipo de documento não reconhecido.`);
            }

            // 4. Extrai os dados
            const data = await extractDataFromImage(base64String, mimeType, tipoDocumento);
            
            // 5. Salva com sucesso (incluindo base64 para o Q&A)
            newResults[i] = { 
                ...newResults[i], 
                status: 'success', 
                data: data,
                base64: base64String, // Salva para o Q&A
                mimeType: mimeType, // Salva para o Q&A
            };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            console.error(err);
            // 6. Salva com erro
            newResults[i] = { 
                ...newResults[i], 
                status: 'error', 
                error: errorMessage 
            };
        }
        
        // Atualiza o estado da lista de resultados a cada iteração
        setResults([...newResults]);
    }

    setIsLoading(false);
    setScanComplete(true); // Move para a tela de resultados
    setLoadingMessage("Analisando..."); // Reseta

  }, [results]); // Depende da lista de 'results'
  
  
  // --- Handlers de Câmera (adaptado para lote) ---
  const handleCapture = (blob: Blob) => {
    const fileName = `scan-${Date.now()}.jpeg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Cria um FileList 'fake' para reutilizar o handler de lote
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    handleFileChange(dataTransfer.files);
    
    setIsCameraOpen(false);
  };

  // --- Handlers da Lista de Resultados ---
  
  const handleViewResult = (resultId: string) => {
    setCurrentResultId(resultId);
    
    // Limpa a URL de imagem antiga
    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    
    // Cria a nova URL de imagem para o DocumentForm
    const result = results.find(r => r.id === resultId);
    if (result && result.file.type.startsWith('image/')) {
        setCurrentImageUrl(URL.createObjectURL(result.file));
    } else {
        setCurrentImageUrl(null);
    }
  };
  
  const handleBackToList = () => {
      setCurrentResultId(null);
      if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
      setCurrentImageUrl(null);
  };
  
  // Atualiza os dados de um item específico na lista
  const handleDataUpdate = (updatedData: AllDocumentData) => {
      if (!currentResultId) return;
      
      setResults(prevResults => prevResults.map(r => 
          r.id === currentResultId ? { ...r, data: updatedData } : r
      ));
  };
  
  const handleSave = () => {
      // O "Salvar" agora pode salvar TODOS os resultados válidos
      const validData = results
          .filter(r => r.status === 'success' && r.data)
          .map(r => r.data);
      
      console.log('Salvando todos os dados válidos:', validData);
      alert(`${validData.length} documento(s) salvos com sucesso! (Verifique o console)`);
      resetState();
  };


  // --- LÓGICA DE RENDERIZAÇÃO ---

  const renderUploadScreen = () => (
    <div className="space-y-6">
      <FileUpload 
        onFileChange={handleFileChange} 
        onCameraClick={() => setIsCameraOpen(true)}
      />
      
      {/* Lista de arquivos pendentes */}
      {results.length > 0 && (
          <div className="space-y-2">
              <h3 className="font-semibold">Arquivos na Fila:</h3>
              <ul className="max-h-48 overflow-y-auto space-y-1 text-sm list-disc list-inside">
                  {results.map(r => (
                      <li key={r.id} className="text-slate-600 dark:text-slate-300">
                        {r.file.name} ({r.status})
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleScan}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isLoading ? (
              <>
                <Spinner />
                {loadingMessage}
              </>
            ) : (
              `Analisar ${results.length} Documento(s)`
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderResultsScreen = () => {
    // Encontra o resultado selecionado para passar ao DocumentForm
    const currentResult = results.find(r => r.id === currentResultId);

    // Se um item foi selecionado, mostra o DocumentForm
    if (currentResult && currentResult.data) {
        return (
            <div>
                <button 
                    onClick={handleBackToList}
                    className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Voltar para a Lista de Resultados
                </button>
                <DocumentForm 
                    data={currentResult.data} 
                    onUpdate={handleDataUpdate} 
                    imageUrl={currentImageUrl}
                    docBase64={currentResult.base64 || null}
                    docMimeType={currentResult.mimeType || null}
                />
            </div>
        );
    }
    
    // Se nenhum item foi selecionado, mostra a lista de resultados
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Resultados do Processamento</h2>
            <div className="space-y-3">
                {results.map(result => (
                    <div key={result.id} className="p-4 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {result.status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                            {result.status === 'error' && <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{result.file.name}</p>
                                <p className="text-sm text-slate-500">
                                    {result.status === 'success' ? `Tipo: ${result.data?.tipoDocumento}` : `Erro: ${result.error}`}
                                </p>
                            </div>
                        </div>
                        {result.status === 'success' && (
                            <button 
                                onClick={() => handleViewResult(result.id)}
                                className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200"
                            >
                                Revisar
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                <button onClick={resetState} className="px-6 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300">
                    Analisar Outros
                </button>
                <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700">
                    Salvar Tudo e Concluir
                </button>
            </div>
        </div>
    );
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Orius Scanner
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Envie múltiplos documentos (ID, Contrato, Ata) para análise em lote.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8">
            {!scanComplete ? renderUploadScreen() : renderResultsScreen()}
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