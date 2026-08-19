import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  CHENNAI_CENTER,
  CHENNAI_LANDMARKS,
  CHENNAI_HOTSPOTS,
  AIR_QUALITY_SENSORS
} from '../../data/chennaiGeoData';
import { HotspotArea, RouteOption, GeoCoordinate } from '../../types';
import {
  Crosshair,
  Key,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

import { GOOGLE_MAPS_API_KEY as API_KEY, hasValidGoogleMapsKey } from '../../lib/map/googleMapsKey';

export { hasValidGoogleMapsKey };

interface GoogleChennaiMapProps {
  activeRoute: RouteOption | null;
  selectedHotspot: HotspotArea | null;
  onSelectHotspot: (hotspot: HotspotArea) => void;
  viewMode: 'traffic' | 'pollution' | 'simulation';
  userGpsLocation: GeoCoordinate | null;
  onGpsClick: () => void;
  isGpsActive: boolean;
}

// Inner Component for handling Route Polylines inside Google Maps context
function GoogleRouteRenderer({
  activeRoute,
  userGpsLocation
}: {
  activeRoute: RouteOption | null;
  userGpsLocation: GeoCoordinate | null;
}) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!activeRoute || activeRoute.segments.length === 0) return;

    // Flatten all coordinate segments
    const pathCoordinates: google.maps.LatLngLiteral[] = [];
    activeRoute.segments.forEach((seg) => {
      seg.coordinates.forEach(([lng, lat]) => {
        pathCoordinates.push({ lat, lng });
      });
    });

    if (pathCoordinates.length < 2) return;

    // Draw standard vibrant Google Maps navigation polyline (Blue with dark navy casing)
    const routeCasing = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#1d4ed8',
      strokeOpacity: 0.9,
      strokeWeight: 8,
      map: map
    });

    const routeMain = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map: map
    });

    polylinesRef.current = [routeCasing, routeMain];

    // Fit map bounds to encompass the entire route
    const bounds = new google.maps.LatLngBounds();
    pathCoordinates.forEach((coord) => bounds.extend(coord));
    if (userGpsLocation) {
      bounds.extend({ lat: userGpsLocation.lat, lng: userGpsLocation.lng });
    }
    map.fitBounds(bounds, { top: 60, bottom: 80, left: 60, right: 60 });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, activeRoute, userGpsLocation]);

  return null;
}

