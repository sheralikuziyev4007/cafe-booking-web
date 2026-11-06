import { describe, expect, it } from "vitest";
import {
  TELEGRAM_MAX_LENGTH,
  buildSendMessageRequest,
  escapeHtml,
  formatNotification,
  isAuthorized,
  parseWebhookPayload,
} from "./telegram";

const bookingPayload = {
  type: "INSERT",
  schema: "public",
  table: "bookings",
  record: {
    id: "b1",
    name: "Aziz",
    phone: "+998 90 123 45 67",
    booking_date: "2026-11-12",
    booking_time: "19:30",
    guests: 4,
    comment: "Window table",
    status: "new",
  },
};

describe("parseWebhookPayload", () => {
  it("reads a new booking", () => {
    expect(parseWebhookPayload(bookingPayload)).toEqual({
      kind: "booking",
      name: "Aziz",
      phone: "+998 90 123 45 67",
      date: "2026-11-12",
      time: "19:30",
      guests: 4,
      comment: "Window table",
    });
  });

  it("reads a new message", () => {
    const payload = { type: "INSERT", schema: "public", table: "messages", record: { name: "Dilya", contact: "@dilya", message: "Hi" } };
    expect(parseWebhookPayload(payload)).toEqual({ kind: "message", name: "Dilya", contact: "@dilya", message: "Hi" });
  });

  it("ignores updates, deletes, other tables and other schemas", () => {
    expect(parseWebhookPayload({ ...bookingPayload, type: "UPDATE" })).toBeNull();
    expect(parseWebhookPayload({ ...bookingPayload, type: "DELETE" })).toBeNull();
    expect(parseWebhookPayload({ ...bookingPayload, table: "menu_items" })).toBeNull();
    expect(parseWebhookPayload({ ...bookingPayload, schema: "private" })).toBeNull();
  });

  it("rejects malformed payloads without throwing", () => {
    expect(parseWebhookPayload(null)).toBeNull();
    expect(parseWebhookPayload("text")).toBeNull();
    expect(parseWebhookPayload([])).toBeNull();
    expect(parseWebhookPayload({ ...bookingPayload, record: null })).toBeNull();
    expect(parseWebhookPayload({ ...bookingPayload, record: { ...bookingPayload.record, guests: "4" } })).toBeNull();
  });
});

describe("formatNotification", () => {
  it("formats a booking with a readable date", () => {
    const event = parseWebhookPayload(bookingPayload);
    expect(event).not.toBeNull();
    const text = formatNotification(event!);
    expect(text).toContain("New table booking");
    expect(text).toContain("12.11.2026 at 19:30");
    expect(text).toContain("4 guests");
    expect(text).toContain("Window table");
  });

  it("uses the singular for one guest and skips an empty comment", () => {
    const text = formatNotification({ kind: "booking", name: "A", phone: "123456", date: "2026-11-12", time: "10:00", guests: 1, comment: "  " });
    expect(text).toContain("1 guest");
    expect(text).not.toContain("guests");
    expect(text).not.toContain("💬");
  });

  it("escapes HTML so a visitor cannot inject tags", () => {
    const text = formatNotification({ kind: "message", name: "<b>Eve</b>", contact: "a&b", message: '<a href="x">click</a>' });
    expect(text).not.toContain("<b>Eve");
    expect(text).toContain("&lt;b&gt;Eve&lt;/b&gt;");
    expect(text).toContain("a&amp;b");
    expect(text).toContain("&lt;a href=");
  });

  it("never exceeds the Telegram message limit", () => {
    const text = formatNotification({ kind: "message", name: "x".repeat(5000), contact: "c", message: "m".repeat(10000) });
    expect(text.length).toBeLessThanOrEqual(TELEGRAM_MAX_LENGTH);
  });
});

describe("escapeHtml", () => {
  it("escapes the three characters Telegram HTML mode cares about", () => {
    expect(escapeHtml("<&>")).toBe("&lt;&amp;&gt;");
  });
});

describe("isAuthorized", () => {
  it("accepts only the exact secret", () => {
    expect(isAuthorized("s3cret", "s3cret")).toBe(true);
    expect(isAuthorized("s3creT", "s3cret")).toBe(false);
    expect(isAuthorized("s3cret-longer", "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
    expect(isAuthorized("", "")).toBe(false);
  });
});

describe("buildSendMessageRequest", () => {
  it("targets the bot API and sends HTML text to the chat", () => {
    const { url, init } = buildSendMessageRequest("123:ABC", "-100", "hello");
    expect(url).toBe("https://api.telegram.org/bot123:ABC/sendMessage");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ chat_id: "-100", text: "hello", parse_mode: "HTML", disable_web_page_preview: true });
  });
});
