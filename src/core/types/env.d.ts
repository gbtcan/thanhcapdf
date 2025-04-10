/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Make ENV_CONFIG available globally
declare const ENV_CONFIG: {
  isProduction: boolean;
  isDevelopment: boolean;
  appVersion: string;
  buildDate: string;
};