// Inner Component for Map Markers & InfoWindows
function GoogleMapContent({
  activeRoute,
  selectedHotspot,
  onSelectHotspot,
  viewMode,
  userGpsLocation
}: GoogleChennaiMapProps) {
  const map = useMap();
  const [activeInfoWindowHotspot, setActiveInfoWindowHotspot] = useState<HotspotArea | null>(null);

  // Sync selected hotspot from outside
  useEffect(() => {
    if (selectedHotspot && map) {
      setActiveInfoWindowHotspot(selectedHotspot);
      map.panTo({ lat: selectedHotspot.coordinate.lat, lng: selectedHotspot.coordinate.lng });
      map.setZoom(14);
    }
  }, [selectedHotspot, map]);

  return (
    <>
      <GoogleRouteRenderer activeRoute={activeRoute} userGpsLocation={userGpsLocation} />

      {/* User Live GPS Marker */}
      {userGpsLocation && (
        <AdvancedMarker
          position={{ lat: userGpsLocation.lat, lng: userGpsLocation.lng }}
          title="Your Live GPS Location"
          zIndex={100}
        >
          <div className="relative flex items-center justify-center cursor-pointer">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-75" />
            <div className="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
              <Crosshair className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-6 whitespace-nowrap bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow-md">
              GPS LIVE
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* Key Landmarks */}
      {CHENNAI_LANDMARKS.slice(0, 8).map((landmark) => (
        <AdvancedMarker
          key={landmark.id}
          position={{ lat: landmark.coordinate.lat, lng: landmark.coordinate.lng }}
          title={landmark.name}
        >
          <Pin background="#0284c7" glyphColor="#ffffff" borderColor="#0369a1" scale={0.85} />
        </AdvancedMarker>
      ))}

      {/* Hotspots Congestion Pins */}
      {CHENNAI_HOTSPOTS.map((hotspot) => {
        const isSelected = selectedHotspot?.id === hotspot.id;
        const isSevere = hotspot.congestionLevel === 'SEVERE';
        return (
          <AdvancedMarker
            key={hotspot.id}
            position={{ lat: hotspot.coordinate.lat, lng: hotspot.coordinate.lng }}
            onClick={() => {
              onSelectHotspot(hotspot);
              setActiveInfoWindowHotspot(hotspot);
            }}
            title={hotspot.name}
          >
            <div className="group cursor-pointer relative flex items-center justify-center">
              <span
                className={`animate-ping absolute inline-flex h-6 w-6 rounded-full ${
                  isSevere ? 'bg-red-500/50' : 'bg-amber-500/50'
                }`}
              />
              <div
                className={`relative w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] font-mono shadow-md border-2 border-white ${
                  isSelected
                    ? 'scale-125 bg-blue-700'
                    : isSevere
                    ? 'bg-red-600'
                    : 'bg-amber-600'
                }`}
              >
                !
              </div>
              <div className="absolute -top-6 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded border border-slate-700 font-sans opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                {hotspot.name.split(' ')[0]} ({hotspot.congestionScore}%)
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Air Quality Sensors in Pollution Mode */}
      {viewMode === 'pollution' &&
        AIR_QUALITY_SENSORS.map((sensor) => (
          <AdvancedMarker
            key={sensor.id}
            position={{ lat: sensor.coordinate.lat, lng: sensor.coordinate.lng }}
            title={`${sensor.name}: ${sensor.aqi} AQI`}
          >
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded shadow-md text-xs font-mono font-bold text-slate-800">
              <span className={`w-2 h-2 rounded-full ${sensor.aqi > 150 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{sensor.aqi} AQI</span>
            </div>
          </AdvancedMarker>
        ))}

      {/* InfoWindow for Clicked Hotspot */}
      {activeInfoWindowHotspot && (
        <InfoWindow
          position={{
            lat: activeInfoWindowHotspot.coordinate.lat,
            lng: activeInfoWindowHotspot.coordinate.lng
          }}
          onCloseClick={() => setActiveInfoWindowHotspot(null)}
        >
          <div className="p-1 space-y-1.5 text-slate-900 min-w-[220px] font-sans">
            <div className="flex items-center justify-between border-b pb-1">
              <strong className="text-xs font-bold text-slate-900">{activeInfoWindowHotspot.name}</strong>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase">
                {activeInfoWindowHotspot.congestionScore}% Congestion
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              {activeInfoWindowHotspot.primaryBottleneckReason}
            </p>
            <div className="text-[10px] text-blue-700 font-mono">
              Peak Delay: +{activeInfoWindowHotspot.peakDelayMinutes} mins • {activeInfoWindowHotspot.zone}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export const GoogleChennaiMap: React.FC<GoogleChennaiMapProps> = (props) => {
  const { onGpsClick, isGpsActive } = props;
  const [showKeyGuide, setShowKeyGuide] = useState(!hasValidGoogleMapsKey);

  // If the user hasn't added their Google Maps API Key yet, show the mandatory setup guide card
  if (!hasValidGoogleMapsKey && showKeyGuide) {
    return (
      <div className="relative w-full h-full bg-[#f8fafc] flex items-center justify-center p-6 select-none font-sans">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Google Maps API Key Setup</h2>
              <p className="text-xs text-slate-500">Configure your key to unlock proper Google Maps & Routes</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Get a Google Maps API Key</strong>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-medium inline-flex items-center gap-1 mt-0.5"
                >
                  Open Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div className="space-y-1">
                <strong className="text-slate-900 block font-semibold">Add Secret in AI Studio</strong>
                <p className="leading-relaxed">
                  Open <strong>Settings (⚙️ gear icon, top-right)</strong> → <strong>Secrets</strong> → add key named{' '}
                  <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-900 font-bold">
                    GOOGLE_MAPS_PLATFORM_KEY
                  </code>{' '}
                  and paste your key.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>The application rebuilds automatically and loads the Google Maps vector canvas.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">Chennai Flow v1.0</span>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Continue to Light Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#f8fafc] overflow-hidden select-none font-sans">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: CHENNAI_CENTER[1], lng: CHENNAI_CENTER[0] }}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <GoogleMapContent {...props} />
        </Map>
      </APIProvider>

      {/* Floating GPS & Navigation Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={onGpsClick}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-bold tracking-wide shadow-xl transition-all border ${
            isGpsActive
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30'
              : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
          title="Locate My GPS Position"
        >
          <Crosshair className={`w-4 h-4 ${isGpsActive ? 'animate-spin-slow text-white' : 'text-blue-600'}`} />
          <span>{isGpsActive ? 'GPS Position Locked' : 'Locate My GPS'}</span>
        </button>
      </div>

      {/* Floating Light Map Status Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 border border-slate-200 px-3 py-1.5 rounded-lg shadow-lg text-xs font-sans text-slate-800 backdrop-blur">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        <span className="font-bold">Google Maps</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600 font-medium">Standard Light Canvas</span>
      </div>
    </div>
  );
};
