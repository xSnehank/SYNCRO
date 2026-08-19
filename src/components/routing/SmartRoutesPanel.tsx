import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
  ArrowRightLeft,
  Car,
  Bike,
  Train,
  Bus,
  Zap,
  ChevronDown,
  Crosshair,
  MapPin,
  Search,
  Loader2
} from 'lucide-react';
import { CHENNAI_LANDMARKS } from '../../data/chennaiGeoData';
import { LandmarkNode, RouteOption, OptimizationGoal, GeoCoordinate } from '../../types';
import { planFreeSmartRoutesWithOsrm, searchFreeChennaiPlaces } from '../../lib/routing/freeOsrmRouter';

interface SmartRoutesPanelProps {
  onRouteSelected: (route: RouteOption) => void;
  activeRoute: RouteOption | null;
  userGpsLocation: GeoCoordinate | null;
  onGpsRequested: () => void;
  isGpsActive: boolean;
  onStartNavigation?: (route: RouteOption) => void;
}

export const SmartRoutesPanel: React.FC<SmartRoutesPanelProps> = ({
  onRouteSelected,
  activeRoute,
  userGpsLocation,
  onGpsRequested,
  isGpsActive,
  onStartNavigation
}) => {
  const [originType, setOriginType] = useState<'landmark' | 'gps' | 'custom'>('landmark');
  const [originId, setOriginId] = useState<string>('vit_chennai');
  const [destId, setDestId] = useState<string>('chennai_central');
  const [goal, setGoal] = useState<OptimizationGoal>('BALANCED');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Custom Place Search State (Free Nominatim)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [customDestination, setCustomDestination] = useState<LandmarkNode | null>(null);

  const presets = [
    { label: 'VIT Chennai → Central', from: 'vit_chennai', to: 'chennai_central' },
    { label: 'Siruseri → T. Nagar', from: 'siruseri_sipcot', to: 't_nagar' },
    { label: 'Sholinganallur → Airport', from: 'sholinganallur', to: 'chennai_airport' },
    { label: 'Porur → Guindy', from: 'porur_junction', to: 'guindy_junction' },
  ];

  const goals: { id: OptimizationGoal; label: string; desc: string }[] = [
    { id: 'BALANCED', label: 'Balanced', desc: 'Optimal compromise of time, emissions & cost' },
    { id: 'FASTEST', label: 'Fastest', desc: 'Minimizes commute duration' },
    { id: 'CHEAPEST', label: 'Cheapest', desc: 'Lowest fare in Rupees' },
    { id: 'LOWEST_EMISSIONS', label: 'Lowest CO2', desc: 'Minimum carbon footprint' },
    { id: 'LOWEST_EXPOSURE', label: 'Clean Air', desc: 'Lowest inhaled PM2.5 & NOx' },
  ];

  // Search places via free Nominatim API
  const handleSearchPlaces = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 3) {
      setIsSearching(true);
      const results = await searchFreeChennaiPlaces(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectCustomDest = (place: { name: string; lat: number; lng: number }) => {
    const node: LandmarkNode = {
      id: `custom_${Date.now()}`,
      name: place.name,
      tamilName: place.name,
      category: 'commercial',
      coordinate: { lat: place.lat, lng: place.lng },
      description: `Custom search location: ${place.name}`,
      connectedModes: ['CAR_PETROL', 'TWO_WHEELER', 'AUTO_RICKSHAW', 'WALK']
    };
    setCustomDestination(node);
    setSearchResults([]);
    setSearchQuery(place.name);
  };

  const handleCalculateRoutes = useCallback(async () => {
    setIsCalculating(true);

    let originNode: LandmarkNode;
    if (originType === 'gps' && userGpsLocation) {
      originNode = {
        id: 'user_gps',
        name: 'My GPS Location',
        tamilName: 'என் இடம்',
        category: 'transit_hub',
        coordinate: userGpsLocation,
        description: `Current GPS Coordinates: ${userGpsLocation.lat.toFixed(4)}°N, ${userGpsLocation.lng.toFixed(4)}°E`,
        connectedModes: ['CAR_PETROL', 'TWO_WHEELER', 'AUTO_RICKSHAW', 'WALK', 'MULTIMODAL']
      };
    } else {
      originNode = CHENNAI_LANDMARKS.find((l) => l.id === originId) || CHENNAI_LANDMARKS[0];
    }

    const destinationNode = customDestination || CHENNAI_LANDMARKS.find((l) => l.id === destId) || CHENNAI_LANDMARKS[4];

    try {
      const calculated = await planFreeSmartRoutesWithOsrm(originNode, destinationNode, goal);
      setRoutes(calculated);
      if (calculated.length > 0) {
        const best = calculated.find((r) => r.isRecommended) || calculated[0];
        onRouteSelected(best);
      }
    } catch (e) {
      console.error('Route calculation error:', e);
    } finally {
      setIsCalculating(false);
    }
  }, [originType, originId, destId, goal, userGpsLocation, customDestination, onRouteSelected]);

  useEffect(() => {
    handleCalculateRoutes();
  }, [handleCalculateRoutes]);

  const handleUseGps = () => {
    setOriginType('gps');
    onGpsRequested();
  };

  const handleSwap = () => {
    if (originType === 'landmark' && !customDestination) {
      const temp = originId;
      setOriginId(destId);
      setDestId(temp);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'CAR_PETROL':
        return <Car className="w-3.5 h-3.5 text-rose-400" />;
      case 'TWO_WHEELER':
        return <Bike className="w-3.5 h-3.5 text-orange-400" />;
      case 'CHENNAI_METRO':
        return <Train className="w-3.5 h-3.5 text-sky-400" />;
      case 'MTC_BUS':
        return <Bus className="w-3.5 h-3.5 text-amber-400" />;
      case 'MULTIMODAL':
      default:
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const recommendedRoute = routes.find((r) => r.isRecommended);

  return (
    <div className="h-full overflow-y-auto p-3.5 space-y-3.5 text-slate-300 select-none bg-[#0F1117]">
      {/* Header with 100% Free Engine Status */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Free Multimodal Router</h2>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
              100% FREE (OSRM + OSM)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Real turn-by-turn road geometry, live GPS & Chennai Metro graph
          </p>
        </div>

        {/* GPS Quick Action */}
        <button
          onClick={handleUseGps}
          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all border ${
            originType === 'gps' && isGpsActive
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
              : 'bg-black/40 text-slate-300 border-white/10 hover:text-white hover:border-blue-400'
          }`}
          title="Use GPS Coordinates as Origin"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isGpsActive ? 'animate-spin-slow text-white' : ''}`} />
          <span>{isGpsActive ? 'GPS Locked' : 'Use GPS'}</span>
        </button>
      </div>

      {/* Navigation Input Section */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation Routing</h3>

        {/* Origin */}
        <div className="bg-black/40 border border-white/5 p-2.5 rounded">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] uppercase font-mono text-slate-400 block">Start / Origin</label>
            {originType === 'gps' && userGpsLocation ? (
              <button
                onClick={() => setOriginType('landmark')}
                className="text-[9px] font-mono text-cyan-400 hover:underline"
              >
                Switch to Landmark
              </button>
            ) : (
              <button
                onClick={handleUseGps}
                className="text-[9px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
              >
                <Crosshair className="w-2.5 h-2.5" /> Use Current GPS
              </button>
            )}
          </div>

          {originType === 'gps' && userGpsLocation ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 font-mono py-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
              <span>
                Live GPS ({userGpsLocation.lat.toFixed(4)}°N, {userGpsLocation.lng.toFixed(4)}°E)
              </span>
            </div>
          ) : (
            <div className="relative flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <select
                value={originId}
                onChange={(e) => {
                  setOriginType('landmark');
                  setOriginId(e.target.value);
                }}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {CHENNAI_LANDMARKS.map((landmark) => (
                  <option key={landmark.id} value={landmark.id} className="bg-[#0F1117] text-white">
                    {landmark.name} ({landmark.tamilName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Swap Control */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            disabled={originType === 'gps' || customDestination !== null}
            title="Swap Origin & Destination"
            className="w-6 h-6 rounded bg-black/50 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Destination */}
        <div className="bg-black/40 border border-white/5 p-2.5 rounded">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] uppercase font-mono text-slate-400 block">Destination</label>
            {customDestination && (
              <button
                onClick={() => {
                  setCustomDestination(null);
                  setSearchQuery('');
                }}
                className="text-[9px] font-mono text-cyan-400 hover:underline"
              >
                Reset to Preset
              </button>
            )}
          </div>

          {!customDestination ? (
            <div className="space-y-2">
              <div className="relative flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none appearance-none cursor-pointer pr-4"
                >
                  {CHENNAI_LANDMARKS.map((landmark) => (
                    <option key={landmark.id} value={landmark.id} className="bg-[#0F1117] text-white">
                      {landmark.name} ({landmark.tamilName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 pointer-events-none" />
              </div>

              {/* Free OpenStreetMap Custom Search Input */}
              <div className="relative">
                <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded px-2 py-1">
                  <Search className="w-3 h-3 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchPlaces(e.target.value)}
                    placeholder="Or type any Chennai address/area (Free)..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  {isSearching && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />}
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#14161F] border border-white/20 rounded shadow-2xl z-30 max-h-40 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectCustomDest(result)}
                        className="px-2.5 py-1.5 hover:bg-white/10 cursor-pointer text-xs text-slate-200 border-b border-white/5 flex items-center gap-1.5"
                      >
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{result.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 font-mono py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="truncate">{customDestination.name}</span>
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1 pt-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomDestination(null);
                setSearchQuery('');
                setOriginType('landmark');
                setOriginId(preset.from);
                setDestId(preset.to);
              }}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                originType === 'landmark' && !customDestination && originId === preset.from && destId === preset.to
                  ? 'bg-blue-600 text-white border-blue-400 font-bold'
                  : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Optimize Goal Tabs */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`py-1 text-[10px] font-mono rounded border text-center transition-colors ${
                goal === g.id
                  ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-sm'
                  : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {/* BEST OVERALL Recommendation Card */}
      {recommendedRoute && (
        <section>
          <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Top Recommendation</h3>
          <div className="bg-blue-950/40 border border-blue-500/40 p-3 rounded-lg relative overflow-hidden ring-1 ring-blue-500/50 shadow-xl">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider">
              BEST OVERALL
            </div>

            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                {recommendedRoute.modeLabel}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono mr-24">
                Eco-Choice
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px] my-2 bg-black/40 p-1.5 rounded border border-white/5">
              <div>
                <span className="text-[8px] text-slate-500 block uppercase">Time</span>
                <span className="font-bold text-white">{recommendedRoute.totalTimeMinutes}m</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block uppercase">Cost</span>
                <span className="font-bold text-emerald-400">₹{recommendedRoute.fareRupees}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block uppercase">CO2</span>
                <span className="font-bold text-cyan-400">{recommendedRoute.co2Grams}g</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block uppercase">Saved</span>
                <span className="font-bold text-emerald-300">-{recommendedRoute.carbonSavingsPercentVsCar}%</span>
              </div>
            </div>

            <p className="text-[10px] text-cyan-200/90 italic leading-relaxed mb-2.5">
              "{recommendedRoute.recommendationReason}"
            </p>

            {onStartNavigation && (
              <button
                onClick={() => onStartNavigation(recommendedRoute)}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <Navigation className="w-4 h-4 fill-white" />
                <span>Start Free Navigation (Voice HUD)</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Candidate Route Comparison Cards */}
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Modal Routes ({routes.length})
          </h3>
          {isCalculating ? (
            <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Calculating…
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-400">Click to preview polyline</span>
          )}
        </div>

        <div className="space-y-1.5">
          {routes.map((option) => {
            const isSelected = activeRoute?.id === option.id;
            const isCar = option.mode === 'CAR_PETROL';
            return (
              <div
                key={option.id}
                onClick={() => onRouteSelected(option)}
                className={`p-2.5 rounded cursor-pointer transition-colors border relative ${
                  isSelected
                    ? 'bg-white/10 border-blue-500 shadow-md ring-1 ring-blue-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                    {getModeIcon(option.mode)}
                    {option.modeLabel}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isCar
                        ? 'bg-red-500/20 text-red-400'
                        : option.isRecommended
                        ? 'bg-blue-500/20 text-blue-300 font-bold'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isCar ? 'High Emissions' : option.isRecommended ? 'Recommended' : `${option.distanceKm} km`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px]">TIME</span>
                    <span className="font-bold text-white">{option.totalTimeMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">COST</span>
                    <span className="font-bold text-emerald-400">₹{option.fareRupees}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">CO2</span>
                    <span className={`font-bold ${option.co2Grams < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {option.co2Grams}g
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">EXPOSURE</span>
                    <span className={`font-bold ${option.pollutionExposureIndex < 35 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {option.pollutionExposureIndex}/100
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] space-y-2">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-1">
                        Turn-by-Turn Waypoints:
                      </span>
                      {option.segments.map((seg, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300 font-mono py-0.5">
                          <span className="text-blue-400 font-bold">›</span>
                          <span>{seg.instruction} ({seg.distanceKm}km, {seg.durationMinutes}m)</span>
                        </div>
                      ))}
                    </div>

                    {onStartNavigation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartNavigation(option);
                        }}
                        className="w-full py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-white" />
                        <span>Start Voice Navigation</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
