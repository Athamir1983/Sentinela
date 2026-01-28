
import React, { useRef, useState, useCallback } from 'react';
import { supabase } from '../supabase';

interface ProfilePhotoCaptureProps {
  rm: string;
  onUploadSuccess: (publicUrl: string) => void;
  onClose: () => void;
}

const ProfilePhotoCapture: React.FC<ProfilePhotoCaptureProps> = ({ rm, onUploadSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
      console.error(err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Criar um quadrado centralizado
    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    const startX = (videoRef.current.videoWidth - size) / 2;
    const startY = (videoRef.current.videoHeight - size) / 2;

    canvasRef.current.width = 400;
    canvasRef.current.height = 400;

    context.drawImage(
      videoRef.current,
      startX, startY, size, size, // Source
      0, 0, 400, 400 // Destination
    );

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setPreview(dataUrl);
    stopCamera();
  };

  const uploadToStorage = async () => {
    if (!preview) return;
    setIsUploading(true);
    
    try {
      // Converter base64 para Blob
      const response = await fetch(preview);
      const blob = await response.blob();
      
      const fileName = `public/avatar_${rm}.jpg`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('student-avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-avatars')
        .getPublicUrl(fileName);

      onUploadSuccess(publicUrl);
      onClose();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#091c47]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1e2e2d] w-full max-w-lg rounded-[40px] shadow-2xl border border-white/10 overflow-hidden animate-scale-in">
        <div className="p-8 text-center border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Capturar Identidade</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">RM: {rm}</p>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          <div className="relative size-64 rounded-3xl bg-black overflow-hidden border-4 border-slate-100 dark:border-white/5 shadow-inner">
            {!preview ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover mirror-mode"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-500/10">
                    <span className="material-symbols-outlined text-4xl mb-2">error</span>
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
              </>
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-4 w-full">
            {!preview ? (
              <>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={capturePhoto}
                  className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Bater Foto
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setPreview(null); startCamera(); }}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Repetir
                </button>
                <button 
                  onClick={uploadToStorage}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                  )}
                  {isUploading ? 'Enviando...' : 'Confirmar e Salvar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoCapture;
