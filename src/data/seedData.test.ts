import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { INITIAL_MENU } from "./seedData";
import { imageSrcSet } from "./responsiveImages";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

/** Every local file a menu item points to must exist, otherwise the card shows a placeholder icon */
describe("starter menu photos", () => {
  it.each(INITIAL_MENU.map((item) => [item.name.en, item.imageUrl] as const))("%s has a photo on disk", (_name, imageUrl) => {
    expect(imageUrl).toMatch(/^\/images\/[\w-]+\.webp$/);
    expect(existsSync(path.join(PUBLIC_DIR, imageUrl))).toBe(true);
  });

  it("every smaller copy listed in a srcset exists", () => {
    for (const { imageUrl } of INITIAL_MENU) {
      const srcSet = imageSrcSet(imageUrl);
      if (!srcSet) continue;
      for (const candidate of srcSet.split(",")) {
        const file = candidate.trim().split(" ")[0];
        expect(existsSync(path.join(PUBLIC_DIR, file)), file).toBe(true);
      }
    }
  });
});
