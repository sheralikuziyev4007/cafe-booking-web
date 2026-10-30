import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderApp } from "./renderApp";
import { toLocalIsoDate } from "@/utils/validators";

describe("Landing page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders in English and switches language", async () => {
    const { user } = renderApp("/", "en");
    expect(screen.getByRole("heading", { level: 1, name: "Coffee is a pause worth making beautiful" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");

    const [switcher] = screen.getAllByRole("group", { name: "Language" });
    await user.click(within(switcher).getByRole("button", { name: "Русский" }));

    expect(screen.getByRole("heading", { level: 1, name: "Кофе — это пауза, которую стоит сделать красиво" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("ru");
    expect(localStorage.getItem("coffee-and-co:lang")).toBe('"ru"');
  });

  it("filters the menu by category and search query", async () => {
    const { user } = renderApp("/", "en");
    const menu = () => screen.getAllByRole("button", { name: /^Details:/ }).map((b) => b.textContent);

    expect(menu()).toHaveLength(8);

    await user.click(screen.getByRole("button", { name: "Desserts", pressed: false }));
    expect(menu()).toEqual(["Basque cheesecake", "Almond croissant"]);

    await user.click(screen.getByRole("button", { name: "All" }));
    // Search works in any language, not only the current one
    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "капучино");
    expect(menu()).toEqual(["Cappuccino"]);

    await user.clear(screen.getByRole("searchbox", { name: "Search the menu" }));
    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "pizza");
    expect(screen.getByText("Nothing found for “pizza”.")).toBeInTheDocument();
  });

  it("opens menu item details", async () => {
    const { user } = renderApp("/", "en");
    await user.click(screen.getByRole("button", { name: "Details: Honey raf" }));
    const dialog = screen.getByRole("dialog", { name: "Honey raf" });
    expect(within(dialog).getByText("Creamy raf with wildflower honey")).toBeInTheDocument();
    expect(within(dialog).getByText("32,000 UZS")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validates and sends the contact form", async () => {
    const { user } = renderApp("/", "en");
    const form = screen.getByRole("form", { name: "Contact form" });

    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(within(form).getAllByText("This field is required")).toHaveLength(3);

    await user.type(within(form).getByLabelText("Your name"), "Ali");
    await user.type(within(form).getByLabelText("Phone or email"), "not-valid");
    await user.type(within(form).getByLabelText("Message"), "Hello!");
    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(within(form).getByText(/Enter a valid email or a full phone number/)).toBeInTheDocument();

    await user.clear(within(form).getByLabelText("Phone or email"));
    await user.type(within(form).getByLabelText("Phone or email"), "ali@mail.uz");
    await user.click(within(form).getByRole("button", { name: /Send/ }));

    expect(await within(form).findByText("Message sent — we will get back to you soon.")).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("coffee-and-co:messages:v1") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ name: "Ali", contact: "ali@mail.uz", message: "Hello!", read: false });
  });

  it("books a table", async () => {
    // Fixed morning clock, so every slot of the day is still available
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 28, 10, 0));
    const { user } = renderApp("/", "en");
    await user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Book a table" });

    // Today is pre-filled as dd/mm/yyyy
    const today = new Date();
    const todayText = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    expect(within(dialog).getByLabelText("Date")).toHaveValue(todayText);

    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));
    expect(within(dialog).getAllByText("This field is required")).toHaveLength(3); // name, phone, time

    await user.type(within(dialog).getByLabelText("Your name"), "Madina");
    await user.type(within(dialog).getByLabelText("Phone"), "901234567");
    expect(within(dialog).getByLabelText("Phone")).toHaveValue("+998 90 123 45 67");
    await user.selectOptions(within(dialog).getByLabelText("Time"), "21:00");
    await user.selectOptions(within(dialog).getByLabelText("Guests"), "4");
    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));

    expect(await screen.findByText("Request received!")).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("coffee-and-co:bookings:v1") ?? "[]");
    expect(stored[0]).toMatchObject({
      name: "Madina",
      phone: "+998 90 123 45 67",
      date: toLocalIsoDate(today),
      time: "21:00",
      guests: 4,
      status: "new",
    });
  });

  it("offers only the slots that haven't started yet today", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 28, 20, 15));
    const { user } = renderApp("/", "en");
    await user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    const time = within(dialog).getByLabelText("Time");

    const slots = () => within(time).getAllByRole("option").map((o) => o.getAttribute("value")).filter(Boolean);
    expect(slots()).toEqual(["20:30", "21:00"]);

    // Another day: the full schedule is back
    const date = within(dialog).getByLabelText("Date");
    await user.clear(date);
    await user.type(date, "29102026");
    expect(slots()[0]).toBe("08:00");
  });

  it("masks the phone number and rejects incomplete numbers", async () => {
    const { user } = renderApp("/", "en");
    await user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    const phone = within(dialog).getByLabelText("Phone");

    // Country code appears on focus, letters are ignored
    await user.click(phone);
    expect(phone).toHaveValue("+998 ");
    await user.type(phone, "90abc12345");
    expect(phone).toHaveValue("+998 90 123 45");

    // Backspace right after a separator removes the digit before it
    await user.type(phone, "{Backspace}{Backspace}");
    expect(phone).toHaveValue("+998 90 123");
    await user.type(phone, "{Backspace}");
    expect(phone).toHaveValue("+998 90 12");

    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));
    expect(within(dialog).getByText(/Enter a full number/)).toBeInTheDocument();

    // Only the country code left → field is cleared on blur
    await user.clear(phone);
    await user.type(phone, "+998");
    await user.tab();
    expect(phone).toHaveValue("");
  });

  it("accepts dates as dd/mm/yyyy and from the calendar", async () => {
    const { user } = renderApp("/", "en");
    await user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    const date = within(dialog).getByLabelText("Date");

    await user.clear(date);
    await user.type(date, "31112026");
    expect(date).toHaveValue("31/11/2026");
    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));
    expect(within(dialog).getByText("Enter a real date in the format dd/mm/yyyy")).toBeInTheDocument();

    // Calendar: opens on the selected date, arrows move by day, Enter picks the date
    await user.clear(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowText = `${String(tomorrow.getDate()).padStart(2, "0")}/${String(tomorrow.getMonth() + 1).padStart(2, "0")}/${tomorrow.getFullYear()}`;
    await user.click(within(dialog).getByRole("button", { name: "Choose a date in the calendar" }));
    const grid = within(dialog).getByRole("grid");
    expect(grid).toBeInTheDocument();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(date).toHaveValue(tomorrowText);
    expect(within(dialog).queryByRole("grid")).not.toBeInTheDocument();

    // Escape closes only the calendar, not the booking dialog
    await user.click(within(dialog).getByRole("button", { name: "Choose a date in the calendar" }));
    await user.keyboard("{Escape}");
    expect(within(dialog).queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Book a table" })).toBeInTheDocument();

    // Past days are disabled
    await user.click(within(dialog).getByRole("button", { name: "Choose a date in the calendar" }));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const label = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(yesterday);
    const yesterdayButton = within(dialog).queryByRole("button", { name: label });
    if (yesterdayButton) expect(yesterdayButton).toBeDisabled();
  });

  it("normalises a phone number typed in the contact form", async () => {
    const { user } = renderApp("/", "en");
    const form = screen.getByRole("form", { name: "Contact form" });
    const contact = within(form).getByLabelText("Phone or email");
    await user.type(contact, "90 1234567");
    await user.tab();
    expect(contact).toHaveValue("+998 90 123 45 67");

    await user.clear(contact);
    await user.type(contact, "+998 90 12");
    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(within(form).getByText(/Enter a valid email or a full phone number/)).toBeInTheDocument();
  });
});
