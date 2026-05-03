import React from 'react';
import LiveFeedMode from './modes/LiveFeedMode';
import ImageScanMode from './modes/ImageScanMode';
import VideoScanMode from './modes/VideoScanMode';
import { Video, Image as ImageIcon, Camera } from 'lucide-react';

export default function MainScanner({ mode, setMode, model, onDetections, onFpsUpdate }) {
  const tabs = [
    { id: 'live', label: 'LIVE FEED', icon: Camera },
    { id: 'image', label: 'IMAGE SCAN', icon: ImageIcon },
    { id: 'video', label: 'VIDEO SCAN', icon: Video },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 hud-panel hud-corners">
      {/* Tab Switcher */}
      <div className="flex border-b border-border bg-surface shrink-0 p-2 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-mono text-sm tracking-widest transition-all duration-300 hud-corners ${
              mode === tab.id 
                ? 'bg-primary/10 text-primary border border-primary hud-glow-cyan' 
                : 'bg-transparent text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a10]">
        {mode === 'live' && (
          <LiveFeedMode model={model} onDetections={onDetections} onFpsUpdate={onFpsUpdate} />
        )}
        {mode === 'image' && (
          <ImageScanMode model={model} onDetections={onDetections} />
        )}
        {mode === 'video' && (
          <VideoScanMode model={model} onDetections={onDetections} onFpsUpdate={onFpsUpdate} />
        )}
      </div>
    </div>
  );
}
