import { isRecord } from "./menuStorage";
import type { Booking, BookingStatus, ContactMessage } from "@/types";

const STATUSES: BookingStatus[] = ["new", "confirmed", "cancelled"];

const isString = (v: unknown): v is string => typeof v === "string";

/** Drops broken entries instead of discarding the whole list */
export function parseBookings(raw: unknown): Booking[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter(
    (b): b is Booking =>
      isRecord(b) &&
      isString(b.id) &&
      isString(b.name) &&
      isString(b.phone) &&
      isString(b.date) &&
      isString(b.time) &&
      typeof b.guests === "number" &&
      isString(b.comment) &&
      STATUSES.includes(b.status as BookingStatus) &&
      isString(b.createdAt)
  );
}

export function parseMessages(raw: unknown): ContactMessage[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter(
    (m): m is ContactMessage =>
      isRecord(m) &&
      isString(m.id) &&
      isString(m.name) &&
      isString(m.contact) &&
      isString(m.message) &&
      typeof m.read === "boolean" &&
      isString(m.createdAt)
  );
}
