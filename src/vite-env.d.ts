/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARTICLE_PROJECT_ID: string;
  readonly VITE_PARTICLE_CLIENT_KEY: string;
  readonly VITE_PARTICLE_APP_ID: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
