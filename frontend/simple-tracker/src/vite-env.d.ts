/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_FF_SHOW_DAILY_PATTERNS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
