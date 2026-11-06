/**
 * One value stored as JSON in localStorage.
 *
 * `parse` validates what was stored: if it returns null the data is treated as corrupted and `initial()` is used.
 * If localStorage is unavailable (private mode, quota) the value is kept in memory for the current page,
 * so the app keeps working, just without persistence.
 */
export function createJsonStore<T>(key: string, parse: (raw: unknown) => T | null, initial: () => T) {
  let inMemory: T | null = null;

  return {
    key,
    read(): T {
      if (inMemory !== null) return inMemory;
      try {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) {
          const parsed = parse(JSON.parse(stored));
          if (parsed !== null) return parsed;
        }
      } catch {
        // unreadable data — fall through to the initial value
      }
      return initial();
    },
    write(value: T): void {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        inMemory = null;
      } catch {
        inMemory = value;
      }
    },
  };
}
