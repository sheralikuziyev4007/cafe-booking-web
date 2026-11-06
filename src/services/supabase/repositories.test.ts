import { describe, expect, it } from "vitest";
import { createFakeSupabase } from "@/test/fakeSupabase";
import { SlotFullError } from "../errors";
import { createSupabaseInboxRepository } from "./supabaseInboxRepository";
import { createSupabaseMenuRepository } from "./supabaseMenuRepository";

const menuRow = (id: string, position: number, extra: Record<string, unknown> = {}) => ({
  id,
  name: { en: `Item ${id}`, ru: "", uz: "" },
  description: { en: "Tasty", ru: "", uz: "" },
  category: "desserts",
  price: 30000,
  image_url: "",
  is_available: true,
  position,
  ...extra,
});

describe("Supabase menu repository", () => {
  it("lists items ordered by position", async () => {
    const { client, calls } = createFakeSupabase({ menu_items: [menuRow("b", 2), menuRow("a", 1), menuRow("c", 3)] });
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    const items = await repo.list();

    expect(items.map((i) => i.id)).toEqual(["a", "b", "c"]);
    expect(calls[0]).toMatchObject({ table: "menu_items", op: "select", order: { column: "position", ascending: true } });
  });

  it("creates an item without sending id or position (the database fills them in)", async () => {
    const { client, calls } = createFakeSupabase();
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    await repo.create({ name: { en: "Tiramisu", ru: "", uz: "" }, description: { en: "Cake", ru: "", uz: "" }, category: "desserts", price: 36000, imageUrl: "", isAvailable: true });

    expect(calls[0].op).toBe("insert");
    expect(calls[0].payload).toEqual({
      name: { en: "Tiramisu", ru: "", uz: "" },
      description: { en: "Cake", ru: "", uz: "" },
      category: "desserts",
      price: 36000,
      image_url: "",
      is_available: true,
    });
  });

  it("updates, hides and deletes by id", async () => {
    const { client, tables } = createFakeSupabase({ menu_items: [menuRow("a", 1), menuRow("b", 2)] });
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    await repo.setAvailability("a", false);
    expect(tables.menu_items[0].is_available).toBe(false);

    await repo.update("b", { name: { en: "Renamed", ru: "", uz: "" }, description: { en: "x", ru: "", uz: "" }, category: "coffee", price: 1000, imageUrl: "/images/x.webp", isAvailable: true });
    expect(tables.menu_items[1]).toMatchObject({ category: "coffee", price: 1000, image_url: "/images/x.webp" });

    await repo.remove("a");
    expect(tables.menu_items.map((r) => r.id)).toEqual(["b"]);
  });

  it("reports a change that did not happen (missing row or no permission) instead of staying silent", async () => {
    const { client } = createFakeSupabase({ menu_items: [menuRow("a", 1)] });
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    await expect(repo.setAvailability("missing", false)).rejects.toThrow("Nothing was changed");
    await expect(repo.remove("missing")).rejects.toThrow("Nothing was changed");
  });

  it("moves an item with the move_menu_item function", async () => {
    const { client, rpcCalls } = createFakeSupabase();
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    await repo.move("a", -1);

    expect(rpcCalls).toEqual([{ name: "move_menu_item", args: { item_id: "a", direction: -1 } }]);
  });

  it("turns server errors into regular errors", async () => {
    const { client } = createFakeSupabase({}, { error: "JWT expired" });
    const repo = createSupabaseMenuRepository(() => Promise.resolve(client));

    await expect(repo.list()).rejects.toThrow("JWT expired");
    await expect(repo.move("a", 1)).rejects.toThrow("JWT expired");
  });

  it("fails when the client cannot be created", async () => {
    const repo = createSupabaseMenuRepository(() => Promise.reject(new Error("Supabase is not configured")));
    await expect(repo.list()).rejects.toThrow("not configured");
  });
});

describe("Supabase inbox repository", () => {
  it("sends a booking without reading it back (visitors may insert but not read)", async () => {
    const { client, calls } = createFakeSupabase();
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    await repo.createBooking({ name: "Madina", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 4, comment: "" });

    expect(calls[0]).toMatchObject({ table: "bookings", op: "insert", returning: false });
    expect(calls[0].payload).toEqual({ name: "Madina", phone: "+998 90 123 45 67", booking_date: "2026-11-10", booking_time: "19:00", guests: 4, comment: "" });
    expect(calls[0].payload).not.toHaveProperty("status");
  });

  it("reads slot availability with the booking_availability function", async () => {
    const { client, rpcCalls } = createFakeSupabase({}, { rpc: { booking_availability: { capacity: 6, booked: { "19:00": 6, "20:00": 2, bad: "x" } } } });
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    expect(await repo.getAvailability("2026-11-10")).toEqual({ capacity: 6, booked: { "19:00": 6, "20:00": 2 } });
    expect(rpcCalls).toEqual([{ name: "booking_availability", args: { day: "2026-11-10" } }]);
  });

  it("treats an unexpected availability answer as 'no information' instead of blocking every time", async () => {
    const { client } = createFakeSupabase({}, { rpc: { booking_availability: "nonsense" } });
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    const result = await repo.getAvailability("2026-11-10");
    expect(result.booked).toEqual({});
    expect(result.capacity).toBeGreaterThan(1000);
  });

  it("turns the database's SLOT_FULL error into a SlotFullError", async () => {
    const { client } = createFakeSupabase({}, { error: "SLOT_FULL" });
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    await expect(repo.createBooking({ name: "A", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 2, comment: "" })).rejects.toBeInstanceOf(SlotFullError);
    await expect(repo.setBookingStatus("x", "new")).rejects.toBeInstanceOf(SlotFullError);
  });

  it("lists bookings newest first and changes their status", async () => {
    const row = (id: string, createdAt: string) => ({ id, name: id, phone: "+998901234567", booking_date: "2026-11-10", booking_time: "19:00", guests: 2, comment: "", status: "new", created_at: createdAt });
    const { client, tables } = createFakeSupabase({ bookings: [row("old", "2026-11-01T10:00:00Z"), row("new", "2026-11-05T10:00:00Z")] });
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    expect((await repo.listBookings()).map((b) => b.id)).toEqual(["new", "old"]);

    await repo.setBookingStatus("old", "confirmed");
    expect(tables.bookings.find((r) => r.id === "old")?.status).toBe("confirmed");

    await repo.deleteBooking("new");
    expect(tables.bookings.map((r) => r.id)).toEqual(["old"]);
    await expect(repo.deleteBooking("new")).rejects.toThrow("Nothing was changed");
  });

  it("sends a message, marks it read and deletes it", async () => {
    const { client, tables, calls } = createFakeSupabase();
    const repo = createSupabaseInboxRepository(() => Promise.resolve(client));

    await repo.createMessage({ name: "Jasur", contact: "jasur@mail.uz", message: "Do you have oat milk?" });
    expect(calls[0]).toMatchObject({ table: "messages", op: "insert", returning: false });
    const id = String(tables.messages[0].id);

    await repo.markMessageRead(id);
    expect(tables.messages[0].is_read).toBe(true);

    await repo.deleteMessage(id);
    expect(tables.messages).toHaveLength(0);
  });
});
