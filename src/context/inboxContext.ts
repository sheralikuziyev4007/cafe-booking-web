import { createContext } from "react";
import type { Booking, BookingStatus, ContactMessage } from "@/types";

export type NewBooking = Omit<Booking, "id" | "status" | "createdAt">;
export type NewMessage = Omit<ContactMessage, "id" | "read" | "createdAt">;

export interface InboxContextValue {
  bookings: Booking[];
  messages: ContactMessage[];
  addBooking: (booking: NewBooking) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;
  addMessage: (message: NewMessage) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
}

export const InboxContext = createContext<InboxContextValue | undefined>(undefined);
