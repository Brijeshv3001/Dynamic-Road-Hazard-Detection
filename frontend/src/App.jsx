import React, { useState, useEffect } from 'react';
import { useCocoSsd } from './hooks/useCocoSsd';
import BootSequence from './components/BootSequence';
import LeftHUD from './components/LeftHUD';
import RightLegend from './components/RightLegend';
import MainScanner from './components/MainScanner';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [mode, setMode] = useState('live'); // live, image, video
  const { model, isModelLoading, error } = useCocoSsd();
  
  const [detections, setDetections] = useState([]);
  const [fps, setFps] = useState(0);

  // Check if a person is currently detected
  const isPersonDetected = detections.some(d => d.class === 'person');

  // Ensure boot sequence waits for model to load too, or just use minimum boot time
  useEffect(() => {
    // If we want to strictly wait for the model, we could tie isBooting to isModelLoading.
    // For cinematic effect, BootSequence handles its own minimum duration.
  }, [isModelLoading]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] text-red-500 font-mono flex items-center justify-center p-4">
        <div className="hud-panel p-6 border-red-500 max-w-lg text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">SYSTEM FAILURE</h2>
          <p>Failed to initialize TensorFlow.js backend or COCO-SSD model.</p>
          <p className="text-xs mt-4 opacity-70">{error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-[#a0aec0] font-body overflow-hidden selection:bg-primary/30 flex flex-col">
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 animate-grid-move pointer-events-none z-0"></div>

      {isBooting ? (
        <BootSequence onComplete={() => setIsBooting(false)} />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col h-screen overflow-hidden"
        >
          {/* Header */}
          <header className="shrink-0 h-16 border-b border-border bg-[#0d0d14]/80 backdrop-blur-sm flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-primary" size={24} />
              <h1 className="font-display font-bold text-2xl tracking-widest text-primary text-shadow-cyan">SENTINEL</h1>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px]">
                <div className={`w-2 h-2 rounded-full ${isPersonDetected ? 'bg-[#ff3a3a] animate-flicker' : 'bg-primary animate-flicker'}`}></div>
                <span className={isPersonDetected ? 'text-[#ff3a3a]' : 'text-primary'}>
                  {isPersonDetected ? 'CRITICAL ALERT' : 'SYSTEM NOMINAL'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="text-right hidden md:block">
                <div className="text-primary tracking-widest">COCO-SSD MOBILE_NET_V2</div>
                <div className="opacity-50">DETECTIONS: {detections.length}</div>
              </div>
            </div>
          </header>

          {/* Alert Banner */}
          <AnimatePresence>
            {isPersonDetected && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 bg-red-500/20 border-b border-red-500 text-red-500 font-mono font-bold tracking-[0.2em] text-center py-2 animate-alert-pulse overflow-hidden flex items-center justify-center gap-3 z-20"
              >
                <AlertTriangle size={18} />
                ⚠ CRITICAL — PEDESTRIAN DETECTED IN ROAD ZONE
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Layout Grid */}
          <main className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden relative z-10">
            <LeftHUD detections={detections} fps={fps} mode={mode} />
            <MainScanner 
              mode={mode} 
              setMode={setMode} 
              model={model} 
              onDetections={setDetections} 
              onFpsUpdate={setFps} 
            />
            <RightLegend />
          </main>

          {/* Footer */}
          <footer className="shrink-0 h-8 border-t border-border bg-[#0d0d14] flex items-center justify-between px-6 font-mono text-[10px] text-gray-500 z-20">
            <div>SENTINEL v2.0 — Powered by TensorFlow.js</div>
            <div>COCO-SSD • 80 object classes</div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}

export default App;
