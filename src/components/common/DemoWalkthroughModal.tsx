import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle
} from 'lucide-react';
import { ActiveTab } from '../layout/Header';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      tab: 'live' as ActiveTab,
      title: '1. Chennai Mobility & Pollution Pulse',
      description: 'Review the high-level citywide KPIs: 78.4 Congestion Index, 20.8 km/h average speed, and 4,250 tons of daily CO2 emissions across Chennai MMA.',
      highlightAction: 'Inspecting live citywide mobility indexes & diurnal speed curves.'
    },
    {
      step: 2,
      tab: 'live' as ActiveTab,
      title: '2. Bottleneck Hotspots Inspection',
      description: 'Explore critical congestion chokepoints like OMR (89% congestion), Kathipara Cloverleaf (81%), and Porur Junction (87%), examining queue delays and idling penalties.',
      highlightAction: 'Click any hotspot on the map to see localized delay diagnostics.'
    },
    {
      step: 3,
      tab: 'routes' as ActiveTab,
      title: '3. Smart Multimodal Route Optimizer',
      description: 'Plan an optimized multimodal route between VIT Chennai (Vandalur-Kelambakkam) and Puratchi Thalaivar Dr. MGR Chennai Central.',
      highlightAction: 'Comparing 5 candidate transit modes: Car, Two-Wheeler, Metro+Walk, MTC Bus, and Multimodal EV Auto + Rail.'
    },
    {
      step: 4,
      tab: 'routes' as ActiveTab,
      title: '4. Decision Tradeoff Matrix & Carbon Savings',
      description: 'Analyze how Multimodal Transit delivers the "BEST OVERALL" balance—cutting personal carbon footprint by 84% and saving ₹140 per trip compared to a cab.',
      highlightAction: 'Selecting route candidates renders animated polylines & stops on the GIS map.'
    },
    {
      step: 5,
      tab: 'pollution' as ActiveTab,
      title: '5. Physics-Based Pollution Intelligence',
      description: 'Drill down into COPERT-based vehicular emissions (CO2, NOx, PM2.5, Idling fuel waste) and correlate telemetry with CPCB/TNPCB ground sensors.',
      highlightAction: 'Switch map to Pollution Heatmap View to inspect hazardous emission corridors.'
    },
    {
      step: 6,
      tab: 'simulation' as ActiveTab,
      title: '6. What-If Policy Scenario Sandbox',
      description: 'Simulate the impact of shifting 25% of single-occupancy cars to Chennai Metro & MTC buses with dedicated OMR bus lanes and AI-synchronized traffic signals.',
      highlightAction: 'Notice average city speed surge from 20.8 km/h to 27.4 km/h while preventing ~580 tons of daily CO2.'
    },
    {
      step: 7,
      tab: 'simulation' as ActiveTab,
      title: '7. Dynamic Map Projection',
      description: 'Click "Project to Map" inside the simulator to witness the entire Chennai road network shift in real-time from congested red corridors to free-flowing green paths.',
      highlightAction: 'Real-time BPR delay recalculations reflected on the MapLibre GL engine.'
    },
    {
      step: 8,
      tab: 'planner' as ActiveTab,
      title: '8. CUMTA City Planner Decision Support',
      description: 'Evaluate strategic municipal infrastructure capital investments (OMR BRT, Kathipara Intermodal Hub, Porur EV Auto Feeder radial loops) with Benefit-Cost Ratios.',
      highlightAction: 'Prioritize high-ROI interventions with clear Crores expenditure breakdown.'
    },
    {
      step: 9,
      tab: 'ai' as ActiveTab,
      title: '9. Flow AI Mobility Advisor',
      description: 'Interact with the server-side Gemini 3.7 Flash AI advisor to ask policy questions, query OMR mitigation options, or synthesize multimodal itineraries.',
      highlightAction: 'Generates structured Observation, Recommendation, Impact, Confidence & Data Basis cards.'
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(steps[nextStep].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveTab(steps[prevStep].tab);
    }
  };

  const jumpToStep = (idx: number) => {
    setCurrentStep(idx);
    setActiveTab(steps[idx].tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#0F1117] border border-cyan-500/40 rounded max-w-lg w-full p-5 shadow-2xl space-y-4 text-white relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-wide">CHENNAI FLOW Guided Walkthrough</h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Step {current.step} of {steps.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded bg-black/40 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-9 gap-1">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => jumpToStep(idx)}
              className={`h-1.5 rounded transition-all ${
                idx === currentStep
                  ? 'bg-cyan-400'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-white/10'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-2 py-1">
          <h4 className="text-sm font-bold text-white leading-snug">{current.title}</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">{current.description}</p>

          <div className="bg-black/50 p-2.5 rounded border border-white/5 flex items-center gap-2 text-[11px] text-cyan-300 font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{current.highlightAction}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center gap-1 border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Click Next to auto-navigate
          </span>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 shadow-md shadow-cyan-500/20 transition-colors active:scale-95"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
