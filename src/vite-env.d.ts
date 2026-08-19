/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_PLATFORM_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Runtime-injected global (e.g. by the hosting platform), distinct from Vite's import.meta.env
interface Window {
  GOOGLE_MAPS_PLATFORM_KEY?: string;
}
