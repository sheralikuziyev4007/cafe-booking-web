import { describe, expect, it } from "vitest";
import { parseMenu, parseLocalized } from "./menuStorage";
import { parseBookings, parseMessages } from "./inboxStorage";
import { moveInArray } from "./array";
import { INITIAL_MENU } from "@/data/seedData";

describe("parseMenu", () => {
  it("accepts the current format unchanged", () => {
    expect(parseMenu(JSON.parse(JSON.stringify(INITIAL_MENU)))).toEqual(INITIAL_MENU);
  });

  it("migrates the legacy single-language format (v2)", () => {
    const legacy = [{ id: "1", name: "Капучино", category: "coffee", price: 24000, description: "Классика" }];
    expect(parseMenu(legacy)).toEqual([
      {
        id: "1",
        name: { en: "Капучино", ru: "Капучино", uz: "Капучино" },
        description: { en: "Классика", ru: "Классика", uz: "Классика" },
        category: "coffee",
        price: 24000,
        imageUrl: "",
        isAvailable: true,
      },
    ]);
  });

  it.each([
    ["not an array", { a: 1 }],
    ["unknown category", [{ id: "1", name: "X", description: "Y", category: "pizza", price: 1 }]],
    ["NaN price", [{ id: "1", name: "X", description: "Y", category: "coffee", price: Number.NaN }]],
    ["empty name", [{ id: "1", name: { en: "", ru: "", uz: "" }, description: "Y", category: "coffee", price: 1 }]],
  ])("rejects corrupted data: %s", (_label, raw) => {
    expect(parseMenu(raw)).toBeNull();
  });

  it("drops only the broken entry and keeps the rest of the menu", () => {
    const saved = JSON.parse(JSON.stringify(INITIAL_MENU));
    const broken = [...saved, { id: "x", price: "bad" }, null, { ...saved[0], id: "y", category: "pizza" }];
    expect(parseMenu(broken)).toEqual(INITIAL_MENU);
  });

  it("keeps an intentionally empty menu", () => {
    expect(parseMenu([])).toEqual([]);
  });
});

describe("parseLocalized", () => {
  it("fills missing languages with empty strings", () => {
    expect(parseLocalized({ ru: "Чай" })).toEqual({ en: "", ru: "Чай", uz: "" });
  });
});

describe("inbox parsers", () => {
  it("keeps valid entries and drops broken ones", () => {
    const good = { id: "1", name: "A", phone: "+998", date: "2026-10-28", time: "10:00", guests: 2, comment: "", status: "new", createdAt: "x" };
    expect(parseBookings([good, { ...good, status: "weird" }, null])).toEqual([good]);

    const msg = { id: "1", name: "A", contact: "a@b.co", message: "Hi", read: false, createdAt: "x" };
    expect(parseMessages([msg, { ...msg, read: "no" }])).toEqual([msg]);
    expect(parseMessages("oops")).toBeNull();
  });
});

describe("moveInArray", () => {
  const list = [{ id: "a" }, { id: "b" }, { id: "c" }];
  it("swaps with the neighbour", () => {
    expect(moveInArray(list, "b", -1).map((x) => x.id)).toEqual(["b", "a", "c"]);
    expect(moveInArray(list, "b", 1).map((x) => x.id)).toEqual(["a", "c", "b"]);
  });
  it("does nothing at the edges", () => {
    expect(moveInArray(list, "a", -1)).toBe(list);
    expect(moveInArray(list, "c", 1)).toBe(list);
  });
});
