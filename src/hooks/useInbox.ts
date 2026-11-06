import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { useServices } from "./useServices";
import type { Booking, BookingStatus, ContactMessage, NewBooking, NewMessage } from "@/types";

/** With a real backend the admin panel checks for new requests once a minute */
const POLL_MS = 60_000;

/** Bookings for the admin panel (only call it on admin pages) */
export function useBookings() {
  const { inbox, mode } = useServices();
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => inbox.listBookings(),
    initialData: () => inbox.peekBookings?.(),
    refetchInterval: mode === "supabase" ? POLL_MS : false,
  });
}

/** Contact messages for the admin panel (only call it on admin pages) */
export function useMessages() {
  const { inbox, mode } = useServices();
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: () => inbox.listMessages(),
    initialData: () => inbox.peekMessages?.(),
    refetchInterval: mode === "supabase" ? POLL_MS : false,
  });
}

/** How busy each time slot is on a day. Disabled until the date is a valid yyyy-mm-dd. */
export function useAvailability(isoDate: string | null) {
  const { inbox } = useServices();
  return useQuery({
    queryKey: queryKeys.availability(isoDate ?? ""),
    queryFn: () => inbox.getAvailability(isoDate ?? ""),
    enabled: isoDate !== null,
    // Seats are taken all the time: do not trust a cached answer for long
    staleTime: 10_000,
  });
}

/** What visitors do on the landing page: send a booking request or a message */
export function useVisitorActions() {
  const { inbox } = useServices();
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: (booking: NewBooking) => inbox.createBooking(booking),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability() });
      return queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
  const createMessage = useMutation({
    mutationFn: (message: NewMessage) => inbox.createMessage(message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages }),
  });
  return { createBooking, createMessage };
}

/** Owner actions on bookings and messages. Changes show up at once and are rolled back if the request fails. */
export function useInboxActions() {
  const { inbox } = useServices();
  const queryClient = useQueryClient();

  const optimistic = <T, V>(key: readonly unknown[], apply: (list: T[], variables: V) => T[]) => ({
    onMutate: async (variables: V): Promise<{ previous: T[] | undefined }> => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<T[]>(key);
      if (previous) queryClient.setQueryData<T[]>(key, apply(previous, variables));
      return { previous };
    },
    onError: (_error: Error, _variables: V, context: { previous: T[] | undefined } | undefined) => {
      if (context?.previous) queryClient.setQueryData<T[]>(key, context.previous);
    },
    onSettled: () => {
      if (key === queryKeys.bookings) void queryClient.invalidateQueries({ queryKey: queryKeys.availability() });
      return queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const setBookingStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => inbox.setBookingStatus(id, status),
    ...optimistic<Booking, { id: string; status: BookingStatus }>(queryKeys.bookings, (list, { id, status }) =>
      list.map((b) => (b.id === id ? { ...b, status } : b))
    ),
  });

  const deleteBooking = useMutation({
    mutationFn: (id: string) => inbox.deleteBooking(id),
    ...optimistic<Booking, string>(queryKeys.bookings, (list, id) => list.filter((b) => b.id !== id)),
  });

  const markMessageRead = useMutation({
    mutationFn: (id: string) => inbox.markMessageRead(id),
    ...optimistic<ContactMessage, string>(queryKeys.messages, (list, id) => list.map((m) => (m.id === id ? { ...m, read: true } : m))),
  });

  const deleteMessage = useMutation({
    mutationFn: (id: string) => inbox.deleteMessage(id),
    ...optimistic<ContactMessage, string>(queryKeys.messages, (list, id) => list.filter((m) => m.id !== id)),
  });

  return { setBookingStatus, deleteBooking, markMessageRead, deleteMessage };
}
