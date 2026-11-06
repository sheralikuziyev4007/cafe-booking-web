import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderApp } from "./renderApp";

describe("Forms (React Hook Form + Zod)", () => {
  it("login asks for both fields before contacting the server", async () => {
    const { user } = renderApp("/admin", "en");
    await screen.findByRole("heading", { name: "Admin panel" });

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findAllByText("This field is required")).toHaveLength(2);
    expect(screen.queryByText("Wrong username or password")).not.toBeInTheDocument();
  });

  it("contact form shows an error after submit and clears it as soon as the field is fixed", async () => {
    const { user } = renderApp("/", "en");
    const form = screen.getByRole("form", { name: /contact/i });

    await user.type(within(form).getByLabelText("Your name"), "Ali");
    await user.type(within(form).getByLabelText("Phone or email"), "ali@mail");
    await user.type(within(form).getByLabelText("Message"), "Hello");
    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(await within(form).findByText(/Enter a valid email or a full phone number/)).toBeInTheDocument();

    await user.type(within(form).getByLabelText("Phone or email"), ".uz");
    await user.click(within(form).getByRole("button", { name: /Send/ }));
    expect(await within(form).findByText("Message sent — we will get back to you soon.")).toBeInTheDocument();
    // the form is cleared after a successful send
    expect(within(form).getByLabelText("Your name")).toHaveValue("");
  });

  it("menu form keeps what was typed in each language when switching tabs", async () => {
    const { user } = renderApp("/admin", "en");
    await screen.findByRole("heading", { name: "Admin panel" });
    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await user.click(await screen.findByRole("button", { name: "Add item" }));
    const dialog = screen.getByRole("dialog", { name: "New item" });

    await user.type(within(dialog).getByLabelText("Name (EN)"), "Mocha");
    await user.click(within(dialog).getByRole("tab", { name: /Русский/ }));
    expect(within(dialog).getByLabelText("Name (RU)")).toHaveValue("");
    await user.type(within(dialog).getByLabelText("Name (RU)"), "Мокка");
    await user.click(within(dialog).getByRole("tab", { name: /English/ }));

    expect(within(dialog).getByLabelText("Name (EN)")).toHaveValue("Mocha");
    await user.click(within(dialog).getByRole("tab", { name: /Русский/ }));
    expect(within(dialog).getByLabelText("Name (RU)")).toHaveValue("Мокка");
  });
});
