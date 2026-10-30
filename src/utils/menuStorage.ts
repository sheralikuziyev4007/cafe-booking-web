import { CATEGORIES } from "@/data/seedData";
import type { Category, Localized, MenuItem } from "@/types";

const CATEGORY_IDS = new Set<string>(CATEGORIES);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Accepts both the current format ({ en, ru, uz }) and the legacy single-language string.
 * A legacy string is copied into every language so nothing disappears after an update.
 */
export function parseLocalized(value: unknown): Localized | null {
  if (typeof value === "string") return { en: value, ru: value, uz: value };
  if (!isRecord(value)) return null;
  const read = (key: string) => (typeof value[key] === "string" ? (value[key] as string) : "");
  const result = { en: read("en"), ru: read("ru"), uz: read("uz") };
  return result.en || result.ru || result.uz ? result : null;
}

/**
 * Validates and normalises menu data read from localStorage.
 * Broken entries are dropped one by one, so a single bad item does not wipe the whole menu.
 * Returns null only if the data is unusable (not an array, or every entry is broken) —
 * then the initial menu is used instead. An intentionally empty menu ([]) is kept.
 */
export function parseMenu(raw: unknown): MenuItem[] | null {
  if (!Array.isArray(raw)) return null;

  const result: MenuItem[] = [];
  for (const entry of raw) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.price !== "number" ||
      !Number.isFinite(entry.price) ||
      typeof entry.category !== "string" ||
      !CATEGORY_IDS.has(entry.category)
    ) {
      continue;
    }
    const name = parseLocalized(entry.name);
    const description = parseLocalized(entry.description);
    if (!name || !description) continue;

    result.push({
      id: entry.id,
      name,
      description,
      category: entry.category as Category,
      price: entry.price,
      imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
      isAvailable: typeof entry.isAvailable === "boolean" ? entry.isAvailable : true,
    });
  }
  return raw.length > 0 && result.length === 0 ? null : result;
}
