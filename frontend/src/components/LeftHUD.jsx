import React from 'react';
import { getHazardSeverity, HAZARD_COLORS } from '../utils/drawBoxes';

export default function LeftHUD({ detections, fps, mode }) {
  // Aggregate stats
  const threatCount = detections.length;
  
  // Get top 5 most detected classes in this frame (simulated session history)
  const classCounts = detections.reduce((acc, curr) => {
    acc[curr.class] = (acc[curr.class] || 0) + 1;
    return acc;
  }, {});
  
  const topClasses = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="hidden xl:flex flex-col w-80 shrink-0 gap-6 h-full overflow-y-auto pr-2">
      {/* Radar Module */}
      <div className="hud-panel p-4 hud-corners flex flex-col items-center justify-center">
        <h3 className="font-mono text-xs text-primary mb-4 self-start tracking-widest">RADAR SWEEP</h3>
        <div className="relative w-48 h-48 rounded-full border border-primary/30 flex items-center justify-center overflow-hidden bg-[#0a1118]">
          {/* Radar background circles */}
          <div className="absolute w-32 h-32 rounded-full border border-primary/20"></div>
          <div className="absolute w-16 h-16 rounded-full border border-primary/20"></div>
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-primary/20"></div>
          <div className="absolute h-full w-[1px] bg-primary/20"></div>
          
          {/* Sweeping gradient */}
          <div className="absolute inset-0 rounded-full animate-radar-sweep"
               style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 212, 255, 0.4) 100%)' }}
          ></div>
          
          {/* Threat dots (randomized around center if threats exist) */}
          {detections.map((det, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,58,58,1)]"
              style={{
                backgroundColor: HAZARD_COLORS[det.class] || HAZARD_COLORS.default,
                top: `${40 + Math.random() * 20}%`,
                left: `${40 + Math.random() * 20}%`
              }}
            />
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-xs font-mono opacity-70">ACTIVE THREATS</div>
          <div className={`text-6xl font-display font-bold ${threatCount > 0 ? 'text-[#ff3a3a] text-shadow-red' : 'text-primary text-shadow-cyan'}`}>
            {threatCount.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* System Status Panel */}
      <div className="hud-panel p-4 hud-corners font-mono text-xs space-y-2">
        <h3 className="text-primary mb-3 tracking-widest border-b border-border pb-2">SYSTEM STATUS</h3>
        <div className="flex justify-between">
          <span className="opacity-60">MODEL</span>
          <span>COCO-SSD (v2)</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-60">BACKEND</span>
          <span>WebGL</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-60">MODE</span>
          <span className="text-primary">{mode.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-60">FPS</span>
          <span className={fps > 20 ? 'text-[#10b981]' : 'text-[#ffb800]'}>{fps}</span>
        </div>
      </div>

      {/* Live Detections List */}
      <div className="hud-panel p-4 hud-corners flex-1 flex flex-col min-h-0">
        <h3 className="text-primary mb-3 font-mono text-xs tracking-widest border-b border-border pb-2 shrink-0">LIVE DETECTIONS</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {detections.length === 0 ? (
            <div className="text-xs font-mono opacity-50 text-center mt-4">NO HAZARDS DETECTED</div>
          ) : (
            detections.map((det, i) => {
              const severity = getHazardSeverity(det.class);
              const color = HAZARD_COLORS[det.class] || HAZARD_COLORS.default;
              return (
                <div key={i} className="flex items-center justify-between text-xs font-mono bg-white/5 p-2 border-l-2" style={{ borderLeftColor: color }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-flicker" style={{ backgroundColor: color }}></span>
                    <span className="uppercase">{det.class}</span>
                  </div>
                  <div className="flex gap-3">
                    <span style={{ color }}>{severity}</span>
                    <span className="opacity-70">{Math.round(det.score * 100)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="hud-panel p-4 hud-corners">
        <h3 className="text-primary mb-3 font-mono text-xs tracking-widest border-b border-border pb-2">SESSION ACTIVITY</h3>
        <div className="space-y-3">
          {topClasses.length === 0 ? (
            <div className="text-xs font-mono opacity-50 text-center">AWAITING DATA...</div>
          ) : (
            topClasses.map(([cls, count], i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-mono mb-1 uppercase">
                  <span>{cls}</span>
                  <span>{count}</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((count / threatCount) * 100, 100)}%`,
                      backgroundColor: HAZARD_COLORS[cls] || HAZARD_COLORS.default
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
