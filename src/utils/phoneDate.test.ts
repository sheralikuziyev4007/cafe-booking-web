import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone } from "./phone";
import { formatDateText, isoToDateText, parseDateText } from "./date";

describe("formatPhone", () => {
  it.each([
    ["", ""],
    ["+", "+"],
    ["+998", "+998"],
    ["+9989", "+998 9"],
    ["+99890123", "+998 90 123"],
    ["+998901234567", "+998 90 123 45 67"],
    ["+998 90 123 45 6789", "+998 90 123 45 67"], // extra digits are cut
    ["901234567", "+998 90 123 45 67"], // local number without the country code
    ["998901234567", "+998 90 123 45 67"],
    ["(90) 123-45-67", "+998 90 123 45 67"],
    ["+7 916 123 45 67", "+79161234567"], // other countries: plus and digits
    ["+998 abc 90", "+998 90"], // letters are dropped
  ])("%s → %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });
});

describe("isValidPhone", () => {
  it.each(["+998 90 123 45 67", "+998901234567", "901234567", "(71) 200-00-00", "+7 916 123 45 67", "+1 212 555 0100"])(
    "accepts %s",
    (v) => expect(isValidPhone(v)).toBe(true)
  );
  it.each([
    "+998 90 123 45 6", // 11 digits
    "+998 90 123 45 678", // 13 digits
    "1234567",
    "1-2-3-4-5-6-7",
    "+1234567", // too short for international
    "+1234567890123456", // longer than E.164
    "+998 90 ABC 45 67",
    "",
  ])("rejects %s", (v) => expect(isValidPhone(v)).toBe(false));
});

describe("dates dd/mm/yyyy", () => {
  it("adds slashes while typing", () => {
    expect(formatDateText("2")).toBe("2");
    expect(formatDateText("281")).toBe("28/1");
    expect(formatDateText("28102026")).toBe("28/10/2026");
    expect(formatDateText("28/10/20269")).toBe("28/10/2026");
    expect(formatDateText("28a10")).toBe("28/10");
  });
  it("parses only real dates", () => {
    expect(parseDateText("28/10/2026")).toBe("2026-10-28");
    expect(parseDateText("29/02/2028")).toBe("2028-02-29"); // leap year
    expect(parseDateText("29/02/2027")).toBeNull();
    expect(parseDateText("00/10/2026")).toBeNull();
    expect(parseDateText("28/13/2026")).toBeNull();
    expect(parseDateText("28/10/26")).toBeNull();
  });
  it("converts ISO back to text", () => {
    expect(isoToDateText("2026-11-02")).toBe("02/11/2026");
    expect(isoToDateText("bad")).toBe("");
  });
});

import { imageSrcSet } from "@/data/responsiveImages";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

describe("imageSrcSet", () => {
  it("lists smaller copies for local photos and skips external links", () => {
    expect(imageSrcSet("/images/raf.webp")).toBe("/images/raf-w400.webp 400w, /images/raf-w800.webp 800w, /images/raf.webp 1536w");
    expect(imageSrcSet("/images/croissant.webp")).toBeUndefined();
    expect(imageSrcSet("https://example.com/raf.webp")).toBeUndefined();
  });
  it("every file in the srcset exists in public/", () => {
    for (const name of ["avocado-toast", "cappuccino", "cheesecake", "flat-white", "interior", "latte-art", "oatmeal", "pasta", "raf"]) {
      for (const part of imageSrcSet(`/images/${name}.webp`)!.split(", ")) {
        expect(existsSync(resolve("public", "." + part.split(" ")[0]))).toBe(true);
      }
    }
  });
});
