import React from 'react';
import {
  PlayCircle
} from 'lucide-react';

export type ActiveTab = 'live' | 'routes' | 'pollution' | 'simulation' | 'planner' | 'ai';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onStartDemo: () => void;
  isSimulatedActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onStartDemo,
  isSimulatedActive
}) => {
  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'live', label: 'LIVE CITY' },
    { id: 'routes', label: 'SMART ROUTES' },
    { id: 'pollution', label: 'POLLUTION' },
    { id: 'simulation', label: 'SIMULATION', badge: isSimulatedActive ? 'SIM' : undefined },
    { id: 'planner', label: 'PLANNER' },
    { id: 'ai', label: 'FLOW AI' },
  ];

  return (
    <header className="h-12 border-b border-white/10 bg-[#0F1117] px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('live')}
        >
          <div className="w-7 h-7 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter text-white leading-none flex items-center gap-1.5">
              CHENNAI FLOW
              <span className="text-[8px] bg-cyan-500/20 text-cyan-400 font-mono px-1 py-0.2 rounded uppercase">
                v1.0
              </span>
            </h1>
            <p className="text-[9px] text-cyan-500/75 font-mono tracking-widest uppercase mt-0.5">
              AI Mobility & Pollution Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-4 lg:gap-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors relative pb-1 flex items-center gap-1.5 ${
                isActive
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Telemetry & Demo Button */}
      <div className="flex items-center gap-3.5 text-[11px] font-mono">
        <div className="hidden xl:flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-[10px] tracking-wide">SYSTEM OK</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]" />
          <span className="text-[10px] tracking-wide">AI ONLINE</span>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={onStartDemo}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Showcase</span>
          <span className="sm:hidden">Demo</span>
        </button>
      </div>
    </header>
  );
};
