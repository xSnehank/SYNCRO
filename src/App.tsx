import { useState, lazy, Suspense } from 'react';
import { Header, ActiveTab } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { hasValidGoogleMapsKey } from './lib/map/googleMapsKey';
import { LiveCityDashboard } from './components/dashboard/LiveCityDashboard';
import { PollutionIntelligencePanel } from './components/pollution/PollutionIntelligencePanel';
import { CityPlannerPanel } from './components/planner/CityPlannerPanel';
import { FlowAiAdvisor } from './components/ai/FlowAiAdvisor';
import { DemoWalkthroughModal } from './components/common/DemoWalkthroughModal';
import { NavigationHUD } from './components/navigation/NavigationHUD';
import { RouteOption, HotspotArea, SimulationResults, GeoCoordinate } from './types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ProvenanceBadge } from './components/common/ProvenanceBadge';

// Heavy, single-use-at-a-time components are code-split so their dependencies
// (maplibre-gl, @vis.gl/react-google-maps, recharts) aren't in the initial bundle.
const ChennaiMap = lazy(() => import('./components/map/ChennaiMap').then(m => ({ default: m.ChennaiMap })));
const GoogleChennaiMap = lazy(() => import('./components/map/GoogleChennaiMap').then(m => ({ default: m.GoogleChennaiMap })));
const SmartRoutesPanel = lazy(() => import('./components/routing/SmartRoutesPanel').then(m => ({ default: m.SmartRoutesPanel })));
const WhatIfSimulator = lazy(() => import('./components/simulation/WhatIfSimulator').then(m => ({ default: m.WhatIfSimulator })));

function PanelLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
      Loading…
    </div>
  );
}


