import { describe, expect, it } from "vitest";
import {
  addDays,
  isValidEmail,
  isValidImageUrl,
  validateBookingForm,
  validateContactForm,
  validateMenuForm,
  type BookingRules,
  type MenuFormState,
} from "./validators";

describe("isValidEmail", () => {
  it.each(["a@b.co", "  user.name@mail.uz  "])("accepts email %s", (v) => expect(isValidEmail(v)).toBe(true));
  it.each(["a@b", "user@", "no at.com", ""])("rejects email %s", (v) => expect(isValidEmail(v)).toBe(false));
});

describe("isValidImageUrl", () => {
  it("accepts local paths and http(s) links", () => {
    expect(isValidImageUrl("/images/raf.webp")).toBe(true);
    expect(isValidImageUrl("https://example.com/a.jpg")).toBe(true);
    expect(isValidImageUrl("http://example.com/a.jpg")).toBe(true);
  });
  it("rejects protocol-relative, javascript: and garbage", () => {
    expect(isValidImageUrl("//evil.com/a.jpg")).toBe(false);
    expect(isValidImageUrl("javascript:alert(1)")).toBe(false);
    expect(isValidImageUrl("not a url")).toBe(false);
  });
});

describe("validateContactForm", () => {
  it("requires all fields", () => {
    expect(validateContactForm({ name: " ", contact: "", message: "" })).toEqual({
      name: "required",
      contact: "required",
      message: "required",
    });
  });
  it.each(["abc", "ali@mail", "+998 90 123 45", "1234567"])("rejects contact %s", (contact) => {
    expect(validateContactForm({ name: "Ali", contact, message: "Hi" })).toEqual({ contact: "invalidContact" });
  });
  it("passes with email or phone", () => {
    expect(validateContactForm({ name: "Ali", contact: "ali@mail.uz", message: "Hi" })).toEqual({});
    expect(validateContactForm({ name: "Ali", contact: "+998 90 123 45 67", message: "Hi" })).toEqual({});
  });
});

describe("validateMenuForm", () => {
  const valid: MenuFormState = {
    name: { en: "Latte", ru: "", uz: "" },
    description: { en: "", ru: "Кофе с молоком", uz: "" },
    category: "coffee",
    price: "25000",
    imageUrl: "",
    isAvailable: true,
  };

  it("accepts a form where each text has at least one language", () => {
    expect(validateMenuForm(valid)).toEqual({});
  });
  it("needs at least one language for name and description", () => {
    const errors = validateMenuForm({ ...valid, name: { en: " ", ru: "", uz: "" }, description: { en: "", ru: "", uz: "" } });
    expect(errors).toEqual({ name: "needOneLanguage", description: "needOneLanguage" });
  });
  it.each(["0", "-5", "12.5", "abc", ""])("rejects price %s", (price) => {
    expect(validateMenuForm({ ...valid, price }).price).toBe("invalidPrice");
  });
  it("validates the image link only when filled", () => {
    expect(validateMenuForm({ ...valid, imageUrl: "ftp://x" }).imageUrl).toBe("invalidImageUrl");
  });
});

describe("validateBookingForm", () => {
  const rules: BookingRules = { today: "2026-10-28", maxDaysAhead: 60, slots: ["08:00", "08:30", "21:00"], maxGuests: 12 };
  const valid = { name: "Ali", phone: "+998 90 123 45 67", date: "28/10/2026", time: "08:30", guests: "2", comment: "" };

  it("accepts a valid booking for today", () => {
    expect(validateBookingForm(valid, rules)).toEqual({});
  });
  it("rejects past and too distant dates", () => {
    expect(validateBookingForm({ ...valid, date: "27/10/2026" }, rules).date).toBe("dateInPast");
    expect(validateBookingForm({ ...valid, date: "27/12/2026" }, rules)).toEqual({});
    expect(validateBookingForm({ ...valid, date: "28/12/2026" }, rules).date).toBe("dateTooFar");
  });
  it.each([
    ["", "required"],
    ["28/10", "invalidDate"],
    ["2026-10-28", "invalidDate"],
    ["31/11/2026", "invalidDate"],
    ["10/28/2026", "invalidDate"],
  ])("date %s → %s", (date, code) => {
    expect(validateBookingForm({ ...valid, date }, rules).date).toBe(code);
  });
  it("accepts only configured time slots", () => {
    expect(validateBookingForm({ ...valid, time: "" }, rules).time).toBe("required");
    expect(validateBookingForm({ ...valid, time: "23:00" }, rules).time).toBe("timeOutOfHours");
  });
  it("rejects a slot that has already passed today", () => {
    const evening = { ...rules, nowTime: "20:15" };
    expect(validateBookingForm({ ...valid, time: "08:30" }, evening).time).toBe("timePassed");
    expect(validateBookingForm({ ...valid, time: "21:00" }, evening)).toEqual({});
    // a slot that starts exactly now is already too late
    expect(validateBookingForm({ ...valid, time: "21:00" }, { ...rules, nowTime: "21:00" }).time).toBe("timePassed");
    // other days are not affected by the current time
    expect(validateBookingForm({ ...valid, date: "29/10/2026", time: "08:30" }, evening)).toEqual({});
  });
  it("checks guests range and phone", () => {
    expect(validateBookingForm({ ...valid, guests: "0" }, rules).guests).toBe("invalidGuests");
    expect(validateBookingForm({ ...valid, guests: "13" }, rules).guests).toBe("invalidGuests");
    expect(validateBookingForm({ ...valid, phone: "+998 90 123 45" }, rules).phone).toBe("invalidPhone");
    // only the pre-filled country code counts as empty
    expect(validateBookingForm({ ...valid, phone: "+998 " }, rules).phone).toBe("required");
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-10-28", 60)).toBe("2026-12-27");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
