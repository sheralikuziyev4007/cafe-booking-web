import { describe, expect, it } from "vitest";
import { buildTimeSlots, errorMessage, formatMoney } from "./formatters";
import { DICTIONARIES, pickText } from "@/i18n";

describe("formatMoney", () => {
  it("formats per language", () => {
    expect(formatMoney(28000, "en")).toBe("28,000 UZS");
    // ru-RU groups with a narrow no-break space
    expect(formatMoney(28000, "ru").replace(/\s/g, " ")).toBe("28 000 сум");
    expect(formatMoney(28000, "uz").replace(/\s/g, " ")).toBe("28 000 soʻm");
  });
});

describe("buildTimeSlots", () => {
  it("builds inclusive slots", () => {
    expect(buildTimeSlots("08:00", "09:30", 30)).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });
});

describe("pickText", () => {
  it("falls back to another language when the current one is empty", () => {
    expect(pickText({ en: "Tea", ru: "Чай", uz: "Choy" }, "uz")).toBe("Choy");
    expect(pickText({ en: "", ru: "Чай", uz: "" }, "uz")).toBe("Чай");
    expect(pickText({ en: "Tea", ru: "", uz: "" }, "ru")).toBe("Tea");
  });
});

describe("errorMessage", () => {
  it("resolves plain and parametrised messages in every language", () => {
    for (const t of Object.values(DICTIONARIES)) {
      for (const code of Object.keys(t.errors) as (keyof typeof t.errors)[]) {
        expect(errorMessage(t, code)).toMatch(/\S/);
      }
    }
    expect(errorMessage(DICTIONARIES.en, "dateTooFar")).toBe("Bookings are accepted up to 60 days ahead");
    expect(errorMessage(DICTIONARIES.en, undefined)).toBeUndefined();
  });
});