export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('live');
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotArea | null>(null);
  const [simulatedResults, setSimulatedResults] = useState<SimulationResults | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Map Engine Selection: Default to 100% Free Light Vector Map if no key provided
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>(
    hasValidGoogleMapsKey ? 'google' : 'vector'
  );

  // Live GPS Geolocation State
  const [userGpsLocation, setUserGpsLocation] = useState<GeoCoordinate | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Turn-by-Turn Free Navigation State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentNavigationStep, setCurrentNavigationStep] = useState<number>(0);

  // Map view mode dynamically derives from active tab and simulation state
  const mapViewMode: 'traffic' | 'pollution' | 'simulation' =
    activeTab === 'pollution'
      ? 'pollution'
      : activeTab === 'simulation' && simulatedResults
      ? 'simulation'
      : 'traffic';

  const handleSelectHotspot = (hotspot: HotspotArea) => {
    setSelectedHotspot(hotspot);
  };

  const handleApplySimulationToMap = (results: SimulationResults | null) => {
    setSimulatedResults(results);
  };

  // GPS Geolocation Handler
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsActive(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GeoCoordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserGpsLocation(coords);
        setIsGpsActive(true);
      },
      (error) => {
        console.warn('GPS location request warning:', error.message);
        setGpsError('Could not access your location — showing a default position instead.');
        // Calibrated Chennai default GPS pin if browser permission denied
        setUserGpsLocation({ lat: 12.8406, lng: 80.1534 }); // VIT Chennai campus
        setIsGpsActive(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0B0E] text-slate-300 overflow-hidden font-sans antialiased">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartDemo={() => setIsDemoModalOpen(true)}
        isSimulatedActive={!!simulatedResults}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Intelligence Sidebar */}
        <aside
          className={`absolute lg:relative z-20 h-full bg-[#0F1117] border-r border-white/10 transition-all duration-300 flex flex-col ${
            isSidebarOpen
              ? 'w-full md:w-[380px] lg:w-[420px] xl:w-[460px] translate-x-0'
              : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden'
          }`}
        >
          <div className="flex-1 overflow-hidden relative">
            <Suspense fallback={<PanelLoadingFallback />}>
              {activeTab === 'live' && (
                <LiveCityDashboard
                  onSelectHotspot={handleSelectHotspot}
                  onNavigateToRoutes={() => setActiveTab('routes')}
                  onNavigateToSimulation={() => setActiveTab('simulation')}
                  onNavigateToAi={() => setActiveTab('ai')}
                />
              )}
              {activeTab === 'routes' && (
                <SmartRoutesPanel
                  onRouteSelected={(route) => setActiveRoute(route)}
                  activeRoute={activeRoute}
                  userGpsLocation={userGpsLocation}
                  onGpsRequested={handleRequestGps}
                  isGpsActive={isGpsActive}
                  onStartNavigation={(route) => {
                    setActiveRoute(route);
                    setCurrentNavigationStep(0);
                    setIsNavigating(true);
                    // On mobile/narrow screens, auto collapse sidebar to show HUD
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                />
              )}
              {activeTab === 'pollution' && <PollutionIntelligencePanel />}
              {activeTab === 'simulation' && (
                <WhatIfSimulator
                  onApplySimulationToMap={handleApplySimulationToMap}
                  isSimulatedOnMap={!!simulatedResults}
                />
              )}
              {activeTab === 'planner' && <CityPlannerPanel />}
              {activeTab === 'ai' && <FlowAiAdvisor />}
            </Suspense>
          </div>
        </aside>

        {/* Sidebar Toggle Handle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 w-4 h-10 bg-[#0F1117] border border-white/10 text-slate-400 hover:text-white rounded-r items-center justify-center shadow-2xl transition-all ${
            isSidebarOpen ? 'left-[420px] xl:left-[460px]' : 'left-0'
          }`}
          title={isSidebarOpen ? 'Collapse Panel' : 'Expand Panel'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Right GIS Map Stage */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#14161F]">
          {/* Map Engine Switcher Control */}
          <div className="absolute top-4 right-28 z-20 flex items-center bg-white/95 border border-slate-300 p-0.5 rounded-lg backdrop-blur text-[10px] font-mono shadow-xl">
            <button
              onClick={() => setMapEngine('vector')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-colors flex items-center gap-1 ${
                mapEngine === 'vector'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Free Light Map
            </button>
            <button
              onClick={() => setMapEngine('google')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Maps API
            </button>
          </div>

          <Suspense fallback={<PanelLoadingFallback />}>
            {mapEngine === 'google' ? (
              <GoogleChennaiMap
                activeRoute={activeRoute}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={handleSelectHotspot}
                viewMode={mapViewMode}
                userGpsLocation={userGpsLocation}
                onGpsClick={handleRequestGps}
                isGpsActive={isGpsActive}
              />
            ) : (
              <ChennaiMap
                activeRoute={activeRoute}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={handleSelectHotspot}
                viewMode={mapViewMode}
                userGpsLocation={userGpsLocation}
                onGpsClick={handleRequestGps}
                isGpsActive={isGpsActive}
                isNavigating={isNavigating}
                currentNavigationStep={currentNavigationStep}
                simulatedCorridors={simulatedResults?.corridorBreakdowns}
              />
            )}
          </Suspense>

          {/* Turn-by-Turn Voice Navigation HUD Overlay */}
          {isNavigating && activeRoute && (
            <NavigationHUD
              route={activeRoute}
              currentStepIndex={currentNavigationStep}
              onStepChange={setCurrentNavigationStep}
              onClose={() => setIsNavigating(false)}
            />
          )}

          {/* GPS Error Banner - surfaces geolocation failures instead of silently discarding them */}
          {gpsError && (
            <div className="absolute top-4 left-4 z-30 max-w-sm bg-red-50 border border-red-200 text-red-800 text-xs px-3 py-2 rounded-lg shadow-xl flex items-start gap-2 animate-fadeIn">
              <span className="flex-1">{gpsError}</span>
              <button
                onClick={() => setGpsError(null)}
                className="shrink-0 text-red-500 hover:text-red-700"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hotspot Floating Detail Overlay Card */}
          {selectedHotspot && (
            <div className="absolute top-14 right-4 z-20 max-w-xs w-full bg-white/95 text-slate-900 backdrop-blur-md p-3.5 rounded-lg border border-slate-200 shadow-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{selectedHotspot.name}</h4>
                    <ProvenanceBadge type="ESTIMATED" size="xs" showLabel={false} />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{selectedHotspot.zone}</span>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Congestion</span>
                  <span className="font-bold text-red-600 text-sm">
                    {selectedHotspot.congestionScore} / 100
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Peak Delay</span>
                  <span className="font-bold text-amber-600 text-sm">
                    +{selectedHotspot.peakDelayMinutes} mins
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-0.5">
                <span className="font-mono uppercase text-slate-500 block text-[10px] font-bold">Root Cause:</span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {selectedHotspot.primaryBottleneckReason}
                </p>
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-900 font-bold mb-0.5">Recommended Fix:</strong>
                  <span className="text-blue-800">{selectedHotspot.recommendedIntervention || selectedHotspot.primaryBottleneckReason}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* High Density Telemetry Status Footer */}
      <Footer />

      {/* Guided Showcase Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default App;
