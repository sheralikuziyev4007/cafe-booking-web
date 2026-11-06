import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openBookingForm, signInAsAdmin } from "./helpers";

/** WCAG 2.x A and AA rules. Serious and critical problems fail the test. */
async function expectNoSeriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const report = serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} element(s), e.g. ${v.nodes[0]?.target.join(" ")}`);
  expect(report, "accessibility violations").toEqual([]);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    test("landing page", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoSeriousViolations(page);
    });

    test("booking dialog", async ({ page }) => {
      await page.goto("/");
      await openBookingForm(page);
      await expectNoSeriousViolations(page);
    });

    test("admin login and menu page", async ({ page }) => {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Admin panel" })).toBeVisible();
      await expectNoSeriousViolations(page);
      await signInAsAdmin(page);
      await expectNoSeriousViolations(page);
    });
  });
}

test("the booking dialog works with the keyboard only", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Book a table" }).first().focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Book a table" });
  await expect(dialog).toBeVisible();

  // Focus moves into the dialog and stays there while tabbing
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Book a table" }).first()).toBeFocused();
});
