import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { renderApp } from "./renderApp";
import { createTestServices, deferred } from "./testServices";
import { queryKeys } from "@/lib/queryClient";
import { INITIAL_MENU } from "@/data/seedData";
import { toLocalIsoDate } from "@/utils/validators";

/** Signs in with the demo account and waits for the admin panel */
async function signIn(result: ReturnType<typeof renderApp>) {
  const { user } = result;
  await screen.findByRole("heading", { name: "Admin panel" });
  await user.type(screen.getByLabelText("Username"), "admin");
  await user.type(screen.getByLabelText("Password"), "admin123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("Landing: loading, error and empty states", () => {
  it("shows skeleton cards while the menu loads, then the menu", async () => {
    const request = deferred<typeof INITIAL_MENU>();
    renderApp("/", "en", { services: createTestServices({ menu: { peek: undefined, list: () => request.promise } }) });

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /^Details:/ })).toHaveLength(0);

    request.resolve(INITIAL_MENU);
    expect(await screen.findAllByRole("button", { name: /^Details:/ })).toHaveLength(9);
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  it("shows an error with a retry button, and the menu after a successful retry", async () => {
    const list = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(INITIAL_MENU);
    const { user } = renderApp("/", "en", { services: createTestServices({ menu: { peek: undefined, list } }) });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't load the data");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findAllByRole("button", { name: /^Details:/ })).toHaveLength(9);
    expect(screen.queryByText("Couldn't load the data")).not.toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("shows the empty message when the menu has no items", async () => {
    renderApp("/", "en", { services: createTestServices({ menu: { peek: undefined, list: () => Promise.resolve([]) } }) });
    expect(await screen.findByText("No items in this category yet.")).toBeInTheDocument();
  });
});

describe("Landing: sending forms", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps what the visitor typed and shows an error when a message cannot be sent", async () => {
    const createMessage = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const { user } = renderApp("/", "en", { services: createTestServices({ inbox: { createMessage } }) });
    const form = screen.getByRole("form", { name: "Contact form" });

    await user.type(within(form).getByLabelText("Your name"), "Ali");
    await user.type(within(form).getByLabelText("Phone or email"), "ali@mail.uz");
    await user.type(within(form).getByLabelText("Message"), "Hello!");
    await user.click(within(form).getByRole("button", { name: /Send/ }));

    expect(await within(form).findByRole("alert")).toHaveTextContent("Couldn't send your request. Please try again.");
    expect(within(form).getByLabelText("Message")).toHaveValue("Hello!");
    expect(within(form).queryByText("Message sent — we will get back to you soon.")).not.toBeInTheDocument();

    // Try again: now it goes through
    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(await within(form).findByText("Message sent — we will get back to you soon.")).toBeInTheDocument();
    expect(within(form).getByLabelText("Message")).toHaveValue("");
    expect(createMessage).toHaveBeenCalledTimes(2);
  });

  it("disables the button while a booking is being sent and recovers from an error", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 28, 10, 0));
    const request = deferred<void>();
    const createBooking = vi.fn().mockReturnValueOnce(request.promise).mockResolvedValue(undefined);
    const { user } = renderApp("/", "en", { services: createTestServices({ inbox: { createBooking } }) });

    await user.click(screen.getAllByRole("button", { name: "Book a table" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    await user.type(within(dialog).getByLabelText("Your name"), "Madina");
    await user.type(within(dialog).getByLabelText("Phone"), "901234567");
    await user.selectOptions(within(dialog).getByLabelText("Time"), "19:00");
    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));

    // Request in flight: no double submit
    expect(await within(dialog).findByRole("button", { name: "Sending…" })).toBeDisabled();

    request.reject(new Error("offline"));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Couldn't send your request");
    expect(within(dialog).getByLabelText("Your name")).toHaveValue("Madina");

    await user.click(within(dialog).getByRole("button", { name: "Request booking" }));
    expect(await screen.findByText("Request received!")).toBeInTheDocument();
    expect(createBooking).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Madina", time: "19:00", date: toLocalIsoDate(new Date()) })
    );
  });
});

