import React, { useState } from 'react';


import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { CHENNAI_ROAD_CORRIDORS, AIR_QUALITY_SENSORS } from '../../data/chennaiGeoData';
import { BASELINE_CITY_METRICS } from '../../lib/simulation/simulator';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const PollutionIntelligencePanel: React.FC = () => {
  const [selectedPollutant, setSelectedPollutant] = useState<'co2' | 'nox' | 'pm25' | 'idle'>('co2');

  const corridorData = CHENNAI_ROAD_CORRIDORS.map((c) => ({
    name: c.name.split(' (')[0].replace('Road / ', '').replace('OMR / ', ''),
    co2: c.emissions.co2KgPerHour,
    nox: Math.round(c.emissions.noxGramsPerHour / 1000),
    pm25: c.emissions.pm25GramsPerHour,
    idle: c.estimatedIdleMinPerKm,
    risk: c.pollutionRisk,
    congestion: c.congestionIndex
  }));

  const fleetBreakdownData = [
    { name: 'Petrol & Diesel Cars', value: 42, color: '#ef4444' },
    { name: 'Commercial Freight', value: 28, color: '#f97316' },
    { name: 'Two-Wheelers', value: 18, color: '#eab308' },
    { name: 'Auto-Rickshaws', value: 8, color: '#06b6d4' },
    { name: 'MTC Buses', value: 4, color: '#22c55e' }
  ];

  return (
    <div className="h-full overflow-y-auto p-3.5 space-y-3.5 text-slate-300 select-none bg-[#0F1117]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Pollution & Emissions Intelligence</h2>
            <ProvenanceBadge type="ESTIMATED" size="xs" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            COPERT-5 vehicle emissions model accounting for speeds and idling
          </p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <p className="text-[9px] font-mono uppercase text-slate-400">Daily Transport CO2</p>
          <p className="text-lg font-mono font-bold text-red-400 mt-0.5">
            {BASELINE_CITY_METRICS.dailyTransportCO2Tons.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">T/day</span>
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Chennai MMA</p>
        </div>

        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <p className="text-[9px] font-mono uppercase text-slate-400">Daily NOx Output</p>
          <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">
            {BASELINE_CITY_METRICS.dailyTransportNOxKg.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Nitrogen Oxides</p>
        </div>

        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <p className="text-[9px] font-mono uppercase text-slate-400">Roadside PM2.5</p>
          <p className="text-lg font-mono font-bold text-pink-400 mt-0.5">
            {BASELINE_CITY_METRICS.dailyTransportPM25Kg.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Particulate</p>
        </div>

        <div className="bg-black/40 p-2.5 rounded border border-white/5">
          <p className="text-[9px] font-mono uppercase text-slate-400">Peak Idle Fuel</p>
          <p className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
            78.0k <span className="text-[9px] font-normal text-slate-400">Liters</span>
          </p>
          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Wasted Daily</p>
        </div>
      </div>

      {/* Corridor Emission Rankings */}
      <section className="bg-black/30 p-3 rounded border border-white/5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Arterial Corridor Emissions Breakdown
            </h3>
            <p className="text-[9px] font-mono text-slate-400">Emissions spike when speeds drop below 20 km/h</p>
          </div>

          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/10">
            {(['co2', 'nox', 'pm25', 'idle'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPollutant(p)}
                className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold transition-colors ${
                  selectedPollutant === p
                    ? 'bg-cyan-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'co2' ? 'CO2' : p === 'nox' ? 'NOx' : p === 'pm25' ? 'PM2.5' : 'Idle'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={corridorData} margin={{ top: 5, right: 5, left: -25, bottom: 15 }}>
              <XAxis dataKey="name" stroke="#475569" fontSize={9} angle={-15} textAnchor="end" interval={0} />
              <YAxis stroke="#475569" fontSize={9} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1117',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey={selectedPollutant} radius={[2, 2, 0, 0]}>
                {corridorData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.risk === 'HAZARDOUS' ? '#ec4899' : entry.risk === 'HIGH' ? '#f97316' : '#22c55e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Fleet Share & Ground Sensors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="bg-black/30 p-3 rounded border border-white/5">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Modal Fleet Emission Share
          </h3>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  innerRadius={25}
                  paddingAngle={2}
                >
                  {fleetBreakdownData.map((entry, idx) => (
                    <Cell key={`pie-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1117',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-1 text-[10px] font-mono mt-1">
            {fleetBreakdownData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real Ground Sensors */}
        <div className="bg-black/30 p-3 rounded border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              CPCB Ground Air Stations
            </h3>
            <ProvenanceBadge type="REAL" size="xs" />
          </div>

          <div className="space-y-1">
            {AIR_QUALITY_SENSORS.slice(0, 4).map((sensor) => (
              <div key={sensor.id} className="bg-white/5 p-1.5 rounded flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-bold text-white block">{sensor.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    PM2.5: {sensor.pm25} • NOx: {sensor.nox}
                  </span>
                </div>
                <span
                  className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] ${
                    sensor.aqi > 150 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {sensor.aqi} AQI
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
