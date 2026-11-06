import { expect, test } from "@playwright/test";
import { signInAsAdmin } from "./helpers";

test.describe("Admin: menu management", () => {
  test("login rejects wrong credentials and protects the admin pages", async ({ page }) => {
    await page.goto("/admin/bookings");
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toHaveText("Wrong username or password");
  });

  test("the owner adds, hides and deletes a dish, and the landing page follows", async ({ page }) => {
    await signInAsAdmin(page);
    await expect(page.getByRole("heading", { name: "Menu items (9)" })).toBeVisible();

    await page.getByRole("button", { name: "Add item" }).click();
    const dialog = page.getByRole("dialog", { name: "New item" });
    await dialog.getByRole("tab", { name: /English/ }).click();
    await dialog.getByLabel("Name (EN)").fill("Matcha latte");
    await dialog.getByLabel("Description (EN)").fill("Ceremonial matcha with steamed milk");
    await dialog.getByLabel("Price (UZS)").fill("35000");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("heading", { name: "Menu items (10)" })).toBeVisible();

    // The public menu shows the new dish
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Details: Matcha latte/ })).toBeVisible();

    // Hide it (stop-list): still listed, but marked as unavailable
    await page.goto("/admin");
    await page.getByRole("switch", { name: "Toggle availability: Matcha latte" }).first().click();
    await expect(page.getByText("9 available")).toBeVisible();

    // Delete with a confirmation step
    await page.getByRole("button", { name: "Delete: Matcha latte" }).click();
    await page.getByRole("dialog", { name: "Confirm deletion" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("heading", { name: "Menu items (9)" })).toBeVisible();
  });

  test("the form blocks an empty dish", async ({ page }) => {
    await signInAsAdmin(page);
    await page.getByRole("button", { name: "Add item" }).click();
    const dialog = page.getByRole("dialog", { name: "New item" });

    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog.getByText("Fill in at least one language")).toHaveCount(2);
    await expect(dialog.getByText("Enter a whole number greater than 0")).toBeVisible();
  });
});
