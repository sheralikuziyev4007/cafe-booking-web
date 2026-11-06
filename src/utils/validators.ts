import type { Dictionary } from "@/i18n";
import type { Localized, MenuItemInput } from "@/types";
import { isValidPhone } from "./phone";

export { isValidPhone };

/** Validators return error codes; components turn them into text with errorMessage(). */
export type ErrorCode = keyof Dictionary["errors"];
export type FormErrors<T> = Partial<Record<keyof T, ErrorCode>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidImageUrl(value: string): boolean {
  // Local file from public/, e.g. "/images/raf.webp"
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasAnyText(text: Localized): boolean {
  return Object.values(text).some((v) => v.trim() !== "");
}

/** Menu item form: the price is kept as a string while the user is typing. */
export interface MenuFormState extends Omit<MenuItemInput, "price"> {
  price: string;
}

export interface BookingRules {
  /** Today's date as YYYY-MM-DD (passed in so the function stays pure and testable) */
  today: string;
  maxDaysAhead: number;
  /** Allowed time slots, HH:MM */
  slots: string[];
  maxGuests: number;
  /** Current local time as HH:MM. When set, slots that have already started today are rejected */
  nowTime?: string;
}

/** Adds days to a YYYY-MM-DD date without time zone surprises */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Local time as HH:MM */
export function toLocalTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Local (not UTC) date as YYYY-MM-DD */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
