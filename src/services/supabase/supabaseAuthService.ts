import type { Session } from "@supabase/supabase-js";
import type { GetSupabaseClient } from "@/lib/supabase";
import type { AuthService } from "../types";

/**
 * Only accounts whose app_metadata contains { "role": "admin" } count as signed in.
 * app_metadata can't be edited by the user (only from the Supabase dashboard or with SQL),
 * and the database policies check the same claim (see supabase/schema.sql).
 */
function isAdminSession(session: Session | null): boolean {
  return session?.user.app_metadata?.role === "admin";
}

export function createSupabaseAuthService(getClient: GetSupabaseClient): AuthService {
  return {
    identifierType: "email",

    async getSession() {
      const client = await getClient();
      const { data } = await client.auth.getSession();
      return isAdminSession(data.session);
    },

    onChange(listener) {
      let cancelled = false;
      let unsubscribe: (() => void) | undefined;
      getClient()
        .then((client) => {
          if (cancelled) return;
          const { data } = client.auth.onAuthStateChange((_event, session) => listener(isAdminSession(session)));
          unsubscribe = () => data.subscription.unsubscribe();
        })
        .catch(() => {
          // the client could not be created — getSession() reports the failure
        });
      return () => {
        cancelled = true;
        unsubscribe?.();
      };
    },

    async signIn(email, password) {
      try {
        const client = await getClient();
        const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          // Network problems and server/rate-limit errors are not "wrong password"
          const unavailable = error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 429;
          return unavailable ? "error" : "invalid";
        }
        if (!isAdminSession(data.session)) {
          await client.auth.signOut({ scope: "local" });
          return "forbidden";
        }
        return "ok";
      } catch {
        return "error";
      }
    },

    async signOut() {
      const client = await getClient();
      await client.auth.signOut({ scope: "local" });
    },
  };
}
