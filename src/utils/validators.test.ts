import { describe, expect, it } from "vitest";
import {
  addDays,
  isValidEmail,
  isValidImageUrl,
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

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-10-28", 60)).toBe("2026-12-27");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
