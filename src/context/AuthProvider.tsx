import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { useServices } from "@/hooks/useServices";
import { AuthContext, type AuthStatus } from "./authContext";

const toStatus = (authenticated: boolean): AuthStatus => (authenticated ? "authenticated" : "unauthenticated");

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(() => {
    const session = auth.peekSession?.();
    return session === undefined ? "loading" : toStatus(session);
  });

  useEffect(() => {
    let active = true;
    auth
      .getSession()
      .then((authenticated) => active && setStatus(toStatus(authenticated)))
      .catch(() => active && setStatus("unauthenticated"));
    const unsubscribe = auth.onChange((authenticated) => active && setStatus(toStatus(authenticated)));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth]);

  // Private data must not stay in memory after sign-out (or an expired session)
  useEffect(() => {
    if (status !== "unauthenticated") return;
    queryClient.removeQueries({ queryKey: queryKeys.bookings });
    queryClient.removeQueries({ queryKey: queryKeys.messages });
  }, [status, queryClient]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const result = await auth.signIn(identifier, password);
      if (result === "ok") setStatus("authenticated");
      return result;
    },
    [auth]
  );

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } finally {
      // Even if the server could not be reached, this browser is signed out
      setStatus("unauthenticated");
    }
  }, [auth]);

  const value = useMemo(
    () => ({ status, isAuthenticated: status === "authenticated", identifierType: auth.identifierType, login, logout }),
    [status, auth.identifierType, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
