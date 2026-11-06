import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { BOOKINGS_STORAGE_KEY, MESSAGES_STORAGE_KEY } from "@/services/local/localInboxRepository";
import { MENU_STORAGE_KEY } from "@/services/local/localMenuRepository";

const QUERY_KEY_BY_STORAGE_KEY: Record<string, readonly unknown[]> = {
  [MENU_STORAGE_KEY]: queryKeys.menu,
  [BOOKINGS_STORAGE_KEY]: queryKeys.bookings,
  [MESSAGES_STORAGE_KEY]: queryKeys.messages,
};

/**
 * Demo mode only: when another tab changes the data (e.g. the owner edits the menu in /admin),
 * this tab reloads it at once. With a real backend, queries refetch on their own.
 */
export function StorageSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      // key === null means the whole storage was cleared
      const keys = event.key === null ? Object.values(QUERY_KEY_BY_STORAGE_KEY) : [QUERY_KEY_BY_STORAGE_KEY[event.key]].filter(Boolean);
      keys.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient]);

  return null;
}
