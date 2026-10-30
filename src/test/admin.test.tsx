import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderApp } from "./renderApp";

async function signIn(path = "/admin") {
  const result = renderApp(path, "en");
  const { user } = result;
  await screen.findByRole("heading", { name: "Admin panel" });
  await user.type(screen.getByLabelText("Username"), "admin");
  await user.type(screen.getByLabelText("Password"), "admin123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByRole("heading", { name: /Menu items \(\d+\)/ });
  return result;
}

describe("Admin panel", () => {
  it("redirects to login and rejects wrong credentials", async () => {
    const { user } = renderApp("/admin", "en");
    await screen.findByRole("heading", { name: "Admin panel" });
    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Wrong username or password");
  });

  it("returns to the requested admin page after signing in", async () => {
    const { user } = renderApp("/admin/bookings", "en");
    await screen.findByRole("heading", { name: "Admin panel" });
    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("heading", { name: "Bookings" })).toBeInTheDocument();
  });

  it("adds, edits, hides, reorders and deletes menu items", async () => {
    const { user } = await signIn();
    expect(screen.getByRole("heading", { name: "Menu items (8)" })).toBeInTheDocument();

    // Add with only the Russian translation filled
    await user.click(screen.getByRole("button", { name: "Add item" }));
    let dialog = screen.getByRole("dialog", { name: "New item" });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(within(dialog).getAllByText("Fill in at least one language")).toHaveLength(2);
    expect(within(dialog).getByText("Enter a whole number greater than 0")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("tab", { name: /Русский/ }));
    await user.type(within(dialog).getByLabelText("Name (RU)"), "Матча латте");
    await user.type(within(dialog).getByLabelText("Description (RU)"), "Японский зелёный чай");
    await user.type(within(dialog).getByLabelText("Price (UZS)"), "35000");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { name: "Menu items (9)" })).toBeInTheDocument();
    // English UI falls back to the Russian text
    expect(screen.getByRole("button", { name: "Edit: Матча латте" })).toBeInTheDocument();

    // Edit: add the English name
    await user.click(screen.getByRole("button", { name: "Edit: Матча латте" }));
    dialog = screen.getByRole("dialog", { name: "Edit item" });
    await user.click(within(dialog).getByRole("tab", { name: /English/ }));
    await user.type(within(dialog).getByLabelText("Name (EN)"), "Matcha latte");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(screen.getByRole("button", { name: "Edit: Matcha latte" })).toBeInTheDocument();

    // Stop-list toggle (two switches are rendered: mobile and desktop)
    const [toggle] = screen.getAllByRole("switch", { name: "Toggle availability: Matcha latte" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await user.click(toggle);
    expect(screen.getAllByRole("switch", { name: "Toggle availability: Matcha latte" })[0]).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("8 available")).toBeInTheDocument();

    // Reorder: move up one position
    const names = () => screen.getAllByRole("button", { name: /^Edit: / }).map((b) => b.getAttribute("aria-label"));
    expect(names().at(-1)).toBe("Edit: Matcha latte");
    await user.click(screen.getByRole("button", { name: "Move up: Matcha latte" }));
    expect(names().at(-2)).toBe("Edit: Matcha latte");

    // Delete with confirmation
    await user.click(screen.getByRole("button", { name: "Delete: Matcha latte" }));
    const confirm = screen.getByRole("dialog", { name: "Confirm deletion" });
    expect(confirm).toHaveTextContent("Are you sure? “Matcha latte” will be deleted.");
    await user.click(within(confirm).getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("heading", { name: "Menu items (8)" })).toBeInTheDocument();
  });

  it("shows bookings and lets the owner confirm them", async () => {
    localStorage.setItem(
      "coffee-and-co:bookings:v1",
      JSON.stringify([
        { id: "b1", name: "Madina", phone: "+998901234567", date: "2026-11-02", time: "19:00", guests: 4, comment: "Window", status: "new", createdAt: "2026-10-28T08:00:00.000Z" },
      ])
    );
    const { user } = await signIn();
    await user.click(screen.getByRole("link", { name: /Bookings/ }));
    await screen.findByRole("heading", { name: "Bookings" });

    expect(screen.getByText("Madina")).toBeInTheDocument();
    expect(screen.getByText("4 guests")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByText("Confirmed", { selector: "span" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("coffee-and-co:bookings:v1")!)[0].status).toBe("confirmed");
  });

  it("marks messages as read", async () => {
    localStorage.setItem(
      "coffee-and-co:messages:v1",
      JSON.stringify([{ id: "m1", name: "Jasur", contact: "jasur@mail.uz", message: "Do you have oat milk?", read: false, createdAt: "2026-10-28T08:00:00.000Z" }])
    );
    const { user } = await signIn();
    await user.click(screen.getByRole("link", { name: /Messages/ }));
    await screen.findByRole("heading", { name: "Messages" });

    expect(screen.getByRole("link", { name: "jasur@mail.uz" })).toHaveAttribute("href", "mailto:jasur@mail.uz");
    await user.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(screen.queryByRole("button", { name: "Mark as read" })).not.toBeInTheDocument();
  });
});
