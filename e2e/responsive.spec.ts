import { expect, test, type Page } from "@playwright/test";
import { openBookingForm, signInAsAdmin } from "./helpers";

/** Widths the project is checked at (mobile-first) */
const VIEWPORTS = [
  { name: "360", width: 360, height: 740 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
];

/** A page wider than the screen means something overflows and the visitor can scroll sideways */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("landing page fits the screen and the booking form is usable", async ({ page }, testInfo) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await page.screenshot({ path: testInfo.outputPath(`landing-${viewport.name}.png`), fullPage: true });

      const dialog = await openBookingForm(page);
      await expectNoHorizontalScroll(page);
      // The submit button must be reachable without leaving the dialog, even on a small phone
      await dialog.getByRole("button", { name: "Request booking" }).scrollIntoViewIfNeeded();
      await expect(dialog.getByRole("button", { name: "Request booking" })).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`booking-${viewport.name}.png`) });
    });

    test("admin panel fits the screen", async ({ page }, testInfo) => {
      await signInAsAdmin(page);
      await expectNoHorizontalScroll(page);
      await page.screenshot({ path: testInfo.outputPath(`admin-menu-${viewport.name}.png`), fullPage: true });

      await page.getByRole("link", { name: /Bookings/ }).click();
      await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();
      await expectNoHorizontalScroll(page);
    });
  });
}
