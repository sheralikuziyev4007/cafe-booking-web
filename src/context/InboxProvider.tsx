import { useMemo, type ReactNode } from "react";
import { InboxContext, type NewBooking, type NewMessage } from "./inboxContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { parseBookings, parseMessages } from "@/utils/inboxStorage";
import { generateId } from "@/utils/id";
import type { Booking, BookingStatus, ContactMessage } from "@/types";

const BOOKINGS_KEY = "coffee-and-co:bookings:v1";
const MESSAGES_KEY = "coffee-and-co:messages:v1";

/**
 * Booking requests and contact messages for the admin panel.
 * Demo storage: localStorage of the current browser. To share data between devices,
 * replace this provider with a backend (e.g. Supabase) — the components don't need to change.
 */
export function InboxProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useLocalStorage<Booking[]>(BOOKINGS_KEY, [], parseBookings);
  const [messages, setMessages] = useLocalStorage<ContactMessage[]>(MESSAGES_KEY, [], parseMessages);

  const value = useMemo(
    () => ({
      bookings,
      messages,
      addBooking: (booking: NewBooking) =>
        setBookings((prev) => [{ ...booking, id: generateId(), status: "new", createdAt: new Date().toISOString() }, ...prev]),
      setBookingStatus: (id: string, status: BookingStatus) =>
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b))),
      deleteBooking: (id: string) => setBookings((prev) => prev.filter((b) => b.id !== id)),
      addMessage: (message: NewMessage) =>
        setMessages((prev) => [{ ...message, id: generateId(), read: false, createdAt: new Date().toISOString() }, ...prev]),
      markMessageRead: (id: string) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m))),
      deleteMessage: (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id)),
    }),
    [bookings, messages, setBookings, setMessages]
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}
