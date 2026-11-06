import { SlotFullError } from "../errors";

/** Turns a Supabase error object into a regular Error so TanStack Query can handle it */
export function assertNoError(error: { message: string } | null): asserts error is null {
  // The database trigger in supabase/schema.sql raises SLOT_FULL when a time is fully booked
  if (error?.message === "SLOT_FULL") throw new SlotFullError();
  if (error) throw new Error(error.message);
}

/**
 * Row Level Security does not fail an update or delete it forbids — it simply changes zero rows.
 * Treating "nothing changed" as an error makes an expired session or a missing admin role visible in the UI.
 */
export function assertChanged(rows: unknown[] | null): void {
  if (!rows || rows.length === 0) throw new Error("Nothing was changed: the item no longer exists or you have no permission");
}
