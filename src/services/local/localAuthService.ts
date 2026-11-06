import type { AuthService } from "../types";

// Demo credentials. For a real site use the Supabase auth service (see README).
const DEMO_LOGIN = "admin";
const DEMO_PASSWORD = "admin123";
const SESSION_KEY = "coffee-and-co:admin-session";

function readSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSession(active: boolean) {
  try {
    if (active) window.sessionStorage.setItem(SESSION_KEY, "1");
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage unavailable — the session lives in memory only
  }
}

export function createLocalAuthService(): AuthService {
  const listeners = new Set<(authenticated: boolean) => void>();
  const notify = (authenticated: boolean) => listeners.forEach((listener) => listener(authenticated));

  return {
    identifierType: "username",
    peekSession: readSession,
    getSession: () => Promise.resolve(readSession()),
    onChange: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    signIn: (username, password) => {
      const ok = username === DEMO_LOGIN && password === DEMO_PASSWORD;
      if (ok) {
        writeSession(true);
        notify(true);
      }
      return Promise.resolve(ok ? "ok" : "invalid");
    },
    signOut: () => {
      writeSession(false);
      notify(false);
      return Promise.resolve();
    },
  };
}
