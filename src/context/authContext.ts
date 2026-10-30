import { createContext } from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  /** Returns true on successful sign-in */
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
