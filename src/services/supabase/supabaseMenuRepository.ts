import type { GetSupabaseClient } from "@/lib/supabase";
import type { MenuRepository } from "../types";
import { parseMenuRows, toMenuRow } from "./rows";
import { assertChanged, assertNoError } from "./errors";

const TABLE = "menu_items";

export function createSupabaseMenuRepository(getClient: GetSupabaseClient): MenuRepository {
  return {
    async list() {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).select("*").order("position", { ascending: true });
      assertNoError(error);
      return parseMenuRows(data);
    },

    async create(item) {
      const client = await getClient();
      // `position` is filled by the database, so the new item lands at the end
      const { error } = await client.from(TABLE).insert(toMenuRow(item));
      assertNoError(error);
    },

    async update(id, item) {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).update(toMenuRow(item)).eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async remove(id) {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).delete().eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async setAvailability(id, isAvailable) {
      const client = await getClient();
      const { data, error } = await client.from(TABLE).update({ is_available: isAvailable }).eq("id", id).select("id");
      assertNoError(error);
      assertChanged(data);
    },

    async move(id, direction) {
      const client = await getClient();
      const { error } = await client.rpc("move_menu_item", { item_id: id, direction });
      assertNoError(error);
    },
  };
}
