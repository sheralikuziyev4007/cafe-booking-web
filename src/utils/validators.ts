import type { Dictionary } from "@/i18n";
import type { BookingFormData, ContactFormData, Localized, MenuItemInput } from "@/types";
import { isValidPhone } from "./phone";
import { parseDateText } from "./date";

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

export function validateContactForm(form: ContactFormData): FormErrors<ContactFormData> {
  const errors: FormErrors<ContactFormData> = {};

  if (!form.name.trim()) errors.name = "required";

  const contact = form.contact.trim();
  if (!contact) errors.contact = "required";
  // "@" means the visitor is typing an email; otherwise it must be a complete phone number
  else if (contact.includes("@") ? !isValidEmail(contact) : !isValidPhone(contact)) errors.contact = "invalidContact";

  if (!form.message.trim()) errors.message = "required";

  return errors;
}

/** Menu item form: the price is kept as a string while the user is typing. */
export interface MenuFormState extends Omit<MenuItemInput, "price"> {
  price: string;
}

export function validateMenuForm(form: MenuFormState): FormErrors<MenuFormState> {
  const errors: FormErrors<MenuFormState> = {};

  if (!hasAnyText(form.name)) errors.name = "needOneLanguage";

  const price = form.price.trim();
  if (!/^\d+$/.test(price) || Number(price) <= 0) errors.price = "invalidPrice";

  const image = form.imageUrl.trim();
  if (image && !isValidImageUrl(image)) errors.imageUrl = "invalidImageUrl";

  if (!hasAnyText(form.description)) errors.description = "needOneLanguage";

  return errors;
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

export function validateBookingForm(form: BookingFormData, rules: BookingRules): FormErrors<BookingFormData> {
  const errors: FormErrors<BookingFormData> = {};

  if (!form.name.trim()) errors.name = "required";

  // "+998" alone (the pre-filled country code) counts as empty
  if (form.phone.replace(/\D/g, "").length <= 3) errors.phone = "required";
  else if (!isValidPhone(form.phone)) errors.phone = "invalidPhone";

  // form.date is what the user typed: dd/mm/yyyy
  const isoDate = parseDateText(form.date);
  if (!form.date.trim()) errors.date = "required";
  else if (!isoDate) errors.date = "invalidDate";
  else if (isoDate < rules.today) errors.date = "dateInPast";
  else if (isoDate > addDays(rules.today, rules.maxDaysAhead)) errors.date = "dateTooFar";

  if (!form.time) errors.time = "required";
  else if (!rules.slots.includes(form.time)) errors.time = "timeOutOfHours";
  else if (isoDate === rules.today && rules.nowTime && form.time <= rules.nowTime) errors.time = "timePassed";

  const guests = Number(form.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > rules.maxGuests) errors.guests = "invalidGuests";

  return errors;
}
