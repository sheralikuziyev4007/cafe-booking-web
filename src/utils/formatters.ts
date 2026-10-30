import { SITE } from "@/config/site";
import { INTL_LOCALE, type Dictionary } from "@/i18n";
import type { Lang } from "@/types";
import type { ErrorCode } from "./validators";

/** 28000 → "28,000 UZS" (en), "28 000 сум" (ru), "28 000 soʻm" (uz) */
export function formatMoney(amount: number, lang: Lang): string {
  // Russian grouping (space) for ru and uz, comma grouping for en
  const number = amount.toLocaleString(lang === "en" ? "en-US" : "ru-RU");
  return `${number} ${SITE.currency.label[lang]}`;
}

/** "2026-10-28" → "28 Oct 2026" in the current language */
export function formatDate(isoDate: string, lang: Lang): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

/** ISO timestamp → short local date and time */
export function formatDateTime(isoTimestamp: string, lang: Lang): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function errorMessage(t: Dictionary, code: ErrorCode | undefined): string | undefined {
  if (!code) return undefined;
  const entry = t.errors[code];
  return typeof entry === "function" ? entry(SITE.booking.maxDaysAhead) : entry;
}

/** "08:00".."21:00" every `step` minutes */
export function buildTimeSlots(first: string, last: string, step: number): string[] {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const slots: string[] = [];
  for (let t = toMinutes(first); t <= toMinutes(last); t += step) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
}
