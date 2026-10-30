import { createContext } from "react";
import type { Dictionary } from "@/i18n";
import type { Lang, Localized } from "@/types";

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
  /** Localized content (menu, reviews) in the current language with fallback */
  pick: (text: Localized) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
