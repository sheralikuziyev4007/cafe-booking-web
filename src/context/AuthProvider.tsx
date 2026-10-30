import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./authContext";

// Demo credentials. In production replace with a backend / auth provider (e.g. Supabase Auth).
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(readSession);

  const login = useCallback((username: string, password: string) => {
    const ok = username === DEMO_LOGIN && password === DEMO_PASSWORD;
    if (ok) {
      writeSession(true);
      setIsAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    writeSession(false);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
