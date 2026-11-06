import { getSupabaseClient, isSupabaseConfigured, type GetSupabaseClient } from "@/lib/supabase";
import type { Services } from "./types";
import { createLocalAuthService } from "./local/localAuthService";
import { createLocalInboxRepository } from "./local/localInboxRepository";
import { createLocalMenuRepository } from "./local/localMenuRepository";
import { createSupabaseAuthService } from "./supabase/supabaseAuthService";
import { createSupabaseInboxRepository } from "./supabase/supabaseInboxRepository";
import { createSupabaseMenuRepository } from "./supabase/supabaseMenuRepository";

export type { AuthService, InboxRepository, LoginResult, MenuRepository, Services } from "./types";

export function createLocalServices(): Services {
  return {
    mode: "local",
    menu: createLocalMenuRepository(),
    inbox: createLocalInboxRepository(),
    auth: createLocalAuthService(),
  };
}

export function createSupabaseServices(getClient: GetSupabaseClient): Services {
  return {
    mode: "supabase",
    menu: createSupabaseMenuRepository(getClient),
    inbox: createSupabaseInboxRepository(getClient),
    auth: createSupabaseAuthService(getClient),
  };
}

/** Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, the demo storage otherwise */
export function createDefaultServices(): Services {
  return isSupabaseConfigured ? createSupabaseServices(getSupabaseClient) : createLocalServices();
}
