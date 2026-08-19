import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  CHENNAI_CENTER,
  CHENNAI_DEFAULT_ZOOM,
  CHENNAI_LANDMARKS,
  CHENNAI_ROAD_CORRIDORS,
  CHENNAI_TRANSIT_ROUTES,
  CHENNAI_HOTSPOTS,
  AIR_QUALITY_SENSORS
} from '../../data/chennaiGeoData';
import { HotspotArea, RouteOption, GeoCoordinate } from '../../types';
import { Layers, Navigation } from 'lucide-react';

interface ChennaiMapProps {
  activeRoute: RouteOption | null;
  selectedHotspot: HotspotArea | null;
  onSelectHotspot: (hotspot: HotspotArea) => void;
  viewMode: 'traffic' | 'pollution' | 'simulation';
  userGpsLocation?: GeoCoordinate | null;
  onGpsClick?: () => void;
  isGpsActive?: boolean;
  isNavigating?: boolean;
  currentNavigationStep?: number;
  simulatedCorridors?: {
    corridorName: string;
    baselineCongestion: number;
    simulatedCongestion: number;
    baselineSpeed: number;
    simulatedSpeed: number;
    co2ReductionPercent: number;
  }[];
}

type TilePreset = 'voyager' | 'osm' | 'positron';

const TILE_CONFIGS: Record<TilePreset, { name: string; tiles: string[]; maxzoom: number }> = {
  voyager: {
    name: 'Google Maps Light (Voyager)',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
    ],
    maxzoom: 19
  },
  osm: {
    name: 'OpenStreetMap Detailed',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    maxzoom: 19
  },
  positron: {
    name: 'Positron Clean Light',
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
    ],
    maxzoom: 19
  }
};

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  activeRoute,
  selectedHotspot,
  onSelectHotspot,
  viewMode,
  userGpsLocation,
  onGpsClick,
  isGpsActive,
  isNavigating = false,
  currentNavigationStep = 0,
  simulatedCorridors
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Layer & Style Toggles
  const [tilePreset, setTilePreset] = useState<TilePreset>('voyager');
  const [showTraffic, setShowTraffic] = useState(true);
  const [showMetro, setShowMetro] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize or Re-style MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setIsMapLoaded(false);
    }

    const config = TILE_CONFIGS[tilePreset];
    const lightStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'light-tiles': {
          type: 'raster',
          tiles: config.tiles,
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'light-tiles-layer',
          type: 'raster',
          source: 'light-tiles',
          minzoom: 0,
          maxzoom: config.maxzoom
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: lightStyle,
      center: CHENNAI_CENTER,
      zoom: CHENNAI_DEFAULT_ZOOM,
      minZoom: 9.0,
      maxZoom: 18.5,
      pitch: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      setIsMapLoaded(true);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [tilePreset]);

  // Update GeoJSON Layers (Corridors & Transits)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // 1. Road Corridors GeoJSON Source
    const corridorsFeatures = CHENNAI_ROAD_CORRIDORS.map((corridor) => {
      let strokeColor = '#16a34a'; // Vibrant Green
      let congestionVal = corridor.congestionIndex;
      let speedVal = corridor.currentSpeedKm;

      if (viewMode === 'simulation' && simulatedCorridors) {
        const simMatch = simulatedCorridors.find(
          (s) => s.corridorName.toLowerCase() === corridor.name.split(' (')[0].toLowerCase()
        );
        if (simMatch) {
          congestionVal = simMatch.simulatedCongestion;
          speedVal = simMatch.simulatedSpeed;
        }
      }

      if (viewMode === 'pollution') {
        if (corridor.pollutionRisk === 'HAZARDOUS') strokeColor = '#dc2626'; // High red
        else if (corridor.pollutionRisk === 'HIGH') strokeColor = '#ea580c'; // Orange
        else if (corridor.pollutionRisk === 'MODERATE') strokeColor = '#ca8a04'; // Yellow
        else strokeColor = '#16a34a'; // Green
      } else {
        if (congestionVal >= 80) strokeColor = '#b91c1c'; // Severe Red
        else if (congestionVal >= 65) strokeColor = '#ea580c'; // Orange
        else if (congestionVal >= 45) strokeColor = '#eab308'; // Amber
        else strokeColor = '#16a34a'; // Green
      }

      return {
        type: 'Feature' as const,
        properties: {
          id: corridor.id,
          name: corridor.name,
          corridor: corridor.corridor,
          congestion: congestionVal,
          speed: speedVal,
          idle: corridor.estimatedIdleMinPerKm,
          co2: corridor.emissions.co2KgPerHour,
          pm25: corridor.emissions.pm25GramsPerHour,
          risk: corridor.pollutionRisk,
          color: strokeColor,
          provenance: corridor.provenance
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: corridor.coordinates
        }
      };
    });

    const corridorsGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: corridorsFeatures
    };

    if (map.getSource('corridors-source')) {
      (map.getSource('corridors-source') as maplibregl.GeoJSONSource).setData(corridorsGeoJson);
    } else {
      map.addSource('corridors-source', {
        type: 'geojson',
        data: corridorsGeoJson
      });

      // Casing white background outline for maximum visibility on light maps
      map.addLayer({
        id: 'corridors-casing',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 7,
          'line-opacity': 0.8
        }
      });

      // Main line layer
      map.addLayer({
        id: 'corridors-main',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.95
        }
      });

      map.on('click', 'corridors-main', (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties;
        const coords = e.lngLat;

        const content = `
          <div class="p-2 space-y-2 min-w-[240px] font-sans text-xs bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200">
            <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span class="font-bold text-slate-900 text-sm">${props.name}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">${props.provenance}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <span class="text-slate-500 block text-[9px] uppercase font-bold">Live Speed</span>
                <span class="font-bold text-slate-900 text-sm">${props.speed} km/h</span>
              </div>
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <span class="text-slate-500 block text-[9px] uppercase font-bold">Congestion</span>
                <span class="font-bold ${props.congestion > 75 ? 'text-red-600' : 'text-amber-600'} text-sm">${props.congestion}/100</span>
              </div>
            </div>
            <div class="text-[10px] font-mono text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Risk: <strong class="${props.risk === 'HAZARDOUS' ? 'text-red-600' : 'text-amber-600'}">${props.risk}</strong></span>
              <span>CO2: <strong class="text-emerald-700 font-bold">${props.co2} kg/h</strong></span>
            </div>
          </div>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, offset: 10 })
          .setLngLat(coords)
          .setHTML(content)
          .addTo(map);
      });

      map.on('mouseenter', 'corridors-main', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'corridors-main', () => { map.getCanvas().style.cursor = ''; });
    }

    // 2. Transit Lines
    const transitFeatures = CHENNAI_TRANSIT_ROUTES.map((route) => ({
      type: 'Feature' as const,
      properties: {
        id: route.id,
        name: route.shortName,
        type: route.type,
        color: route.color
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: route.coordinates
      }
    }));

    const transitGeoJson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: transitFeatures
    };

    if (map.getSource('transit-source')) {
      (map.getSource('transit-source') as maplibregl.GeoJSONSource).setData(transitGeoJson);
    } else {
      map.addSource('transit-source', {
        type: 'geojson',
        data: transitGeoJson
      });

      map.addLayer({
        id: 'transit-lines',
        type: 'line',
        source: 'transit-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'match',
            ['get', 'type'],
            'METRO', 4.5,
            'SUBURBAN_TRAIN', 3.5,
            2.5
          ],
          'line-opacity': 0.9
        }
      });
    }

    if (map.getLayer('corridors-main')) {
      map.setLayoutProperty('corridors-main', 'visibility', showTraffic ? 'visible' : 'none');
      map.setLayoutProperty('corridors-casing', 'visibility', showTraffic ? 'visible' : 'none');
    }
    if (map.getLayer('transit-lines')) {
      map.setLayoutProperty('transit-lines', 'visibility', showMetro || showBuses ? 'visible' : 'none');
    }
  }, [isMapLoaded, viewMode, showTraffic, showMetro, showBuses, simulatedCorridors]);

  // 3. Render Markers & Active Route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Hotspot Markers (High Visibility Vibrant Pins)
    if (showHotspots) {
      CHENNAI_HOTSPOTS.forEach((hotspot) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer relative';
        const isSelected = selectedHotspot?.id === hotspot.id;

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full ${
              hotspot.congestionLevel === 'SEVERE' ? 'bg-red-500/60' : 'bg-amber-500/60'
            }"></span>
            <div class="relative w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] font-mono shadow-md border-2 border-white ${
              isSelected ? 'scale-125 bg-blue-600 ring-2 ring-blue-400' : hotspot.congestionLevel === 'SEVERE' ? 'bg-red-600' : 'bg-amber-600'
            }">
              !
            </div>
            <div class="absolute -top-7 whitespace-nowrap bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700">
              ${hotspot.name.split(' ')[0]} ${hotspot.congestionScore}% Congested
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectHotspot(hotspot);
          map.flyTo({
            center: [hotspot.coordinate.lng, hotspot.coordinate.lat],
            zoom: 14,
            duration: 900
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([hotspot.coordinate.lng, hotspot.coordinate.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Key Chennai Landmark Labels
    if (showLandmarks) {
      CHENNAI_LANDMARKS.forEach((lm) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full border border-slate-300 shadow-md hover:scale-105 transition-transform';
        el.innerHTML = `
          <span class="w-2 h-2 rounded-full ${lm.category === 'transit_hub' ? 'bg-blue-600' : lm.category === 'tech_park' ? 'bg-purple-600' : 'bg-emerald-600'}"></span>
          <span class="text-[9px] font-bold text-slate-800 tracking-tight whitespace-nowrap">${lm.name}</span>
        `;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lm.coordinate.lng, lm.coordinate.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }

    // User Live GPS Marker
    if (userGpsLocation) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer';
      el.innerHTML = `
        <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-blue-500 opacity-75"></span>
        <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-[11px]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
        </div>
        <div class="absolute -bottom-6 whitespace-nowrap bg-blue-900 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold shadow-lg border border-blue-400">
          YOU ARE HERE
        </div>
      `;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([userGpsLocation.lng, userGpsLocation.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    // Air Quality Sensors
    if (showSensors && viewMode === 'pollution') {
      AIR_QUALITY_SENSORS.forEach((sensor) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group';
        el.innerHTML = `
          <div class="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-900 shadow-md">
            <span class="w-2 h-2 rounded-full ${sensor.aqi > 150 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}"></span>
            <span>${sensor.aqi} AQI (${sensor.name.split(' ')[0]})</span>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([sensor.coordinate.lng, sensor.coordinate.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Active Route Polyline (Google Maps Blue Polyline with White Border)
    if (activeRoute && activeRoute.segments.length > 0) {
      const allCoords: [number, number][] = [];
      activeRoute.segments.forEach((seg) => {
        allCoords.push(...seg.coordinates);
      });

      if (allCoords.length > 1) {
        const routeGeoJson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { color: '#1a73e8' },
              geometry: { type: 'LineString', coordinates: allCoords }
            }
          ]
        };

        if (map.getSource('active-route-source')) {
          (map.getSource('active-route-source') as maplibregl.GeoJSONSource).setData(routeGeoJson);
        } else {
          map.addSource('active-route-source', { type: 'geojson', data: routeGeoJson });

          // White border casing for the route
          map.addLayer({
            id: 'active-route-casing',
            type: 'line',
            source: 'active-route-source',
            paint: {
              'line-color': '#ffffff',
              'line-width': 9,
              'line-opacity': 0.95
            }
          });

          // Google Maps Blue Polyline
          map.addLayer({
            id: 'active-route-line',
            type: 'line',
            source: 'active-route-source',
            paint: {
              'line-color': '#1a73e8',
              'line-width': 6,
              'line-opacity': 1.0
            }
          });
        }

        // Origin Pin (Green A)
        const originEl = document.createElement('div');
        originEl.innerHTML = `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] shadow-xl border-2 border-white">
            A
          </div>
        `;
        markersRef.current.push(new maplibregl.Marker({ element: originEl }).setLngLat(allCoords[0]).addTo(map));

        // Destination Pin (Red B)
        const destEl = document.createElement('div');
        destEl.innerHTML = `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-black text-[11px] shadow-xl border-2 border-white">
            B
          </div>
        `;
        markersRef.current.push(new maplibregl.Marker({ element: destEl }).setLngLat(allCoords[allCoords.length - 1]).addTo(map));

        // Active Navigation Vehicle Marker & Camera Follow
        if (isNavigating && activeRoute.segments && activeRoute.segments.length > 0) {
          const currentSeg = activeRoute.segments[currentNavigationStep] || activeRoute.segments[0];
          const vehiclePos = currentSeg.coordinates?.[0] || allCoords[0];

          const vehicleEl = document.createElement('div');
          vehicleEl.className = 'relative flex items-center justify-center z-30';
          vehicleEl.innerHTML = `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-blue-500 opacity-60"></span>
              <div class="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                </svg>
              </div>
            </div>
          `;

          markersRef.current.push(new maplibregl.Marker({ element: vehicleEl }).setLngLat(vehiclePos).addTo(map));

          // Smoothly fly camera to vehicle position with 3D navigation pitch
          map.flyTo({
            center: vehiclePos,
            zoom: 15.5,
            pitch: 45,
            duration: 1000
          });
        } else {
          // Standard overview bounds fit
          const bounds = new maplibregl.LngLatBounds();
          allCoords.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 60, duration: 800 });
        }
      }
    }
  }, [isMapLoaded, activeRoute, selectedHotspot, showHotspots, showSensors, showLandmarks, viewMode, onSelectHotspot, userGpsLocation, isNavigating, currentNavigationStep]);

  return (
    <div className="relative w-full h-full bg-[#f8fafc] overflow-hidden select-none">
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5">
        {/* GPS Locate Button */}
        {onGpsClick && (
          <button
            onClick={onGpsClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xl transition-all border ${
              isGpsActive
                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'bg-white/95 text-slate-800 hover:text-blue-600 border-slate-300 hover:border-blue-400'
            }`}
            title="Locate My Live GPS Position"
          >
            <Navigation className={`w-4 h-4 ${isGpsActive ? 'text-white' : 'text-blue-600'}`} />
            <span>{isGpsActive ? 'GPS Position Locked' : 'Locate My GPS'}</span>
          </button>
        )}

        {/* Map Layers & Style Controls Card */}
        <div className="bg-white/95 border border-slate-200/90 p-3 rounded-lg backdrop-blur-md shadow-xl min-w-[200px] text-slate-900">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <h4 className="text-[11px] text-slate-700 uppercase font-bold font-mono tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Map Layers</span>
            </h4>
            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              FREE
            </span>
          </div>

          {/* Tile Style Picker */}
          <div className="mb-2.5 pb-2 border-b border-slate-100">
            <label className="text-[10px] text-slate-500 font-bold block mb-1 font-mono uppercase">
              Map Style:
            </label>
            <select
              value={tilePreset}
              onChange={(e) => setTilePreset(e.target.value as TilePreset)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-sans text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="voyager">Voyager (Google Maps Look)</option>
              <option value="osm">OpenStreetMap Detailed</option>
              <option value="positron">Positron Clean Light</option>
            </select>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-sm" />
                <span>Live Traffic Heatmap</span>
              </div>
              <input
                type="checkbox"
                checked={showTraffic}
                onChange={(e) => setShowTraffic(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                <span>Metro Rail Routes</span>
              </div>
              <input
                type="checkbox"
                checked={showMetro}
                onChange={(e) => setShowMetro(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                <span>MTC Bus Corridors</span>
              </div>
              <input
                type="checkbox"
                checked={showBuses}
                onChange={(e) => setShowBuses(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full border border-white" />
                <span>Traffic Bottlenecks</span>
              </div>
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-sm" />
                <span>Landmarks & Tech Parks</span>
              </div>
              <input
                type="checkbox"
                checked={showLandmarks}
                onChange={(e) => setShowLandmarks(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full border border-white" />
                <span>Air Quality Sensors</span>
              </div>
              <input
                type="checkbox"
                checked={showSensors}
                onChange={(e) => setShowSensors(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
            </label>
          </div>
        </div>

        {/* View Mode Pill */}
        <div className="bg-white/95 border border-slate-200 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 text-xs font-mono shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-800 font-bold uppercase tracking-wider">
            {viewMode === 'pollution' ? 'Emissions View' : viewMode === 'simulation' ? 'Simulated Flow' : 'Live Navigation Grid'}
          </span>
        </div>
      </div>

      {/* High Density Bottom Timeline & Impact Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 p-3 rounded-lg backdrop-blur-md flex items-center gap-6 shadow-xl z-20 text-slate-900">
        <div className="flex-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-600 uppercase mb-1.5">
            <span className="font-bold">Chennai Transit Flow Timeline</span>
            <span className="text-blue-700 font-bold">Phase: Live Daylight Flow</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-2/5 bg-blue-600 shadow-[0_0_8px_#2563eb]" />
            <div className="absolute top-0 left-[40%] w-1 h-full bg-slate-900 z-10" />
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-500">
            <span>06:00 AM</span>
            <span>09:00 AM (Peak)</span>
            <span>12:00 PM</span>
            <span>03:00 PM</span>
            <span>06:00 PM (Peak)</span>
            <span>09:00 PM</span>
          </div>
        </div>

        <div className="flex gap-4 shrink-0 border-l border-slate-200 pl-4">
          <div className="text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">CO2 Savings</p>
            <p className="text-base font-mono font-bold text-emerald-600">-18.4%</p>
            <p className="text-[9px] font-mono text-slate-500">Via Multi-Modal</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">Idle Time</p>
            <p className="text-base font-mono font-bold text-blue-600">-22m</p>
            <p className="text-[9px] font-mono text-slate-500">Relief</p>
          </div>
        </div>
      </div>
    </div>
  );
};
