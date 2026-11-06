import { createContext } from "react";
import type { LoginResult } from "@/services/types";

/** "loading" only happens with a real backend, while the saved session is being checked */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  /** What the login form asks for: a demo username or an email address */
  identifierType: "username" | "email";
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
