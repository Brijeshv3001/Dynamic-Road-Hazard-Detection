import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootMessages = [
  "INITIALIZING SENTINEL CORE...",
  "ESTABLISHING SECURE CONNECTION...",
  "LOADING TENSORFLOW.JS FRAMEWORK...",
  "INITIALIZING COCO-SSD MOBILENET_V2...",
  "CALIBRATING HAZARD CLASSIFIERS...",
  "SYNCING SENSORS...",
  "ALL SYSTEMS NOMINAL."
];

export default function BootSequence({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let msgIndex = 0;
    
    const messageInterval = setInterval(() => {
      if (msgIndex < bootMessages.length) {
        setMessages(prev => [...prev, bootMessages[msgIndex]]);
        msgIndex++;
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] font-mono text-primary"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
      >
        <div className="w-full max-w-2xl px-6">
          <div className="mb-8 text-center">
            <h1 className="font-display text-5xl font-bold tracking-widest text-shadow-cyan mb-2">SENTINEL</h1>
            <p className="text-sm tracking-[0.3em] opacity-80">ROAD HAZARD DETECTION AI</p>
          </div>
          
          <div className="hud-panel p-6 hud-corners mb-8 min-h-[250px] flex flex-col justify-end">
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm md:text-base flex items-center gap-3"
                >
                  <span className="opacity-50">&gt;</span> {msg}
                </motion.div>
              ))}
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-3 h-5 bg-primary mt-2"
              />
            </div>
          </div>

          <div className="w-full h-2 bg-border relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-200 ease-out hud-glow-cyan"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs opacity-70">
            SYSTEM BOOT: {Math.min(progress, 100)}%
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
