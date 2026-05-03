import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Square } from 'lucide-react';
import { drawBoxes } from '../../utils/drawBoxes';

export default function VideoScanMode({ model, onDetections, onFpsUpdate }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(performance.now());
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const requestRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      stopVideo();
    }
  };

  const stopVideo = () => {
    setIsPlaying(false);
    onDetections([]);
    onFpsUpdate(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !model || !isPlaying) return;
    
    if (videoRef.current.readyState < 2 || videoRef.current.paused || videoRef.current.ended) {
      if (videoRef.current.ended) {
        setIsPlaying(false);
        onFpsUpdate(0);
        return;
      }
      requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      const predictions = await model.detect(videoRef.current);
      onDetections(predictions);

      const now = performance.now();
      const dt = now - lastFrameTime;
      if (dt > 0) onFpsUpdate(Math.round(1000 / dt));
      setLastFrameTime(now);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      drawBoxes(predictions, ctx, canvas.width, canvas.height);

      if (isPlaying) {
        requestRef.current = requestAnimationFrame(detectFrame);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      onFpsUpdate(0);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, model]);

  const clearVideo = () => {
    stopVideo();
    setVideoSrc(null);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-center gap-4 p-4 border-b border-border bg-surface shrink-0">
        <input 
          type="file" 
          accept="video/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleVideoUpload} 
        />
        {!videoSrc ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-2 border border-primary text-primary hover:bg-primary/10 transition-colors font-mono uppercase text-sm hud-corners"
          >
            <Upload size={18} /> UPLOAD VIDEO
          </button>
        ) : (
          <>
            <button 
              onClick={togglePlay}
              className={`flex items-center gap-2 px-6 py-2 border transition-colors font-mono uppercase text-sm hud-corners ${isPlaying ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-primary text-primary hover:bg-primary/10'}`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'PAUSE SCAN' : 'PLAY & SCAN'}
            </button>
            <button 
              onClick={clearVideo}
              className="flex items-center gap-2 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors font-mono uppercase text-sm hud-corners"
            >
              <Square size={18} /> CLEAR
            </button>
          </>
        )}
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden">
        {!videoSrc ? (
          <div className="w-full max-w-lg h-64 border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center text-primary/60 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-primary/5" onClick={() => fileInputRef.current?.click()}>
            <Upload size={48} className="mb-4" />
            <p className="font-mono tracking-widest text-sm uppercase">Select Video File</p>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <video 
              ref={videoRef}
              src={videoSrc} 
              className="max-w-full max-h-full object-contain"
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={!isPlaying} // Only show controls when paused so user can seek
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
            />
            {isPlaying && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line shadow-[0_0_10px_#00d4ff]"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
