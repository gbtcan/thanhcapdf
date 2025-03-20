/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_FORUM: string;
  readonly VITE_ENABLE_PDF_PREVIEW: string;
  readonly VITE_ENABLE_USER_PROFILES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
