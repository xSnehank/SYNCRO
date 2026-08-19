/**
 * Resolves the Google Maps Platform API key from whichever source is available
 * (server-injected env var, Vite build-time env, or a runtime-injected window global).
 *
 * Deliberately kept dependency-free so it can be imported eagerly (e.g. to decide
 * the default map engine) without pulling in the @vis.gl/react-google-maps bundle.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  import.meta.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (typeof window !== 'undefined' ? window.GOOGLE_MAPS_PLATFORM_KEY : undefined) ||
  '';

export const hasValidGoogleMapsKey =
  Boolean(GOOGLE_MAPS_API_KEY) &&
  GOOGLE_MAPS_API_KEY !== 'MY_GOOGLE_MAPS_KEY' &&
  GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';
