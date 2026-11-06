import type { GetSupabaseClient } from "@/lib/supabase";
import type { InboxRepository } from "../types";
import { parseBookingRows, parseMessageRows, toBookingRow, toMessageRow } from "./rows";
import { assertChanged, assertNoError } from "./errors";

const BOOKINGS = "bookings";
const MESSAGES = "messages";

export function createSupabaseInboxRepository(getClient: GetSupabaseClient): InboxRepository {
  return {
    async listBookings() {
      const client = await getClient();
      const { data, error } = await client.from(BOOKINGS).select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return parseBookingRows(data);
    },

    async createBooking(booking) {
      const client = await getClient();
      // No .select() here: visitors may insert a booking but are not allowed to read bookings back
      const { error } = await client.from(BOOKINGS).insert(toBookingRow(booking));
      assertNoError(error);
    },

    async setBookingStatus(id, status) {
      const client = await getClient();
      const { data, error } = await client.from(BOOKINGS).update({ status }).eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async deleteBooking(id) {
      const client = await getClient();
      const { data, error } = await client.from(BOOKINGS).delete().eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async listMessages() {
      const client = await getClient();
      const { data, error } = await client.from(MESSAGES).select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return parseMessageRows(data);
    },

    async createMessage(message) {
      const client = await getClient();
      const { error } = await client.from(MESSAGES).insert(toMessageRow(message));
      assertNoError(error);
    },

    async markMessageRead(id) {
      const client = await getClient();
      const { data, error } = await client.from(MESSAGES).update({ is_read: true }).eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async deleteMessage(id) {
      const client = await getClient();
      const { data, error } = await client.from(MESSAGES).delete().eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },
  };
}
