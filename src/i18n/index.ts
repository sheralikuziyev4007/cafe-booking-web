import { en, type Dictionary } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";
import type { Lang, Localized } from "@/types";

export type { Dictionary };

export const DICTIONARIES: Record<Lang, Dictionary> = { en, ru, uz };

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "en", label: "EN", name: "English" },
  { id: "ru", label: "RU", name: "Русский" },
  { id: "uz", label: "UZ", name: "Oʻzbekcha" },
];

export const DEFAULT_LANG: Lang = "en";

/** BCP 47 locale used for Intl formatting */
export const INTL_LOCALE: Record<Lang, string> = { en: "en-GB", ru: "ru-RU", uz: "uz-Latn-UZ" };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ru" || value === "uz";
}

/** Picks the text for `lang`; if it is empty, falls back to English, Russian, then Uzbek. */
export function pickText(text: Localized, lang: Lang): string {
  return text[lang].trim() || text.en.trim() || text.ru.trim() || text.uz.trim();
}

/** Language from the browser settings, or the default one */
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const code = candidate.slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return DEFAULT_LANG;
}
