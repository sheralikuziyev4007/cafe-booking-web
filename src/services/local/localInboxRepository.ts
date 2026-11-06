import { SITE } from "@/config/site";
import { generateId } from "@/utils/id";
import { parseBookings, parseMessages } from "@/utils/inboxStorage";
import type { Booking, ContactMessage } from "@/types";
import { SlotFullError } from "../errors";
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
  const capacity = SITE.booking.tablesPerSlot;
  const activeInSlot = (list: Booking[], date: string, time: string, exceptId?: string) =>
    list.filter((b) => b.date === date && b.time === time && b.status !== "cancelled" && b.id !== exceptId).length;
  const changeMessages = (fn: (list: ContactMessage[]) => ContactMessage[]) => {
    messages.write(fn(messages.read()));
    return Promise.resolve();
  };

  return {
    peekBookings: () => bookings.read(),
    peekMessages: () => messages.read(),
    listBookings: () => Promise.resolve(bookings.read()),
    createBooking: (booking) => {
      if (activeInSlot(bookings.read(), booking.date, booking.time) >= capacity) return Promise.reject(new SlotFullError());
      return changeBookings((list) => [{ ...booking, id: generateId(), status: "new", createdAt: new Date().toISOString() }, ...list]);
    },
    getAvailability: (isoDate) => {
      const booked: Record<string, number> = {};
      for (const b of bookings.read()) {
        if (b.date === isoDate && b.status !== "cancelled") booked[b.time] = (booked[b.time] ?? 0) + 1;
      }
      return Promise.resolve({ capacity, booked });
    },
    setBookingStatus: (id, status) => {
      const target = bookings.read().find((b) => b.id === id);
      // Restoring a cancelled booking needs a free seat again
      if (target && target.status === "cancelled" && status !== "cancelled" && activeInSlot(bookings.read(), target.date, target.time, id) >= capacity) {
        return Promise.reject(new SlotFullError());
      }
      return changeBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    },
    deleteBooking: (id) => changeBookings((list) => list.filter((b) => b.id !== id)),
    listMessages: () => Promise.resolve(messages.read()),
    createMessage: (message) =>
      changeMessages((list) => [{ ...message, id: generateId(), read: false, createdAt: new Date().toISOString() }, ...list]),
    markMessageRead: (id) => changeMessages((list) => list.map((m) => (m.id === id ? { ...m, read: true } : m))),
    deleteMessage: (id) => changeMessages((list) => list.filter((m) => m.id !== id)),
  };
}
