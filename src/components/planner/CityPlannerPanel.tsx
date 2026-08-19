import React, { useState } from 'react';


import { CHENNAI_PLANNER_POLICIES } from '../../data/plannerPolicies';
import { CityPlannerPolicy } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export const CityPlannerPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<CityPlannerPolicy | null>(CHENNAI_PLANNER_POLICIES[0]);

  const categories = [
    { id: 'ALL', label: 'All Interventions' },
    { id: 'Transit Expansion', label: 'Transit Expansion' },
    { id: 'Signal Intelligence', label: 'Signal Intelligence' },
    { id: 'Fleet Electrification', label: 'Fleet Clean' },
    { id: 'Congestion Pricing', label: 'Congestion Pricing' },
  ];

  const filtered = selectedCategory === 'ALL'
    ? CHENNAI_PLANNER_POLICIES
    : CHENNAI_PLANNER_POLICIES.filter((p) => p.category === selectedCategory);

  return (
    <div className="h-full overflow-y-auto p-3.5 space-y-3.5 text-slate-300 select-none bg-[#0F1117]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">CUMTA City Planner Decision Matrix</h2>
            <ProvenanceBadge type="ESTIMATED" size="xs" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Cost-Benefit Ratio (BCR) and emissions ROI for urban transit policy
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
              selectedCategory === c.id
                ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                : 'bg-black/40 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Policy Interventions List */}
      <div className="space-y-2">
        {filtered.map((policy) => {
          const isSelected = selectedPolicy?.id === policy.id;
          return (
            <div
              key={policy.id}
              onClick={() => setSelectedPolicy(policy)}
              className={`p-2.5 rounded cursor-pointer transition-colors border ${
                isSelected
                  ? 'bg-white/10 border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <h4 className="text-xs font-bold text-white">{policy.title}</h4>
                  <span className="text-[9px] font-mono text-cyan-400">{policy.targetCorridor}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    BCR {policy.benefitCostRatio}:1
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-400 bg-black/40 p-1.5 rounded border border-white/5 my-1.5">
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">CAPEX</span>
                  <span className="text-white font-bold">₹{policy.estimatedCostCrores} Cr</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">CO2 Cut</span>
                  <span className="text-emerald-400 font-bold">-{policy.projectedEmissionsReductionPercent}%</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">Delay Cut</span>
                  <span className="text-cyan-400 font-bold">-{policy.projectedCongestionReductionPercent}%</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase">Timeline</span>
                  <span className="text-amber-400 font-bold">{policy.implementationTimeMonths}m</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
                {policy.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
