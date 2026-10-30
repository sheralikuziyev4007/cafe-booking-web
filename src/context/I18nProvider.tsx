import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { I18nContext } from "./i18nContext";
import { DICTIONARIES, detectLang, isLang, pickText } from "@/i18n";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Lang, Localized } from "@/types";

const STORAGE_KEY = "coffee-and-co:lang";

const parseLang = (raw: unknown): Lang | null => (isLang(raw) ? raw : null);

interface I18nProviderProps {
  children: ReactNode;
  /** Forces the initial language (used in tests) */
  initialLang?: Lang;
}

export function I18nProvider({ children, initialLang }: I18nProviderProps) {
  const [lang, setLangState] = useLocalStorage<Lang>(STORAGE_KEY, initialLang ?? detectLang(), parseLang);
  const t = DICTIONARIES[lang];

  // Keep <html lang>, the title and the meta description in sync for screen readers and SEO
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  const setLang = useCallback((next: Lang) => setLangState(next), [setLangState]);
  const pick = useCallback((text: Localized) => pickText(text, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, pick }), [lang, setLang, t, pick]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
