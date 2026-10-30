/**
 * Phone numbers: Uzbekistan (+998 XX XXX XX XX) is the default; other countries are accepted
 * in international format starting with "+".
 */

export const UZ_CODE = "998";
/** 998 + 9 digits */
const UZ_LENGTH = 12;
/** E.164: at most 15 digits; 8 is the shortest real international number we accept */
const INTL_MIN = 8;
const INTL_MAX = 15;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normalises what the user typed into the digits of a full international number.
 * Without "+": up to 9 digits are a local Uzbek number (998 is added); a longer number
 * starting with 998 is treated as already complete.
 */
function toFullDigits(value: string): { digits: string; international: boolean } {
  const trimmed = value.trim();
  const digits = onlyDigits(trimmed);
  if (trimmed.startsWith("+")) return { digits, international: true };
  if (digits.length > 9 && digits.startsWith(UZ_CODE)) return { digits, international: true };
  return { digits: digits ? UZ_CODE + digits : "", international: false };
}

/** "+998901234567" / "90 123-45-67" → "+998 90 123 45 67"; partial input is formatted as far as typed */
export function formatPhone(value: string): string {
  const trimmed = value.trim();
  const { digits } = toFullDigits(trimmed);
  if (!digits) return trimmed.startsWith("+") ? "+" : "";

  if (digits.startsWith(UZ_CODE)) {
    const d = digits.slice(0, UZ_LENGTH);
    const parts = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
    return `+${parts.join(" ")}`;
  }
  return `+${digits.slice(0, INTL_MAX)}`;
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  // Only digits, spaces, brackets, dashes and a leading plus are allowed
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return false;
  const { digits } = toFullDigits(trimmed);
  if (digits.startsWith(UZ_CODE)) return digits.length === UZ_LENGTH;
  return trimmed.startsWith("+") && digits.length >= INTL_MIN && digits.length <= INTL_MAX;
}
