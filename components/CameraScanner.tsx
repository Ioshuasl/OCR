import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon as CaptureIcon, XIcon } from './icons';
import Spinner from './Spinner';

interface CameraScannerProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const enableStream = async () => {
      setIsLoading(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        });
        activeStream = stream;
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('A permissão da câmera foi negada. Por favor, permita o acesso à câmera nas configurações do seu navegador.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('Nenhuma câmera encontrada. Verifique se uma câmera está conectada e ativada.');
            } else {
                setError('Não foi possível acessar a câmera. Verifique as configurações do seu navegador.');
            }
        } else {
             setError('Ocorreu um erro inesperado ao acessar a câmera.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    enableStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.95);
    }
  }, [onCapture]);
  
  const handleLoadedData = () => {
      setIsLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-3xl aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
        {isLoading && <div className="text-white flex flex-col items-center gap-2"><Spinner/><span>Iniciando câmera...</span></div>}
        {error && <p className="text-red-400 p-8 text-center">{error}</p>}
        {!error && (
            <>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    onLoadedData={handleLoadedData}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[85%] h-[85%] border-4 border-dashed border-white/50 rounded-lg" style={{ 'aspectRatio': '85.6 / 53.98' }}></div>
                </div>
            </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-6 flex items-center justify-center w-full max-w-3xl">
        <div className="flex-1 flex justify-end">
            <button
              onClick={handleCapture}
              disabled={!stream || isLoading || !!error}
              className="p-5 rounded-full bg-white text-blue-600 hover:bg-slate-200 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed ring-4 ring-white/30"
              aria-label="Capturar imagem"
            >
              <CaptureIcon className="w-8 h-8" />
            </button>
        </div>
        <div className="flex-1 flex justify-start pl-16">
            <button
              onClick={onClose}
              className="p-4 rounded-full bg-slate-700/50 text-white hover:bg-slate-600 transition-colors"
              aria-label="Fechar câmera"
            >
              <XIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;