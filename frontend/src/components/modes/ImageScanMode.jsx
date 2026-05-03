import React, { useRef, useState } from 'react';
import { Upload, X, ScanSearch } from 'lucide-react';
import { drawBoxes } from '../../utils/drawBoxes';

export default function ImageScanMode({ model, onDetections }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      onDetections([]);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      onDetections([]);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const scanImage = async () => {
    if (!imgRef.current || !canvasRef.current || !model) return;
    setIsScanning(true);
    
    try {
      const img = imgRef.current;
      const predictions = await model.detect(img);
      onDetections(predictions);

      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      drawBoxes(predictions, ctx, canvas.width, canvas.height);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const clearImage = () => {
    setImageSrc(null);
    onDetections([]);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-center gap-4 p-4 border-b border-border bg-surface shrink-0">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors font-mono uppercase text-sm hud-corners"
        >
          <Upload size={18} /> UPLOAD IMAGE
        </button>
        {imageSrc && (
          <>
            <button 
              onClick={scanImage}
              disabled={isScanning}
              className={`flex items-center gap-2 px-6 py-2 border transition-colors font-mono uppercase text-sm hud-corners ${isScanning ? 'border-primary/50 text-primary/50 cursor-not-allowed' : 'border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10'}`}
            >
              {isScanning ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-hex-spin"></div>
              ) : (
                <ScanSearch size={18} />
              )}
              {isScanning ? 'ANALYZING...' : 'RUN SCAN'}
            </button>
            <button 
              onClick={clearImage}
              className="flex items-center gap-2 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors font-mono uppercase text-sm hud-corners"
            >
              <X size={18} /> CLEAR
            </button>
          </>
        )}
      </div>

      <div 
        className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {!imageSrc ? (
          <div className="w-full max-w-lg h-64 border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center text-primary/60 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-primary/5" onClick={() => fileInputRef.current?.click()}>
            <Upload size={48} className="mb-4" />
            <p className="font-mono tracking-widest text-sm uppercase">Drag & Drop Image Here</p>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Uploaded" 
              className="max-w-full max-h-full object-contain"
              onLoad={() => {
                // Resize canvas on load but don't scan automatically
                if (canvasRef.current && imgRef.current) {
                  canvasRef.current.width = imgRef.current.naturalWidth;
                  canvasRef.current.height = imgRef.current.naturalHeight;
                  const ctx = canvasRef.current.getContext('2d');
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
              }}
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-hex-spin shadow-[0_0_15px_#00d4ff]"></div>
                <div className="mt-4 font-mono text-primary font-bold tracking-[0.2em] animate-pulse">ANALYZING</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
