/**
 * Pure helpers for the notify-telegram Edge Function.
 * No Deno or network APIs here, so everything can be unit tested with Vitest.
 */

export type NotifyEvent =
  | {
      kind: "booking";
      name: string;
      phone: string;
      date: string;
      time: string;
      guests: number;
      comment: string;
    }
  | { kind: "message"; name: string; contact: string; message: string };

/** Telegram rejects messages longer than 4096 characters */
export const TELEGRAM_MAX_LENGTH = 4096;

const asString = (value: unknown): string | null => (typeof value === "string" ? value : null);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Reads a Supabase Database Webhook payload ({ type, table, schema, record }).
 * Returns null for anything that is not a new row in public.bookings or public.messages.
 */
export function parseWebhookPayload(payload: unknown): NotifyEvent | null {
  if (!isRecord(payload) || payload.type !== "INSERT" || payload.schema !== "public") return null;
  const record = payload.record;
  if (!isRecord(record)) return null;

  if (payload.table === "bookings") {
    const name = asString(record.name);
    const phone = asString(record.phone);
    const date = asString(record.booking_date);
    const time = asString(record.booking_time);
    const guests = typeof record.guests === "number" ? record.guests : null;
    if (name === null || phone === null || date === null || time === null || guests === null) return null;
    return { kind: "booking", name, phone, date, time, guests, comment: asString(record.comment) ?? "" };
  }

  if (payload.table === "messages") {
    const name = asString(record.name);
    const contact = asString(record.contact);
    const message = asString(record.message);
    if (name === null || contact === null || message === null) return null;
    return { kind: "message", name, contact, message };
  }

  return null;
}

/** Visitor text goes into an HTML message, so it must never be able to add tags */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** "2026-11-12" -> "12.11.2026" (anything else is shown as received) */
function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : iso;
}

export function formatNotification(event: NotifyEvent): string {
  if (event.kind === "booking") {
    const lines = [
      "🪑 <b>New table booking</b>",
      `👤 ${escapeHtml(event.name)}`,
      `📞 ${escapeHtml(event.phone)}`,
      `📅 ${escapeHtml(formatDate(event.date))} at ${escapeHtml(event.time)}`,
      `👥 ${event.guests} ${event.guests === 1 ? "guest" : "guests"}`,
    ];
    if (event.comment.trim()) lines.push(`💬 ${escapeHtml(truncate(event.comment.trim(), 500))}`);
    return truncate(lines.join("\n"), TELEGRAM_MAX_LENGTH);
  }

  return truncate(
    [
      "✉️ <b>New message</b>",
      `👤 ${escapeHtml(event.name)}`,
      `📞 ${escapeHtml(event.contact)}`,
      "",
      escapeHtml(truncate(event.message.trim(), 2000)),
    ].join("\n"),
    TELEGRAM_MAX_LENGTH,
  );
}

/** Constant-time comparison, so response timing does not reveal the secret */
export function isAuthorized(received: string | null, expected: string): boolean {
  if (!received || !expected || received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function buildSendMessageRequest(token: string, chatId: string, text: string) {
  return {
    url: `https://api.telegram.org/bot${token}/sendMessage`,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    },
  };
}
