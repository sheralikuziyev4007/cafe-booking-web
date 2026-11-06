import { describe, expect, it, vi } from "vitest";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAuthService } from "./supabaseAuthService";

const session = (role?: string) => ({ user: { app_metadata: role ? { role } : {} } }) as unknown as Session;

/** The few auth methods the service uses */
function fakeClient(opts: { signIn?: unknown; session?: Session | null } = {}) {
  let listener: ((event: string, session: Session | null) => void) | undefined;
  const unsubscribe = vi.fn();
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const auth = {
    signInWithPassword: vi.fn().mockResolvedValue(opts.signIn),
    getSession: vi.fn().mockResolvedValue({ data: { session: opts.session ?? null } }),
    signOut,
    onAuthStateChange: vi.fn((callback: typeof listener) => {
      listener = callback;
      return { data: { subscription: { unsubscribe } } };
    }),
  };
  return {
    client: { auth } as unknown as SupabaseClient,
    auth,
    signOut,
    unsubscribe,
    emit: (s: Session | null) => listener?.("SIGNED_IN", s),
  };
}

describe("Supabase auth service", () => {
  it("asks for an email", () => {
    expect(createSupabaseAuthService(() => Promise.resolve(fakeClient().client)).identifierType).toBe("email");
  });

  it("signs in an admin", async () => {
    const { client, auth } = fakeClient({ signIn: { data: { session: session("admin") }, error: null } });
    const service = createSupabaseAuthService(() => Promise.resolve(client));

    await expect(service.signIn("  owner@cafe.uz ", "secret")).resolves.toBe("ok");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "owner@cafe.uz", password: "secret" });
  });

  it("rejects an account that is not an admin and signs it out again", async () => {
    const { client, signOut } = fakeClient({ signIn: { data: { session: session() }, error: null } });
    const service = createSupabaseAuthService(() => Promise.resolve(client));

    await expect(service.signIn("guest@mail.uz", "secret")).resolves.toBe("forbidden");
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it.each([
    ["wrong credentials", { name: "AuthApiError", status: 400 }, "invalid"],
    ["network failure", { name: "AuthRetryableFetchError", status: 0 }, "error"],
    ["rate limit", { name: "AuthApiError", status: 429 }, "error"],
    ["server error", { name: "AuthApiError", status: 500 }, "error"],
  ])("maps %s to %s", async (_label, error, expected) => {
    const { client } = fakeClient({ signIn: { data: { session: null }, error } });
    const service = createSupabaseAuthService(() => Promise.resolve(client));
    await expect(service.signIn("owner@cafe.uz", "x")).resolves.toBe(expected);
  });

  it("reports an error when the client cannot be created", async () => {
    const service = createSupabaseAuthService(() => Promise.reject(new Error("not configured")));
    await expect(service.signIn("owner@cafe.uz", "x")).resolves.toBe("error");
  });

  it("treats only admin sessions as signed in", async () => {
    const admin = createSupabaseAuthService(() => Promise.resolve(fakeClient({ session: session("admin") }).client));
    const other = createSupabaseAuthService(() => Promise.resolve(fakeClient({ session: session("staff") }).client));
    const none = createSupabaseAuthService(() => Promise.resolve(fakeClient({ session: null }).client));

    await expect(admin.getSession()).resolves.toBe(true);
    await expect(other.getSession()).resolves.toBe(false);
    await expect(none.getSession()).resolves.toBe(false);
  });

  it("notifies about session changes until unsubscribed", async () => {
    const fake = fakeClient();
    const service = createSupabaseAuthService(() => Promise.resolve(fake.client));
    const listener = vi.fn();

    const stop = service.onChange(listener);
    await vi.waitFor(() => expect(fake.auth.onAuthStateChange).toHaveBeenCalled());

    fake.emit(session("admin"));
    fake.emit(null);
    expect(listener.mock.calls).toEqual([[true], [false]]);

    stop();
    expect(fake.unsubscribe).toHaveBeenCalled();
  });

  it("does not subscribe if it was cancelled before the client was ready", async () => {
    const fake = fakeClient();
    let ready!: () => void;
    const service = createSupabaseAuthService(() => new Promise((resolve) => (ready = () => resolve(fake.client))));

    service.onChange(vi.fn())();
    ready();
    await Promise.resolve();
    await Promise.resolve();

    expect(fake.auth.onAuthStateChange).not.toHaveBeenCalled();
  });

  it("signs out of this browser only", async () => {
    const { client, signOut } = fakeClient();
    await createSupabaseAuthService(() => Promise.resolve(client)).signOut();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
