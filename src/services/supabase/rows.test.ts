import { describe, expect, it } from "vitest";
import { parseBookingRows, parseMenuRows, parseMessageRows, toBookingRow, toMenuRow, toMessageRow } from "./rows";

const menuRow = {
  id: "7f0c",
  name: { en: "Flat white", ru: "Флэт уайт", uz: "Flet uayt" },
  description: { en: "Double espresso", ru: "Двойной эспрессо", uz: "Qoʻsh espresso" },
  category: "coffee",
  price: 28000,
  image_url: "/images/flat-white.webp",
  is_available: true,
  position: 1,
  created_at: "2026-11-06T10:00:00+00:00",
};

describe("menu rows", () => {
  it("maps snake_case columns to a MenuItem", () => {
    expect(parseMenuRows([menuRow])).toEqual([
      {
        id: "7f0c",
        name: menuRow.name,
        description: menuRow.description,
        category: "coffee",
        price: 28000,
        imageUrl: "/images/flat-white.webp",
        isAvailable: true,
      },
    ]);
  });

  it("drops broken rows one by one and survives non-array input", () => {
    const broken = [menuRow, { ...menuRow, id: "x", category: "pizza" }, { ...menuRow, id: "y", price: "28000" }, null, "text"];
    expect(parseMenuRows(broken).map((m) => m.id)).toEqual(["7f0c"]);
    expect(parseMenuRows(null)).toEqual([]);
    expect(parseMenuRows({})).toEqual([]);
  });

  it("builds an insert/update payload without id and position", () => {
    const row = toMenuRow({
      name: menuRow.name,
      description: menuRow.description,
      category: "coffee",
      price: 28000,
      imageUrl: "",
      isAvailable: false,
    });
    expect(row).toEqual({ name: menuRow.name, description: menuRow.description, category: "coffee", price: 28000, image_url: "", is_available: false });
  });
});

describe("booking rows", () => {
  const bookingRow = {
    id: "b1",
    name: "Madina",
    phone: "+998 90 123 45 67",
    booking_date: "2026-11-10",
    booking_time: "19:00",
    guests: 4,
    comment: "Window",
    status: "new",
    created_at: "2026-11-06T10:00:00.123456+00:00",
  };

  it("maps columns both ways", () => {
    expect(parseBookingRows([bookingRow])).toEqual([
      { id: "b1", name: "Madina", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 4, comment: "Window", status: "new", createdAt: bookingRow.created_at },
    ]);
    expect(toBookingRow({ name: "Madina", phone: "+998 90 123 45 67", date: "2026-11-10", time: "19:00", guests: 4, comment: "Window" })).toEqual({
      name: "Madina",
      phone: "+998 90 123 45 67",
      booking_date: "2026-11-10",
      booking_time: "19:00",
      guests: 4,
      comment: "Window",
    });
  });

  it("drops rows with an unknown status", () => {
    expect(parseBookingRows([bookingRow, { ...bookingRow, id: "b2", status: "done" }]).map((b) => b.id)).toEqual(["b1"]);
  });
});

describe("message rows", () => {
  const messageRow = { id: "m1", name: "Jasur", contact: "jasur@mail.uz", message: "Hi", is_read: false, created_at: "2026-11-06T10:00:00+00:00" };

  it("maps columns both ways", () => {
    expect(parseMessageRows([messageRow])).toEqual([
      { id: "m1", name: "Jasur", contact: "jasur@mail.uz", message: "Hi", read: false, createdAt: messageRow.created_at },
    ]);
    expect(toMessageRow({ name: "Jasur", contact: "jasur@mail.uz", message: "Hi" })).toEqual({ name: "Jasur", contact: "jasur@mail.uz", message: "Hi" });
  });

  it("drops rows without the read flag", () => {
    expect(parseMessageRows([messageRow, { ...messageRow, id: "m2", is_read: "no" }]).map((m) => m.id)).toEqual(["m1"]);
  });
});
