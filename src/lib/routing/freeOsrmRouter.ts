import { GeoCoordinate, RouteOption, OptimizationGoal, LandmarkNode } from '../../types';
import { planSmartRoutes } from './smartRouter';

export interface OsrmRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lng, lat]
  steps: {
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
    coordinates: [number, number][];
  }[];
}

interface OsrmStep {
  maneuver?: { type?: string };
  name?: string;
  distance?: number;
  duration?: number;
  geometry?: { coordinates?: [number, number][] };
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Fetch free real-world driving road geometry from Open Source Routing Machine (OSRM)
 * 100% Free, No API key, No billing required.
 */
export async function fetchFreeOsrmRoute(
  origin: GeoCoordinate,
  destination: GeoCoordinate
): Promise<OsrmRouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('OSRM router returned status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    const primaryRoute = data.routes[0];
    const geometryCoords: [number, number][] = primaryRoute.geometry.coordinates || [];

    const steps = (primaryRoute.legs?.[0]?.steps || []).map((step: OsrmStep) => ({
      instruction: step.maneuver?.type === 'depart'
        ? `Depart on ${step.name || 'main road'}`
        : step.maneuver?.type === 'arrive'
        ? 'Arrive at destination'
        : `${step.maneuver?.type || 'Turn'} onto ${step.name || 'road'}`,
      distanceMeters: step.distance || 0,
      durationSeconds: step.duration || 0,
      coordinates: step.geometry?.coordinates || []
    }));

    return {
      distanceMeters: primaryRoute.distance,
      durationSeconds: primaryRoute.duration,
      coordinates: geometryCoords,
      steps
    };
  } catch (err) {
    console.warn('OSRM router fetch skipped, using built-in Chennai graph model:', err);
    return null;
  }
}

/**
 * Free OpenStreetMap Nominatim Geocoder for Chennai locations
 * 100% Free, No API key, No credit card needed.
 */
export async function searchFreeChennaiPlaces(query: string): Promise<{ name: string; lat: number; lng: number }[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const sanitized = encodeURIComponent(`${query.trim()} Chennai India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${sanitized}&format=json&addressdetails=1&limit=5&viewbox=79.95,13.25,80.35,12.75&bounded=0`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();

    return data.map((item: NominatimResult) => ({
      name: item.display_name.split(',')[0] || item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (e) {
    console.warn('Place search request failed:', e);
    return [];
  }
}

/**
 * Plan Smart Routes combining free OSRM road geometry with Chennai's Metro/Bus/Multimodal models
 */
export async function planFreeSmartRoutesWithOsrm(
  origin: LandmarkNode,
  destination: LandmarkNode,
  goal: OptimizationGoal = 'BALANCED'
): Promise<RouteOption[]> {
  // 1. Calculate baseline options using local graph
  const baselineRoutes = planSmartRoutes(origin, destination, goal);

  // 2. Query OSRM in parallel for real road geometry
  try {
    const osrm = await fetchFreeOsrmRoute(origin.coordinate, destination.coordinate);

    if (osrm && osrm.coordinates.length > 2) {
      const realRoadKm = Math.round((osrm.distanceMeters / 1000) * 10) / 10;
      
      // Update road vehicle options with exact OSRM geometry
      return baselineRoutes.map((route) => {
        if (route.mode === 'CAR_PETROL' || route.mode === 'TWO_WHEELER') {
          return {
            ...route,
            distanceKm: realRoadKm,
            segments: [
              {
                ...route.segments[0],
                distanceKm: realRoadKm,
                coordinates: osrm.coordinates
              }
            ]
          };
        }
        return route;
      });
    }
  } catch (e) {
    console.warn('OSRM enrichment fallback:', e);
  }

  return baselineRoutes;
}
