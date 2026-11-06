import { afterEach, describe, expect, it, vi } from "vitest";
import { INITIAL_MENU } from "@/data/seedData";
import type { MenuItemInput } from "@/types";
import { createLocalAuthService } from "./localAuthService";
import { createLocalInboxRepository } from "./localInboxRepository";
import { SITE } from "@/config/site";
import { SlotFullError } from "../errors";
import { createLocalMenuRepository, MENU_STORAGE_KEY } from "./localMenuRepository";

const newItem: MenuItemInput = {
  name: { en: "Matcha latte", ru: "", uz: "" },
  description: { en: "Green tea", ru: "", uz: "" },
  category: "coffee",
  price: 35000,
  imageUrl: "",
  isAvailable: true,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("local menu repository", () => {
  it("starts with the initial menu", async () => {
    const repo = createLocalMenuRepository();
    expect(repo.peek?.()).toEqual(INITIAL_MENU);
    expect(await repo.list()).toEqual(INITIAL_MENU);
  });

  it("creates, updates, hides, moves and removes items, and persists them", async () => {
    const repo = createLocalMenuRepository();

    await repo.create(newItem);
    let menu = await repo.list();
    expect(menu).toHaveLength(INITIAL_MENU.length + 1);
    const created = menu.at(-1)!;
    expect(created).toMatchObject({ name: newItem.name, price: 35000 });

    await repo.update(created.id, { ...newItem, price: 36000 });
    await repo.setAvailability(created.id, false);
    menu = await repo.list();
    expect(menu.at(-1)).toMatchObject({ id: created.id, price: 36000, isAvailable: false });

    await repo.move(created.id, -1);
    menu = await repo.list();
    expect(menu.at(-2)?.id).toBe(created.id);

    // A new repository (page reload) sees the same data
    expect((await createLocalMenuRepository().list()).map((m) => m.id)).toEqual(menu.map((m) => m.id));
    expect(JSON.parse(localStorage.getItem(MENU_STORAGE_KEY)!)).toHaveLength(INITIAL_MENU.length + 1);

    await repo.remove(created.id);
    expect(await repo.list()).toEqual(INITIAL_MENU);
  });

  it("keeps working in memory when localStorage refuses to save", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const repo = createLocalMenuRepository();

    await repo.create(newItem);

    expect(await repo.list()).toHaveLength(INITIAL_MENU.length + 1);
  });
});

describe("local inbox repository: slot capacity", () => {
  const booking = { name: "Madina", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 2, comment: "" };
  const fillSlot = async (repo: ReturnType<typeof createLocalInboxRepository>) => {
    for (let i = 0; i < SITE.booking.tablesPerSlot; i++) await repo.createBooking(booking);
  };

  it("rejects a booking when the slot is full, but not other times or days", async () => {
    const repo = createLocalInboxRepository();
    await fillSlot(repo);

    await expect(repo.createBooking(booking)).rejects.toBeInstanceOf(SlotFullError);
    await expect(repo.createBooking({ ...booking, time: "19:30" })).resolves.toBeUndefined();
    await expect(repo.createBooking({ ...booking, date: "2026-11-11" })).resolves.toBeUndefined();
  });

  it("reports how many bookings each time has, ignoring cancelled ones", async () => {
    const repo = createLocalInboxRepository();
    await fillSlot(repo);
    const [first] = await repo.listBookings();
    await repo.setBookingStatus(first.id, "cancelled");

    expect(await repo.getAvailability("2026-11-10")).toEqual({
      capacity: SITE.booking.tablesPerSlot,
      booked: { "19:00": SITE.booking.tablesPerSlot - 1 },
    });
    expect((await repo.getAvailability("2026-12-01")).booked).toEqual({});
  });

  it("frees a seat when a booking is cancelled and refuses to restore it into a full slot", async () => {
    const repo = createLocalInboxRepository();
    await fillSlot(repo);
    const [first] = await repo.listBookings();

    await repo.setBookingStatus(first.id, "cancelled");
    await repo.createBooking(booking); // the freed seat
    await expect(repo.setBookingStatus(first.id, "new")).rejects.toBeInstanceOf(SlotFullError);
    // confirming a booking that already holds a seat is fine
    const [active] = (await repo.listBookings()).filter((b) => b.status === "new");
    await expect(repo.setBookingStatus(active.id, "confirmed")).resolves.toBeUndefined();
  });
});

describe("local inbox repository", () => {
  it("adds bookings as new (newest first), changes their status and deletes them", async () => {
    const repo = createLocalInboxRepository();
    const booking = { name: "Madina", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 4, comment: "" };

    await repo.createBooking(booking);
    await repo.createBooking({ ...booking, name: "Jasur" });
    let list = await repo.listBookings();
    expect(list.map((b) => b.name)).toEqual(["Jasur", "Madina"]);
    expect(list[0]).toMatchObject({ status: "new" });

    await repo.setBookingStatus(list[0].id, "confirmed");
    list = await repo.listBookings();
    expect(list[0].status).toBe("confirmed");

    await repo.deleteBooking(list[0].id);
    expect((await repo.listBookings()).map((b) => b.name)).toEqual(["Madina"]);
  });

  it("adds messages as unread, marks them read and deletes them", async () => {
    const repo = createLocalInboxRepository();

    await repo.createMessage({ name: "Jasur", contact: "jasur@mail.uz", message: "Hi" });
    const [message] = await repo.listMessages();
    expect(message).toMatchObject({ read: false });

    await repo.markMessageRead(message.id);
    expect((await repo.listMessages())[0].read).toBe(true);

    await repo.deleteMessage(message.id);
    expect(await repo.listMessages()).toEqual([]);
  });
});

describe("local (demo) auth service", () => {
  it("accepts only the demo account and remembers the session for the tab", async () => {
    const auth = createLocalAuthService();
    expect(auth.peekSession?.()).toBe(false);

    await expect(auth.signIn("admin", "wrong")).resolves.toBe("invalid");
    await expect(auth.signIn("admin", "admin123")).resolves.toBe("ok");

    expect(auth.peekSession?.()).toBe(true);
    expect(await auth.getSession()).toBe(true);
    expect(createLocalAuthService().peekSession?.()).toBe(true);
  });

  it("notifies listeners on sign-in and sign-out", async () => {
    const auth = createLocalAuthService();
    const listener = vi.fn();
    const stop = auth.onChange(listener);

    await auth.signIn("admin", "admin123");
    await auth.signOut();
    stop();
    await auth.signIn("admin", "admin123");

    expect(listener.mock.calls).toEqual([[true], [false]]);
  });
});
