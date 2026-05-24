import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCw, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
}

export default function CameraCapture({ isOpen, onClose, onCapture, title = 'Take Photo' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this browser');
        toast.error('Camera not supported. Please use file upload instead.');
        return;
      }

      // Stop any existing stream
      stopCamera();

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);

      let errorMessage = 'Could not access camera';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;

    // Convert base64 to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
        onClose();
        toast.success('Photo captured successfully!');
      })
      .catch(err => {
        console.error('Error converting image:', err);
        toast.error('Failed to process photo');
      });
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">{title}</h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden border-4 border-white/10">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Camera size={64} className="text-white/20" />
              <p className="text-white font-bold">{error}</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-accent text-white rounded-full font-bold hover:opacity-90 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  !isCameraReady && "opacity-0"
                )}
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {capturedImage ? (
            <>
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all"
              >
                <RotateCw size={20} />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center gap-2 px-8 py-4 bg-accent hover:opacity-90 text-white rounded-full font-bold transition-all shadow-xl"
              >
                <Check size={24} />
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={switchCamera}
                disabled={!isCameraReady}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30"
              >
                <RotateCw size={20} />
              </button>
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="w-20 h-20 rounded-full bg-accent hover:opacity-90 flex items-center justify-center text-white transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed border-4 border-white/20"
              >
                <Camera size={32} />
              </button>
              <div className="w-12" /> {/* Spacer for symmetry */}
            </>
          )}
        </div>

        {/* Help Text */}
        {!error && !capturedImage && (
          <p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest mt-4">
            {isCameraReady ? 'Click the button to capture' : 'Initializing camera...'}
          </p>
        )}
      </div>
    </div>
  );
}
