import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-6 bg-[#07080B] border-t border-white/5 flex items-center justify-between px-4 shrink-0 text-[9px] uppercase tracking-widest text-slate-500 font-mono select-none">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-ping" />
        <span>Coordinates: 13.0827° N, 80.2707° E</span>
      </div>
      <div className="hidden md:block text-slate-600">
        Data: CUMTA GTFS • CPCB Air Sensors • OpenStreetMap • COPERT-5
      </div>
      <div className="text-cyan-500/70">
        Chennai Flow Engine • Active
      </div>
    </footer>
  );
};
