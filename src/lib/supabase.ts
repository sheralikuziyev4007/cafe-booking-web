import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** True when both environment variables are set. Without them the site runs in demo mode (localStorage). */
export const isSupabaseConfigured = Boolean(url && anonKey);

export type GetSupabaseClient = () => Promise<SupabaseClient>;

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * The Supabase SDK is loaded on demand: in demo mode it is never downloaded,
 * and with a backend it is a separate chunk that doesn't block the first render.
 */
export const getSupabaseClient: GetSupabaseClient = () => {
  if (!url || !anonKey) return Promise.reject(new Error("Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"));
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  );
  return clientPromise;
};
