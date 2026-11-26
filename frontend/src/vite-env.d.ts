/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the PAL-ONE API (default "/api"). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
