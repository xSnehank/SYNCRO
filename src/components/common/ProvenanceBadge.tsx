import React from 'react';
import { DataProvenance } from '../../types';
import { ShieldCheck, Cpu, Activity, Sparkles } from 'lucide-react';

interface ProvenanceBadgeProps {
  type: DataProvenance | string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'REAL':
        return {
          shortLabel: 'REAL',
          label: 'REAL DATA',
          tooltip: 'Directly sourced from CPCB sensors, OpenStreetMap, and CUMTA GTFS data.',
          bgColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
        };
      case 'ESTIMATED':
        return {
          shortLabel: 'EST',
          label: 'ESTIMATED MODEL',
          tooltip: 'Calculated using COPERT vehicle emission equations and BPR congestion delay functions.',
          bgColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          icon: <Cpu className="w-2.5 h-2.5 text-cyan-400" />
        };
      case 'SIMULATED':
        return {
          shortLabel: 'SIM',
          label: 'SIMULATED',
          tooltip: 'Projected outcome from What-If transportation and modal shift simulation.',
          bgColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: <Activity className="w-2.5 h-2.5 text-amber-400" />
        };
      case 'DEMO':
      default:
        return {
          shortLabel: 'DEMO',
          label: 'DEMO PRESET',
          tooltip: 'Calibrated Chennai demonstration baseline dataset for hackathon evaluation.',
          bgColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          icon: <Sparkles className="w-2.5 h-2.5 text-purple-400" />
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses =
    size === 'xs'
      ? 'text-[8px] px-1 py-0.5'
      : size === 'sm'
      ? 'text-[9px] px-1.5 py-0.5'
      : 'text-[10px] px-2 py-0.5';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1 font-mono font-bold rounded border tracking-wider uppercase ${config.bgColor} ${sizeClasses} ${className}`}
    >
      {config.icon}
      {showLabel && <span>{size === 'xs' ? config.shortLabel : config.label}</span>}
    </span>
  );
};
