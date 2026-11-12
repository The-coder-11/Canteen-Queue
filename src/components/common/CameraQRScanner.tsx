import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, AlertCircle, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  title?: string;
  description?: string;
  expectedPrefix?: string;
  testOptions?: Array<{ label: string; payload: string }>;
}

export const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan QR Code',
  description = 'Point your camera at the QR code to scan',
  testOptions,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setHasPermission(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasPermission(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setHasPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings or use manual input below.'
          : err.message || 'Unable to access camera.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Scanning Loop with jsQR
  const startScanningLoop = () => {
    const scan = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            setScannedResult(code.data);
            stopCamera();
            onScanSuccess(code.data);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(scan);
    };

    animFrameRef.current = requestAnimationFrame(scan);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
      setManualCode('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  const handleSelectTestOption = (payload: string) => {
    onScanSuccess(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Viewfinder Area */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800">
            {/* Real Video Element */}
            <video ref={videoRef} className="w-full h-full object-cover" muted />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            {hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-orange-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500 -mt-1 -mr-1 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500 -mb-1 -ml-1 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1 rounded-br" />
                </div>
              </div>
            )}

            {/* Error or Fallback Overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 text-white p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Success Overlay */}
            {scannedResult && (
              <div className="absolute inset-0 bg-emerald-950/90 text-white p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <h4 className="font-bold text-base">QR Code Detected!</h4>
                <p className="text-xs text-emerald-200 font-mono mt-1 max-w-xs truncate">{scannedResult}</p>
              </div>
            )}
          </div>

          {/* Test / Demo Quick Scan Shortcuts for rapid evaluation */}
          {testOptions && testOptions.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Fast Evaluation Shortcuts (Simulate QR Scan)
              </span>
              <div className="flex flex-wrap gap-2">
                {testOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTestOption(opt.payload)}
                    className="px-2.5 py-1.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Token / Payload Entry */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Manual Token or Code Entry</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. T001, GRP-1234 or paste QR payload"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
