import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// The same key is read by the inline script in index.html to avoid a flash of the wrong theme
export const THEME_STORAGE_KEY = "coffee-and-co:theme";

const parseTheme = (raw: unknown): Theme | null => (raw === "light" || raw === "dark" ? raw : null);

function systemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, systemTheme(), parseTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((prev) => (prev === "dark" ? "light" : "dark")), [setTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
