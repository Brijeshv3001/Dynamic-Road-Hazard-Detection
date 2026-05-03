import React, { useRef, useState, useEffect } from 'react';
import { Camera, Play, Square, Pause } from 'lucide-react';
import { drawBoxes } from '../../utils/drawBoxes';

export default function LiveFeedMode({ model, onDetections, onFpsUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(performance.now());
  
  // Setup Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
    setIsDetecting(false);
    onDetections([]);
    onFpsUpdate(0);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Detection Loop
  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !model || !isDetecting) return;
    
    // Check if video has metadata
    if (videoRef.current.readyState < 2) {
      requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      const predictions = await model.detect(videoRef.current);
      onDetections(predictions);

      // FPS calculation
      const now = performance.now();
      const dt = now - lastFrameTime;
      if (dt > 0) {
        onFpsUpdate(Math.round(1000 / dt));
      }
      setLastFrameTime(now);

      // Match canvas to video actual size
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      drawBoxes(predictions, ctx, canvas.width, canvas.height);

      if (isDetecting) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  useEffect(() => {
    if (isDetecting) {
      requestRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      onFpsUpdate(0);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDetecting, model]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-center gap-4 p-4 border-b border-border bg-surface shrink-0">
        {!isCameraActive ? (
          <button 
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors font-mono uppercase text-sm hud-corners"
          >
            <Camera size={18} /> ACTIVATE CAMERA
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsDetecting(!isDetecting)}
              className={`flex items-center gap-2 px-6 py-2 border transition-colors font-mono uppercase text-sm hud-corners ${isDetecting ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-primary text-primary hover:bg-primary/10'}`}
            >
              {isDetecting ? <Pause size={18} /> : <Play size={18} />}
              {isDetecting ? 'PAUSE DETECTION' : 'START DETECTION'}
            </button>
            <button 
              onClick={stopCamera}
              className="flex items-center gap-2 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors font-mono uppercase text-sm hud-corners"
            >
              <Square size={18} /> STOP
            </button>
          </>
        )}
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse-ring"></div>
              <Camera size={32} className="text-primary opacity-50" />
            </div>
            <p className="text-primary font-mono tracking-widest text-sm animate-pulse">CAMERA STANDBY</p>
          </div>
        )}

        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="absolute max-w-full max-h-full w-auto h-auto object-contain"
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        
        {/* Scanning line animation */}
        {isDetecting && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line shadow-[0_0_10px_#00d4ff]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
