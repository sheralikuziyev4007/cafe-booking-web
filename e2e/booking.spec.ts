import { expect, test } from "@playwright/test";
import { BOOKINGS_KEY, bookTable, openBookingForm, signInAsAdmin, tomorrow } from "./helpers";

test.describe("Table booking", () => {
  test("a visitor books a table and the owner confirms it in the admin panel", async ({ page }) => {
    await page.goto("/");
    await bookTable(page, { name: "Madina", time: "19:00", guests: "4" });
    await expect(page.getByText("Request received!")).toBeVisible();

    // Same browser, so the demo data (localStorage) is shared with the admin panel
    await signInAsAdmin(page);
    await page.getByRole("link", { name: /Bookings/ }).click();
    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();

    await expect(page.getByText("Madina")).toBeVisible();
    await expect(page.getByText("4 guests")).toBeVisible();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page.locator("span", { hasText: /^Confirmed$/ })).toBeVisible();
  });

  test("the form explains what is missing instead of sending an empty request", async ({ page }) => {
    await page.goto("/");
    const dialog = await openBookingForm(page);

    await dialog.getByRole("button", { name: "Request booking" }).click();

    await expect(dialog.getByText("This field is required")).toHaveCount(3); // name, phone, time
    await expect(page.getByText("Request received!")).toHaveCount(0);
  });

  test("a fully booked time cannot be chosen", async ({ page }) => {
    const { iso } = tomorrow();
    const booking = (i: number) => ({
      id: `full-${i}`,
      name: `Guest ${i}`,
      phone: "+998 90 123 45 67",
      date: iso,
      time: "19:00",
      guests: 2,
      comment: "",
      status: "new",
      createdAt: new Date().toISOString(),
    });
    // 6 bookings = every table of that time (SITE.booking.tablesPerSlot)
    await page.addInitScript(
      ([key, rows]) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, rows);
      },
      [BOOKINGS_KEY, JSON.stringify(Array.from({ length: 6 }, (_, i) => booking(i)))] as const
    );
    await page.goto("/");
    const dialog = await openBookingForm(page);
    await dialog.getByRole("textbox", { name: "Date" }).fill(tomorrow().text);

    await expect(dialog.getByRole("option", { name: "19:00 · fully booked" })).toBeDisabled();
    await expect(dialog.getByRole("option", { name: "19:30" })).toBeEnabled();
  });

  test("a time taken by others while the form was open is refused politely", async ({ page }) => {
    await page.goto("/");
    const dialog = await openBookingForm(page);
    await dialog.getByLabel("Your name").fill("Late Guest");
    await dialog.getByLabel("Phone").fill("901234567");
    await dialog.getByRole("textbox", { name: "Date" }).fill(tomorrow().text);
    await dialog.getByLabel("Time").selectOption("20:00");

    // Meanwhile another visitor (same demo storage) books every table for that time
    const { iso } = tomorrow();
    await page.evaluate(
      ([key, date]) => {
        const rows = Array.from({ length: 6 }, (_, i) => ({
          id: `other-${i}`, name: `Other ${i}`, phone: "+998 90 123 45 67", date, time: "20:00", guests: 2, comment: "", status: "new", createdAt: new Date().toISOString(),
        }));
        localStorage.setItem(key, JSON.stringify(rows));
      },
      [BOOKINGS_KEY, iso] as const
    );

    await dialog.getByRole("button", { name: "Request booking" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("This time was just taken. Please choose another one.");
    await expect(page.getByText("Request received!")).toHaveCount(0);
  });
});
