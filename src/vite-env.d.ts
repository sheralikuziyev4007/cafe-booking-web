/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Leave empty to run in demo mode (data in localStorage). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Safe to expose: access is limited by Row Level Security. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
