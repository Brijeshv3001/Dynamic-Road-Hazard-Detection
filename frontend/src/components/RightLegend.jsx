import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { HAZARD_COLORS } from '../utils/drawBoxes';

const legendData = [
  {
    severity: 'CRITICAL',
    color: '#ff3a3a',
    items: [
      { class: 'person', label: 'PEDESTRIAN', icon: '🚶' },
    ]
  },
  {
    severity: 'HIGH',
    color: '#ff6b35', // roughly high priority colors
    items: [
      { class: 'bicycle', label: 'CYCLIST', icon: '🚲', color: HAZARD_COLORS.bicycle },
      { class: 'motorcycle', label: 'MOTORCYCLE', icon: '🏍️', color: HAZARD_COLORS.motorcycle },
      { class: 'truck', label: 'TRUCK', icon: '🚚', color: HAZARD_COLORS.truck },
      { class: 'bus', label: 'BUS', icon: '🚌', color: HAZARD_COLORS.bus },
      { class: 'stop_sign', label: 'STOP SIGN', icon: '🛑', color: HAZARD_COLORS.stop_sign },
      { class: 'dog', label: 'ANIMAL', icon: '🐕', color: HAZARD_COLORS.dog },
    ]
  },
  {
    severity: 'MEDIUM',
    color: '#ffb800',
    items: [
      { class: 'car', label: 'VEHICLE', icon: '🚗', color: HAZARD_COLORS.car },
      { class: 'backpack', label: 'OBSTACLE', icon: '🎒', color: HAZARD_COLORS.backpack },
    ]
  },
  {
    severity: 'INFO',
    color: '#00d4ff',
    items: [
      { class: 'traffic_light', label: 'TRAFFIC LIGHT', icon: '🚦', color: HAZARD_COLORS.traffic_light },
    ]
  }
];

export default function RightLegend() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-surface border border-border p-2 text-primary hover:bg-primary/10 transition-colors hud-corners"
      >
        <Menu size={20} />
      </button>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-64 shrink-0 hud-panel p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
        <h3 className="font-mono text-xs text-primary tracking-widest">CLASSIFICATION DB</h3>
        <button onClick={() => setIsOpen(false)} className="text-primary hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {legendData.map((group, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-widest" style={{ color: group.color }}>
              <div className="flex-1 h-px" style={{ backgroundColor: group.color, opacity: 0.5 }}></div>
              {group.severity}
              <div className="w-4 h-px" style={{ backgroundColor: group.color, opacity: 0.5 }}></div>
            </div>
            
            <div className="space-y-2">
              {group.items.map((item, j) => (
                <div key={j} className="flex items-center gap-3 text-xs font-mono bg-white/5 p-1.5 rounded-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || group.color }}></div>
                  <span className="opacity-80 text-sm" role="img" aria-label={item.label}>{item.icon}</span>
                  <span className="opacity-90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
