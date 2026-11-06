import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { renderApp } from "./renderApp";
import { createTestServices } from "./testServices";
import { SlotFullError } from "@/services/errors";

describe("Booking form: slot capacity", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const openForm = async (services = createTestServices()) => {
    // Fixed morning clock, so every slot of the day is still offered
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 28, 10, 0));
    const utils = renderApp("/", "en", { services });
    await utils.user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    return { ...utils, dialog: screen.getByRole("dialog", { name: "Book a table" }) };
  };

  it("marks fully booked times and does not let the visitor pick them", async () => {
    const services = createTestServices({
      inbox: { getAvailability: () => Promise.resolve({ capacity: 2, booked: { "19:00": 2, "19:30": 1 } }) },
    });
    const { dialog } = await openForm(services);
    const time = within(dialog).getByLabelText("Time");

    const full = await within(dialog).findByRole("option", { name: "19:00 · fully booked" });
    expect(full).toBeDisabled();
    expect(within(dialog).getByRole("option", { name: "19:30" })).toBeEnabled();
    expect(time).toBeEnabled();
  });

  it("keeps every time selectable while availability is unknown", async () => {
    const services = createTestServices({ inbox: { getAvailability: () => new Promise(() => undefined) } });
    const { dialog } = await openForm(services);

    expect(within(dialog).getByRole("option", { name: "19:00" })).toBeEnabled();
  });

  it("asks for another time when the slot was taken a moment ago", async () => {
    const services = createTestServices({ inbox: { createBooking: () => Promise.reject(new SlotFullError()) } });
    const { user, dialog } = await openForm(services);

    await user.type(within(dialog).getByLabelText("Your name"), "Madina");
    await user.type(within(dialog).getByLabelText("Phone"), "901234567");
    await user.selectOptions(within(dialog).getByLabelText("Time"), "21:00");
    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("This time was just taken. Please choose another one.");
    await waitFor(() => expect(within(dialog).getByLabelText("Time")).toHaveValue(""));
  });
});
