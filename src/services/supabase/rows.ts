import { isRecord, parseMenu } from "@/utils/menuStorage";
import { parseBookings, parseMessages } from "@/utils/inboxStorage";
import type { Booking, ContactMessage, MenuItem, MenuItemInput, NewBooking, NewMessage } from "@/types";

/**
 * Converts between the app's types and the database rows (snake_case, see supabase/schema.sql).
 * Rows are validated at runtime, so unexpected data from the server is dropped instead of crashing the UI.
 */

export function parseMenuRows(raw: unknown): MenuItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    if (!isRecord(row)) return [];
    const entry = {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: row.price,
      imageUrl: row.image_url,
      isAvailable: row.is_available,
    };
    // parseMenu validates one entry at a time and drops broken ones
    return parseMenu([entry]) ?? [];
  });
}

export function toMenuRow(item: MenuItemInput) {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    image_url: item.imageUrl,
    is_available: item.isAvailable,
  };
}

export function parseBookingRows(raw: unknown): Booking[] {
  if (!Array.isArray(raw)) return [];
  return parseBookings(
    raw.map((row) =>
      isRecord(row)
        ? { id: row.id, name: row.name, phone: row.phone, date: row.booking_date, time: row.booking_time, guests: row.guests, comment: row.comment, status: row.status, createdAt: row.created_at }
        : row
    )
  ) ?? [];
}

export function toBookingRow(booking: NewBooking) {
  return {
    name: booking.name,
    phone: booking.phone,
    booking_date: booking.date,
    booking_time: booking.time,
    guests: booking.guests,
    comment: booking.comment,
  };
}

export function parseMessageRows(raw: unknown): ContactMessage[] {
  if (!Array.isArray(raw)) return [];
  return parseMessages(
    raw.map((row) =>
      isRecord(row) ? { id: row.id, name: row.name, contact: row.contact, message: row.message, read: row.is_read, createdAt: row.created_at } : row
    )
  ) ?? [];
}

export function toMessageRow(message: NewMessage) {
  return { name: message.name, contact: message.contact, message: message.message };
}
