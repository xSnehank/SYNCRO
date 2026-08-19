import React, { useState, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { SimulationParams, SimulationResults } from '../../types';
import { runWhatIfSimulation } from '../../lib/simulation/simulator';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface WhatIfSimulatorProps {
  onApplySimulationToMap: (results: SimulationResults | null) => void;
  isSimulatedOnMap: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  onApplySimulationToMap,
  isSimulatedOnMap
}) => {
  const [params, setParams] = useState<SimulationParams>({
    privateCarUsageDeltaPercent: -20,
    publicTransitAdoptionDeltaPercent: 25,
    metroAdoptionDeltaPercent: 30,
    busAdoptionDeltaPercent: 20,
    evAdoptionDeltaPercent: 35,
    trafficSignalOptimization: true,
    dedicatedBusLanesOMR: true,
    offPeakFreightRestrictions: true
  });

  const [results, setResults] = useState<SimulationResults>(() => runWhatIfSimulation(params));
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runWhatIfSimulation(params);
      setResults(res);
      if (isSimulatedOnMap) {
        onApplySimulationToMap(res);
      }
      setIsRunning(false);
    }, 150);
  };

  const handleReset = () => {
    const defaultParams: SimulationParams = {
      privateCarUsageDeltaPercent: 0,
      publicTransitAdoptionDeltaPercent: 0,
      metroAdoptionDeltaPercent: 0,
      busAdoptionDeltaPercent: 0,
      evAdoptionDeltaPercent: 10,
      trafficSignalOptimization: false,
      dedicatedBusLanesOMR: false,
      offPeakFreightRestrictions: false
    };
    setParams(defaultParams);
    const res = runWhatIfSimulation(defaultParams);
    setResults(res);
    if (isSimulatedOnMap) {
      onApplySimulationToMap(res);
    }
  };

  const loadPreset = (presetName: string) => {
    let p: SimulationParams;
    if (presetName === 'omr_transit') {
      p = {
        privateCarUsageDeltaPercent: -25,
        publicTransitAdoptionDeltaPercent: 35,
        metroAdoptionDeltaPercent: 40,
        busAdoptionDeltaPercent: 30,
        evAdoptionDeltaPercent: 25,
        trafficSignalOptimization: true,
        dedicatedBusLanesOMR: true,
        offPeakFreightRestrictions: true
      };
    } else if (presetName === 'ev_2030') {
      p = {
        privateCarUsageDeltaPercent: -15,
        publicTransitAdoptionDeltaPercent: 20,
        metroAdoptionDeltaPercent: 25,
        busAdoptionDeltaPercent: 20,
        evAdoptionDeltaPercent: 65,
        trafficSignalOptimization: true,
        dedicatedBusLanesOMR: false,
        offPeakFreightRestrictions: true
      };
    } else {
      p = {
        privateCarUsageDeltaPercent: 25,
        publicTransitAdoptionDeltaPercent: -20,
        metroAdoptionDeltaPercent: -15,
        busAdoptionDeltaPercent: -25,
        evAdoptionDeltaPercent: 5,
        trafficSignalOptimization: false,
        dedicatedBusLanesOMR: false,
        offPeakFreightRestrictions: false
      };
    }
    setParams(p);
    const res = runWhatIfSimulation(p);
    setResults(res);
    if (isSimulatedOnMap) {
      onApplySimulationToMap(res);
    }
  };

  const comparisonChartData = useMemo(
    () => [
      { metric: 'Congestion', Baseline: results.cityCongestionIndex.baseline, Simulated: results.cityCongestionIndex.simulated },
      { metric: 'Avg Speed', Baseline: results.averageTravelSpeedKm.baseline, Simulated: results.averageTravelSpeedKm.simulated },
      { metric: 'Delay (m)', Baseline: results.averageCommuteDelayMinutes.baseline, Simulated: results.averageCommuteDelayMinutes.simulated },
      { metric: 'Transit %', Baseline: results.publicTransitSharePercent.baseline, Simulated: results.publicTransitSharePercent.simulated }
    ],
    [results]
  );

  return (
    <div className="h-full overflow-y-auto p-3.5 space-y-3.5 text-slate-300 select-none bg-[#0F1117]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">What-If Transportation Simulator</h2>
            <ProvenanceBadge type="SIMULATED" size="xs" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Test policy interventions, modal shifts, and infrastructure changes
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-1 rounded bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 shadow-md shadow-amber-500/20"
          >
            <Play className="w-3 h-3 fill-black" />
            {isRunning ? 'Running...' : 'Simulate'}
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-1">
        <span className="text-[9px] font-mono text-slate-400 uppercase block">Strategic Presets:</span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => loadPreset('omr_transit')}
            className="p-1.5 rounded text-left bg-black/40 hover:bg-white/10 border border-white/10 text-[10px] font-mono"
          >
            <span className="text-cyan-400 font-bold block">OMR Clean Transit</span>
            <span className="text-slate-400 text-[8px]">-25% cars, BRT</span>
          </button>

          <button
            onClick={() => loadPreset('ev_2030')}
            className="p-1.5 rounded text-left bg-black/40 hover:bg-white/10 border border-white/10 text-[10px] font-mono"
          >
            <span className="text-emerald-400 font-bold block">2030 EV Surge</span>
            <span className="text-slate-400 text-[8px]">65% fleet EV</span>
          </button>

          <button
            onClick={() => loadPreset('gridlock')}
            className="p-1.5 rounded text-left bg-black/40 hover:bg-white/10 border border-white/10 text-[10px] font-mono"
          >
            <span className="text-red-400 font-bold block">Monsoon Gridlock</span>
            <span className="text-slate-400 text-[8px]">+25% cars stress</span>
          </button>
        </div>
      </div>

      {/* Sliders & Variables */}
      <div className="bg-black/30 p-3 rounded border border-white/5 space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulation Variables</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Cars */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-300">Private Car Delta</span>
              <span className={`font-bold ${params.privateCarUsageDeltaPercent < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {params.privateCarUsageDeltaPercent > 0 ? `+${params.privateCarUsageDeltaPercent}` : params.privateCarUsageDeltaPercent}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={params.privateCarUsageDeltaPercent}
              onChange={(e) => setParams({ ...params, privateCarUsageDeltaPercent: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Transit */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-300">Transit Adoption</span>
              <span className={`font-bold ${params.publicTransitAdoptionDeltaPercent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {params.publicTransitAdoptionDeltaPercent > 0 ? `+${params.publicTransitAdoptionDeltaPercent}` : params.publicTransitAdoptionDeltaPercent}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={params.publicTransitAdoptionDeltaPercent}
              onChange={(e) => setParams({ ...params, publicTransitAdoptionDeltaPercent: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* EV */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-300">Fleet Electrification</span>
              <span className="font-bold text-emerald-400">{params.evAdoptionDeltaPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.evAdoptionDeltaPercent}
              onChange={(e) => setParams({ ...params, evAdoptionDeltaPercent: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Metro */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-300">Metro Surge</span>
              <span className="font-bold text-cyan-400">+{params.metroAdoptionDeltaPercent}%</span>
            </div>
            <input
              type="range"
              min="-30"
              max="60"
              step="5"
              value={params.metroAdoptionDeltaPercent}
              onChange={(e) => setParams({ ...params, metroAdoptionDeltaPercent: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-[10px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={params.trafficSignalOptimization}
              onChange={(e) => setParams({ ...params, trafficSignalOptimization: e.target.checked })}
              className="rounded bg-black border-white/20 text-cyan-500 focus:ring-0 w-3 h-3"
            />
            <span>AI Signal Sync</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={params.dedicatedBusLanesOMR}
              onChange={(e) => setParams({ ...params, dedicatedBusLanesOMR: e.target.checked })}
              className="rounded bg-black border-white/20 text-cyan-500 focus:ring-0 w-3 h-3"
            />
            <span>OMR Bus BRT</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={params.offPeakFreightRestrictions}
              onChange={(e) => setParams({ ...params, offPeakFreightRestrictions: e.target.checked })}
              className="rounded bg-black border-white/20 text-cyan-500 focus:ring-0 w-3 h-3"
            />
            <span>Freight Curfew</span>
          </label>
        </div>
      </div>

      {/* Map Sync Banner */}
      <div className="bg-white/5 p-2.5 rounded border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono text-white">Project Outcome on GIS Map</span>
        </div>
        <button
          onClick={() => onApplySimulationToMap(isSimulatedOnMap ? null : results)}
          className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-colors ${
            isSimulatedOnMap ? 'bg-cyan-500 text-black' : 'bg-black/50 text-slate-300 border border-white/10 hover:text-white'
          }`}
        >
          {isSimulatedOnMap ? 'Sync Active' : 'Project to Map'}
        </button>
      </div>

      {/* Before vs After Delta Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono">
          <span className="text-slate-400 block text-[9px]">Congestion</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-slate-400 line-through">{results.cityCongestionIndex.baseline}</span>
            <span className="text-sm font-bold text-cyan-400">{results.cityCongestionIndex.simulated}</span>
          </div>
          <span className="text-[8px] text-emerald-400">{results.cityCongestionIndex.deltaPercent}%</span>
        </div>

        <div className="bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono">
          <span className="text-slate-400 block text-[9px]">Avg Speed</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-slate-400 line-through">{results.averageTravelSpeedKm.baseline}</span>
            <span className="text-sm font-bold text-emerald-400">{results.averageTravelSpeedKm.simulated}kph</span>
          </div>
          <span className="text-[8px] text-emerald-400">+{results.averageTravelSpeedKm.deltaPercent}%</span>
        </div>

        <div className="bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono">
          <span className="text-slate-400 block text-[9px]">Daily CO2</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-slate-400 line-through">{results.dailyTransportCO2Tons.baseline}</span>
            <span className="text-sm font-bold text-emerald-400">{results.dailyTransportCO2Tons.simulated}T</span>
          </div>
          <span className="text-[8px] text-emerald-400">{results.dailyTransportCO2Tons.deltaPercent}%</span>
        </div>

        <div className="bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono">
          <span className="text-slate-400 block text-[9px]">Queue Delay</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-slate-400 line-through">{results.averageCommuteDelayMinutes.baseline}</span>
            <span className="text-sm font-bold text-cyan-400">{results.averageCommuteDelayMinutes.simulated}m</span>
          </div>
          <span className="text-[8px] text-emerald-400">{results.averageCommuteDelayMinutes.deltaPercent}%</span>
        </div>
      </div>

      {/* Baseline vs Simulated Comparison Chart */}
      <div className="bg-black/40 p-2.5 rounded border border-white/5">
        <span className="text-slate-400 block text-[9px] font-mono mb-2">Baseline vs Simulated</span>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={comparisonChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Tooltip
              contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Bar dataKey="Baseline" fill="#64748b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Simulated" fill="#22d3ee" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