describe("Admin panel: failures", () => {
  it("rolls back a change that failed and shows a banner", async () => {
    const setAvailability = vi.fn().mockRejectedValue(new Error("offline"));
    const { user } = renderApp("/admin", "en", { services: createTestServices({ menu: { setAvailability } }) });
    await signIn({ user } as ReturnType<typeof renderApp>);
    await screen.findByRole("heading", { name: "Menu items (9)" });

    const [toggle] = screen.getAllByRole("switch", { name: "Toggle availability: Flat white" });
    await user.click(toggle);

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't save the changes");
    await waitFor(() =>
      expect(screen.getAllByRole("switch", { name: "Toggle availability: Flat white" })[0]).toHaveAttribute("aria-checked", "true")
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the item form open with an error when saving fails", async () => {
    const create = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const { user } = renderApp("/admin", "en", { services: createTestServices({ menu: { create } }) });
    await signIn({ user } as ReturnType<typeof renderApp>);
    await screen.findByRole("heading", { name: "Menu items (9)" });

    await user.click(screen.getByRole("button", { name: "Add item" }));
    const dialog = screen.getByRole("dialog", { name: "New item" });
    await user.type(within(dialog).getByLabelText("Name (EN)"), "Matcha latte");
    await user.type(within(dialog).getByLabelText("Description (EN)"), "Japanese green tea");
    await user.type(within(dialog).getByLabelText("Price (UZS)"), "35000");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Couldn't save the changes");
    expect(within(dialog).getByLabelText("Name (EN)")).toHaveValue("Matcha latte");

    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("shows loading, then an error with retry, on the bookings page", async () => {
    const request = deferred<never[]>();
    const listBookings = vi.fn().mockReturnValueOnce(request.promise).mockResolvedValue([
      { id: "b1", name: "Madina", phone: "+998901234567", date: "2026-11-02", time: "19:00", guests: 4, comment: "", status: "new", createdAt: "2026-10-28T08:00:00.000Z" },
    ]);
    const { user } = renderApp("/admin/bookings", "en", { services: createTestServices({ inbox: { peekBookings: undefined, listBookings } }) });
    await signIn({ user } as ReturnType<typeof renderApp>);

    // Loading: placeholder, and the counters in the header show a dash instead of a wrong zero
    expect(await screen.findByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("No bookings yet.", { exact: false })).not.toBeInTheDocument();

    request.reject(new Error("offline"));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't load the data");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Madina")).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load the data")).not.toBeInTheDocument();
  });

  it("removes private data from memory on sign-out", async () => {
    localStorage.setItem(
      "coffee-and-co:bookings:v1",
      JSON.stringify([
        { id: "b1", name: "Madina", phone: "+998901234567", date: "2026-11-02", time: "19:00", guests: 4, comment: "", status: "new", createdAt: "2026-10-28T08:00:00.000Z" },
      ])
    );
    const result = renderApp("/admin", "en");
    await signIn(result);
    await screen.findByRole("heading", { name: /Menu items/ });
    expect(result.queryClient.getQueryData(queryKeys.bookings)).toHaveLength(1);

    await result.user.click(screen.getByRole("button", { name: /Sign out|Log out|Logout/ }));
    await screen.findByRole("heading", { name: "Admin panel" });
    expect(result.queryClient.getQueryData(queryKeys.bookings)).toBeUndefined();
  });
});

describe("Admin login with a real backend", () => {
  const backendAuth = (signIn: () => Promise<"ok" | "invalid" | "forbidden" | "error">, session = false) => ({
    identifierType: "email" as const,
    peekSession: undefined,
    getSession: () => Promise.resolve(session),
    signIn,
  });

  it("asks for an email, hides the demo hint and explains each kind of failure", async () => {
    const signInFn = vi.fn().mockResolvedValueOnce("invalid").mockResolvedValueOnce("forbidden").mockResolvedValueOnce("error");
    const { user } = renderApp("/admin", "en", { services: createTestServices({ mode: "supabase", auth: backendAuth(signInFn) }) });

    const email = await screen.findByLabelText("Email");
    expect(email).toHaveAttribute("type", "email");
    expect(screen.queryByText(/Demo access/)).not.toBeInTheDocument();

    await user.type(email, "owner@cafe.uz");
    await user.type(screen.getByLabelText("Password"), "secret");
    const submit = screen.getByRole("button", { name: "Sign in" });

    await user.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password");
    await user.click(submit);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("This account has no admin access"));
    await user.click(submit);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Couldn't reach the server"));
    expect(signInFn).toHaveBeenCalledWith("owner@cafe.uz", "secret");
  });

  it("does not flash the login form while the saved session is being checked", async () => {
    const session = deferred<boolean>();
    const auth = { ...backendAuth(() => Promise.resolve("ok")), getSession: () => session.promise };
    renderApp("/admin", "en", { services: createTestServices({ mode: "supabase", auth }) });

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    session.resolve(true);
    expect(await screen.findByRole("heading", { name: /Menu items/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    // The "data is stored in this browser" note is for demo mode only
    expect(screen.queryByText(/Demo mode/)).not.toBeInTheDocument();
  });
});
