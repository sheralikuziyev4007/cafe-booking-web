import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;
type Operation = "select" | "insert" | "update" | "delete";

export interface RecordedCall {
  table: string;
  op: Operation;
  payload?: Row;
  filters: [string, unknown][];
  order?: { column: string; ascending: boolean };
  /** true when .select() was chained after insert/update/delete (the rows are read back) */
  returning: boolean;
}

/**
 * A tiny in-memory stand-in for the part of the Supabase query builder the repositories use.
 * It records every call, so tests can check exactly what would be sent to the server.
 */
export function createFakeSupabase(initial: Record<string, Row[]> = {}, options: { error?: string; rpc?: Record<string, unknown> } = {}) {
  const tables: Record<string, Row[]> = JSON.parse(JSON.stringify(initial));
  const calls: RecordedCall[] = [];
  const rpcCalls: { name: string; args: Row }[] = [];
  let counter = 0;

  function from(table: string) {
    const call: RecordedCall = { table, op: "select", filters: [], returning: false };
    calls.push(call);

    const execute = () => {
      if (options.error) return { data: null, error: { message: options.error } };
      const rows = (tables[table] ??= []);
      const matches = (row: Row) => call.filters.every(([column, value]) => row[column] === value);

      if (call.op === "insert") {
        rows.push({ id: `new-${++counter}`, ...call.payload });
        return { data: call.returning ? [{ id: `new-${counter}` }] : null, error: null };
      }
      if (call.op === "update") {
        const changed = rows.filter(matches);
        changed.forEach((row) => Object.assign(row, call.payload));
        return { data: call.returning ? changed.map((r) => ({ id: r.id })) : null, error: null };
      }
      if (call.op === "delete") {
        const removed = rows.filter(matches);
        tables[table] = rows.filter((row) => !matches(row));
        return { data: call.returning ? removed.map((r) => ({ id: r.id })) : null, error: null };
      }
      const sorted = [...rows];
      if (call.order) {
        const { column, ascending } = call.order;
        sorted.sort((a, b) => (String(a[column]) < String(b[column]) ? -1 : 1) * (ascending ? 1 : -1));
      }
      return { data: sorted, error: null };
    };

    const builder = {
      select: () => {
        call.returning = true;
        return builder;
      },
      order: (column: string, opts?: { ascending?: boolean }) => {
        call.order = { column, ascending: opts?.ascending ?? true };
        return builder;
      },
      insert: (payload: Row) => {
        call.op = "insert";
        call.payload = payload;
        return builder;
      },
      update: (payload: Row) => {
        call.op = "update";
        call.payload = payload;
        return builder;
      },
      delete: () => {
        call.op = "delete";
        return builder;
      },
      eq: (column: string, value: unknown) => {
        call.filters.push([column, value]);
        return builder;
      },
      then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(execute()).then(resolve, reject),
    };
    return builder;
  }

  const client = {
    from,
    rpc: (name: string, args: Row) => {
      rpcCalls.push({ name, args });
      if (options.error) return Promise.resolve({ data: null, error: { message: options.error } });
      return Promise.resolve({ data: options.rpc?.[name] ?? null, error: null });
    },
  };

  return { client: client as unknown as SupabaseClient, tables, calls, rpcCalls };
}
