import { QueryClient } from "@tanstack/react-query";

/** One place for every query key, so queries and invalidations can't drift apart */
export const queryKeys = {
  menu: ["menu"] as const,
  bookings: ["bookings"] as const,
  messages: ["messages"] as const,
  /** All availability queries (prefix) or one day */
  availability: (isoDate?: string) => (isoDate ? (["availability", isoDate] as const) : (["availability"] as const)),
};

interface QueryClientOptions {
  /** Failed queries are retried this many times before the error state is shown (tests pass false) */
  retry?: number | false;
}

export function createQueryClient({ retry = 1 }: QueryClientOptions = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: { retry, staleTime: 30_000 },
      mutations: { retry: false },
    },
  });
}
