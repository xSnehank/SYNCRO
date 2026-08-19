import React from 'react';
import {
  Gauge,
  Zap,
  TrendingDown,
  Clock,
  Car,
  Flame,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { CHENNAI_HOTSPOTS } from '../../data/chennaiGeoData';
import { BASELINE_CITY_METRICS } from '../../lib/simulation/simulator';
import { HotspotArea } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface LiveCityDashboardProps {
  onSelectHotspot: (hotspot: HotspotArea) => void;
  onNavigateToRoutes: () => void;
  onNavigateToSimulation: () => void;
  onNavigateToAi: () => void;
}

export const LiveCityDashboard: React.FC<LiveCityDashboardProps> = ({
  onSelectHotspot,
  onNavigateToRoutes,
  onNavigateToSimulation,
  onNavigateToAi
}) => {
  const chartData = [
    { hour: '06:00', speed: 38, congestion: 35 },
    { hour: '08:00', speed: 15, congestion: 88 },
    { hour: '10:00', speed: 18, congestion: 79 },
    { hour: '12:00', speed: 26, congestion: 58 },
    { hour: '14:00', speed: 32, congestion: 48 },
    { hour: '16:00', speed: 22, congestion: 69 },
    { hour: '18:00', speed: 13, congestion: 94 },
    { hour: '20:00', speed: 20, congestion: 74 },
    { hour: '22:00', speed: 35, congestion: 40 },
  ];

  return (
    <div className="h-full overflow-y-auto p-3.5 space-y-3.5 text-slate-300 select-none bg-[#0F1117]">
      {/* Top Banner & Quick Context */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Chennai Mobility & Emissions Pulse</h2>
            <ProvenanceBadge type="ESTIMATED" size="xs" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Real-time multi-sensor telemetry across Chennai MMA
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNavigateToRoutes}
            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 transition-colors"
          >
            <Car className="w-3 h-3" />
            Route
          </button>
          <button
            onClick={onNavigateToSimulation}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Sim
          </button>
        </div>
      </div>

      {/* Environmental KPIs Grid (High Density 4-tile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* City Congestion */}
        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <div className="flex justify-between items-center text-slate-400">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Congestion</p>
            <Gauge className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-xl font-mono font-bold text-red-400 mt-0.5">
            {BASELINE_CITY_METRICS.cityCongestionIndex} <span className="text-[10px] font-normal text-slate-400">/100</span>
          </p>
          <p className="text-[8px] font-mono text-red-400 mt-1 uppercase">
            Severe Peak Surcharge
          </p>
        </div>

        {/* Avg Speed */}
        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <div className="flex justify-between items-center text-slate-400">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Avg Speed</p>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-0.5">
            {BASELINE_CITY_METRICS.averageTravelSpeedKm} <span className="text-[10px] font-normal text-slate-400">km/h</span>
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-1 uppercase">
            -42% vs Free-Flow
          </p>
        </div>

        {/* CO2 Tonnes */}
        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <div className="flex justify-between items-center text-slate-400">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">CO2 Output</p>
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
            4.25k <span className="text-[10px] font-normal text-slate-400">T/day</span>
          </p>
          <p className="text-[8px] font-mono text-emerald-400/80 mt-1 uppercase">
            44% from Idling
          </p>
        </div>

        {/* Transit Split */}
        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <div className="flex justify-between items-center text-slate-400">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Transit Split</p>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
            {BASELINE_CITY_METRICS.publicTransitSharePercent}%
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-1 uppercase">
            Target: 55%
          </p>
        </div>
      </div>

      {/* Critical Hotspots List with Status Border Bars */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Critical Hotspots & Bottlenecks
          </h3>
          <span className="text-[9px] font-mono text-slate-400">Click to focus map</span>
        </div>

        <div className="space-y-1.5">
          {CHENNAI_HOTSPOTS.map((hotspot) => {
            const isSevere = hotspot.congestionLevel === 'SEVERE';
            return (
              <div
                key={hotspot.id}
                onClick={() => onSelectHotspot(hotspot)}
                className={`flex items-center justify-between bg-white/5 hover:bg-white/10 p-2 rounded cursor-pointer transition-colors border-l-2 ${
                  isSevere ? 'border-red-500' : 'border-amber-500'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-white leading-none flex items-center gap-1.5">
                    {hotspot.name}
                  </p>
                  <p className={`text-[9px] font-mono mt-1 ${isSevere ? 'text-red-400' : 'text-amber-400'}`}>
                    {isSevere ? 'CRITICAL CONGESTION' : 'MODERATE BOTTLENECK'} • +{hotspot.peakDelayMinutes}m delay
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">{hotspot.congestionScore}%</p>
                  <span className={`text-[8px] font-mono px-1 rounded uppercase ${
                    isSevere ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isSevere ? 'Real' : 'Est'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 24-Hour Diurnal Curve Chart */}
      <div className="bg-black/30 p-3 rounded border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            24h Diurnal Speed vs Congestion
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Congestion
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Speed
            </span>
          </div>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="hdCongGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hdSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#475569" fontSize={9} tickLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1117',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#f8fafc'
                }}
              />
              <Area type="monotone" dataKey="congestion" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#hdCongGrad)" name="Congestion Index" />
              <Area type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#hdSpeedGrad)" name="Avg Speed (km/h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Flow AI Advisor Snippet */}
      <section
        onClick={onNavigateToAi}
        className="bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded cursor-pointer hover:border-cyan-400/60 transition-colors"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]" />
            <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Flow AI Mobility Advisor</h4>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-0.5">
            Open <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <p className="text-[11px] text-cyan-100/90 leading-relaxed italic">
          "Metro usage on OMR is projected to reduce PM2.5 by 18.4% in next 2 hours. Recommend Multimodal route for peak commuters."
        </p>
      </section>

      {/* System Live Feed Ticker */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold uppercase text-slate-400 tracking-wider">Chennai Live Dispatch</span>
          <span className="font-mono text-cyan-400">LIVE FEED</span>
        </div>
        <div className="mt-1.5 p-2 bg-black/50 border border-white/5 rounded font-mono text-[9px] text-slate-400 leading-relaxed">
          [SYSTEM] Traffic spike detected on Mount Road near Gemini Flyover. Flow AI rerouting 12% of transit load to Blue Line Metro. Simulated delay offset: -14 min.
        </div>
      </div>
    </div>
  );
};
