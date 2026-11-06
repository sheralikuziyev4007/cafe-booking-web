import { expect, type Page } from "@playwright/test";

export const BOOKINGS_KEY = "coffee-and-co:bookings:v1";

/** Local date of tomorrow: as dd/mm/yyyy (what the form takes) and as yyyy-mm-dd (what is stored) */
export function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return { text: `${dd}/${mm}/${d.getFullYear()}`, iso: `${d.getFullYear()}-${mm}-${dd}` };
}

/** Demo admin account (see README). Lands on the menu page. */
export async function signInAsAdmin(page: Page, path = "/admin") {
  await page.goto(path);
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Menu items \(\d+\)/ })).toBeVisible();
}

export async function openBookingForm(page: Page) {
  await page.getByRole("button", { name: "Book a table" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Book a table" });
  await expect(dialog).toBeVisible();
  return dialog;
}

interface BookingDetails {
  name: string;
  phone?: string;
  time: string;
  guests?: string;
}

/** Fills and submits the booking form for tomorrow */
export async function bookTable(page: Page, { name, phone = "901234567", time, guests = "2" }: BookingDetails) {
  const dialog = await openBookingForm(page);
  await dialog.getByLabel("Your name").fill(name);
  await dialog.getByLabel("Phone").fill(phone);
  await dialog.getByRole("textbox", { name: "Date" }).fill(tomorrow().text);
  await dialog.getByLabel("Time").selectOption(time);
  await dialog.getByLabel("Guests").selectOption(guests);
  await dialog.getByRole("button", { name: "Request booking" }).click();
}
