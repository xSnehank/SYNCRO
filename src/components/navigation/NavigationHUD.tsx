import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { RouteOption, RouteSegmentDetail } from '../../types';
import { speakManeuver, stopVoiceSpeech, getManeuverSpeechPrompt } from '../../lib/navigation/voiceAssistant';

interface NavigationHUDProps {
  route: RouteOption;
  currentStepIndex: number;
  onStepChange: (index: number | ((prev: number) => number)) => void;
  onClose: () => void;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  route,
  currentStepIndex,
  onStepChange,
  onClose
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en-IN' | 'ta-IN'>('en-IN');
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(36);

  const segments = useMemo(() => route.segments || [], [route.segments]);
  const currentSegment: RouteSegmentDetail | undefined = segments[currentStepIndex] || segments[0];
  const nextSegment: RouteSegmentDetail | undefined = segments[currentStepIndex + 1];

  // Calculate ETA
  const arrivalDate = new Date(Date.now() + route.totalTimeMinutes * 60 * 1000);
  const etaString = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Play voice maneuver when step changes
  useEffect(() => {
    if (!currentSegment) return;

    if (!isMuted) {
      const isFirst = currentStepIndex === 0;
      const isLast = currentStepIndex === segments.length - 1;
      const prompt = getManeuverSpeechPrompt(
        currentSegment.instruction,
        currentSegment.distanceKm,
        currentSegment.mode,
        isFirst,
        isLast
      );

      speakManeuver(
        prompt,
        { language },
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }

    return () => {
      stopVoiceSpeech();
    };
  }, [currentStepIndex, isMuted, language, currentSegment, segments.length]);

  // Auto-drive simulation timer
  useEffect(() => {
    if (!isAutoSimulating || segments.length <= 1) return;

    const interval = setInterval(() => {
      onStepChange((prev) => {
        if (prev < segments.length - 1) {
          // Add subtle speed variance
          setCurrentSpeed(Math.floor(28 + Math.random() * 22));
          return prev + 1;
        } else {
          setIsAutoSimulating(false);
          return prev;
        }
      });
    }, 7000); // Progress to next waypoint every 7s

    return () => clearInterval(interval);
  }, [isAutoSimulating, segments.length, onStepChange]);

  const handleReplayVoice = () => {
    if (!currentSegment) return;
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === segments.length - 1;
    const prompt = getManeuverSpeechPrompt(
      currentSegment.instruction,
      currentSegment.distanceKm,
      currentSegment.mode,
      isFirst,
      isLast
    );

    speakManeuver(
      prompt,
      { language },
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const getManeuverIcon = (instruction: string) => {
    const text = instruction.toLowerCase();
    if (text.includes('left')) return <CornerUpLeft className="w-8 h-8 text-white stroke-[2.5]" />;
    if (text.includes('right')) return <CornerUpRight className="w-8 h-8 text-white stroke-[2.5]" />;
    if (text.includes('u-turn')) return <RotateCcw className="w-8 h-8 text-white stroke-[2.5]" />;
    if (text.includes('roundabout')) return <RefreshCw className="w-8 h-8 text-white stroke-[2.5]" />;
    if (text.includes('arrive') || text.includes('destination')) return <CheckCircle className="w-8 h-8 text-emerald-300 stroke-[2.5]" />;
    return <ArrowUp className="w-8 h-8 text-white stroke-[2.5]" />;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 select-none">
      {/* TOP NAVIGATION BANNER (Google Maps Style Green/Navy HUD) */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto shadow-2xl animate-fadeIn">
        <div className="bg-[#1b5e20] text-white rounded-2xl p-4 border border-emerald-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Maneuver Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-black/20 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                {currentSegment ? getManeuverIcon(currentSegment.instruction) : <ArrowUp className="w-8 h-8" />}
              </div>

              <div>
                <div className="text-sm font-mono text-emerald-200 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span>
                    In {currentSegment ? (currentSegment.distanceKm < 1 ? `${Math.round(currentSegment.distanceKm * 1000)} m` : `${currentSegment.distanceKm} km`) : '350 m'}
                  </span>
                  <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-white font-mono">
                    Step {currentStepIndex + 1}/{segments.length}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug mt-0.5">
                  {currentSegment ? currentSegment.instruction : 'Follow route ahead'}
                </h3>
              </div>
            </div>

            {/* Close / End Route Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors shrink-0"
              title="Exit Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Next Turn Preview */}
          {nextSegment && (
            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100 font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] uppercase text-emerald-300 font-bold">Then:</span>
                <span className="truncate">{nextSegment.instruction}</span>
              </div>
              <span className="shrink-0 text-emerald-300 font-bold">
                {nextSegment.distanceKm < 1 ? `${Math.round(nextSegment.distanceKm * 1000)}m` : `${nextSegment.distanceKm}km`}
              </span>
            </div>
          )}
        </div>

        {/* Voice Assistant Speech Pill */}
        <div className="mt-2 flex items-center justify-between bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-full border border-slate-300 shadow-xl text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-blue-600'}`} />
            <span className="font-bold text-slate-800 text-[11px]">
              {isSpeaking ? 'Assistant Speaking...' : 'Voice Assistant Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en-IN' ? 'ta-IN' : 'en-IN')}
              className="text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300"
              title="Toggle Voice Language"
            >
              {language === 'en-IN' ? 'EN (India)' : 'தமிழ் (Tamil)'}
            </button>

            {/* Repeat Audio */}
            <button
              onClick={handleReplayVoice}
              disabled={isMuted}
              className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
              title="Repeat Voice Instruction"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Mute Button */}
            <button
              onClick={() => {
                if (!isMuted) stopVoiceSpeech();
                setIsMuted(!isMuted);
              }}
              className={`p-1 rounded transition-colors ${
                isMuted ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:text-blue-600'
              }`}
              title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROL & SPEEDOMETER DOCK */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto animate-fadeIn">
        <div className="bg-white/95 text-slate-900 border border-slate-300 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            {/* Primary Travel Metric Stats */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {route.totalTimeMinutes} <span className="text-sm font-sans font-bold">min</span>
                </span>
                <span className="text-sm font-mono text-slate-500 font-bold">
                  ({route.distanceKm} km)
                </span>
              </div>
              <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5 mt-0.5">
                <span>ETA: <strong className="text-slate-900 font-bold">{etaString}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">₹{route.fareRupees}</span>
                <span>•</span>
                <span className="text-blue-700 font-bold">-{route.carbonSavingsPercentVsCar}% CO2</span>
              </div>
            </div>

            {/* Speedometer Gauge */}
            <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl text-center shadow-inner">
              <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Speed</span>
              <span className="text-lg font-black font-mono text-slate-900">{currentSpeed}</span>
              <span className="text-[9px] font-mono text-slate-500 block">km/h</span>
            </div>
          </div>

          {/* Maneuver Step Controls */}
          <div className="flex items-center justify-between pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-300 flex items-center gap-1 text-slate-700 font-mono font-bold"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => onStepChange(Math.min(segments.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex >= segments.length - 1}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-300 flex items-center gap-1 text-slate-700 font-mono font-bold"
              >
                <span>Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto Simulation Toggle */}
            <button
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 border transition-all ${
                isAutoSimulating
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {isAutoSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoSimulating ? 'Simulating Drive' : 'Resume Auto'}</span>
            </button>

            {/* Exit Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-mono font-bold border border-red-200"
            >
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
