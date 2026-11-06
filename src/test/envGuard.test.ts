import { expect, it } from "vitest";
import { isSupabaseConfigured } from "@/lib/supabase";

it("tests run in demo mode even when .env.local has Supabase keys", () => {
  expect(isSupabaseConfigured).toBe(false);
});
