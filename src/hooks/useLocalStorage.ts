import { useEffect, useRef, useState } from "react";

/**
 * Reads the value from localStorage on init and saves it on every change.
 *
 * `initialValue` may be a function (called only when nothing valid is stored).
 * `parse` (optional) validates the stored data: if it returns null the data is
 * treated as corrupted and `initialValue` is used.
 * Changes made in other tabs of the same site are picked up via the `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T), parse?: (raw: unknown) => T | null) {
  const [value, setValue] = useState<T>(() => {
    const fallback = () => (initialValue instanceof Function ? initialValue() : initialValue);
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return fallback();
      const raw: unknown = JSON.parse(stored);
      if (!parse) return raw as T;
      return parse(raw) ?? fallback();
    } catch {
      return fallback();
    }
  });

  // Keep the parse function in a ref so the listener below isn't re-attached on every render
  const parseRef = useRef(parse);
  parseRef.current = parse;

  // Another tab changed the same key (e.g. the admin edited the menu) — pick up the new value at once
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || event.key !== key || event.newValue === null) return;
      try {
        const raw: unknown = JSON.parse(event.newValue);
        const next = parseRef.current ? parseRef.current(raw) : (raw as T);
        if (next !== null) setValue(next);
      } catch {
        // ignore a value we can't read — keep the current state
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable (private mode etc.) — ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
