import { generateId } from "@/utils/id";
import { parseBookings, parseMessages } from "@/utils/inboxStorage";
import type { Booking, ContactMessage } from "@/types";
import type { InboxRepository } from "../types";
import { createJsonStore } from "./jsonStore";

export const BOOKINGS_STORAGE_KEY = "coffee-and-co:bookings:v1";
export const MESSAGES_STORAGE_KEY = "coffee-and-co:messages:v1";

/** Demo storage: bookings and messages live in this browser's localStorage. */
export function createLocalInboxRepository(): InboxRepository {
  const bookings = createJsonStore<Booking[]>(BOOKINGS_STORAGE_KEY, parseBookings, () => []);
  const messages = createJsonStore<ContactMessage[]>(MESSAGES_STORAGE_KEY, parseMessages, () => []);

  const changeBookings = (fn: (list: Booking[]) => Booking[]) => {
    bookings.write(fn(bookings.read()));
    return Promise.resolve();
  };
  const changeMessages = (fn: (list: ContactMessage[]) => ContactMessage[]) => {
    messages.write(fn(messages.read()));
    return Promise.resolve();
  };

  return {
    peekBookings: () => bookings.read(),
    peekMessages: () => messages.read(),
    listBookings: () => Promise.resolve(bookings.read()),
    createBooking: (booking) =>
      changeBookings((list) => [{ ...booking, id: generateId(), status: "new", createdAt: new Date().toISOString() }, ...list]),
    setBookingStatus: (id, status) => changeBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b))),
    deleteBooking: (id) => changeBookings((list) => list.filter((b) => b.id !== id)),
    listMessages: () => Promise.resolve(messages.read()),
    createMessage: (message) =>
      changeMessages((list) => [{ ...message, id: generateId(), read: false, createdAt: new Date().toISOString() }, ...list]),
    markMessageRead: (id) => changeMessages((list) => list.map((m) => (m.id === id ? { ...m, read: true } : m))),
    deleteMessage: (id) => changeMessages((list) => list.filter((m) => m.id !== id)),
  };
}
