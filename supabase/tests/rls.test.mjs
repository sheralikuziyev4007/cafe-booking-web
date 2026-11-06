// Runs supabase/schema.sql and supabase/seed.sql on a real PostgreSQL engine (PGlite, PostgreSQL compiled to WebAssembly)
// and checks what visitors, signed-in non-admins and admins are allowed to do (Row Level Security).
// Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const schemaPath = fileURLToPath(new URL("../schema.sql", import.meta.url));
const seedPath = fileURLToPath(new URL("../seed.sql", import.meta.url));
const db = new PGlite();
let failures = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`); if (!cond) failures++; };

// --- minimal Supabase environment: roles and auth.jwt(), which Supabase provides in a real project ---
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.jwt() to anon, authenticated;
`);
await db.exec(readFileSync(schemaPath, "utf8"));
await db.exec(readFileSync(seedPath, "utf8"));
await db.exec(readFileSync(seedPath, "utf8")); // idempotent?

const as = async (who, fn) => {
  const claims = who === "admin" ? { role: "authenticated", app_metadata: { role: "admin" } }
               : who === "user" ? { role: "authenticated", app_metadata: {} } : {};
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify(claims)]);
  await db.exec(`set role ${who === "anon" ? "anon" : "authenticated"}`);
  try { return await fn(); } finally { await db.exec("reset role"); }
};
const tryQ = async (sql, params) => { try { return { r: await db.query(sql, params) }; } catch (e) { return { e: e.message }; } };

const count = async (t) => (await db.query(`select count(*)::int c from public.${t}`)).rows[0].c;

ok("seed inserted once (9 rows, not 18)", (await count("menu_items")) === 9);

const booking = `insert into public.bookings (name, phone, booking_date, booking_time, guests, comment) values ('Ali','+998 90 123 45 67','2026-12-01','19:00',4,'')`;

// --- anon ---
await as("anon", async () => {
  ok("anon can read the menu", (await count("menu_items")) === 9);
  ok("anon cannot insert menu items", !!(await tryQ(`insert into public.menu_items (name,description,category,price) values ('{}','{}','coffee',1)`)).e);
  const upd = await tryQ(`update public.menu_items set price = 1 returning id`);
  ok("anon cannot update menu items (0 rows or error)", upd.e || upd.r.rows.length === 0);
  ok("anon can create a booking", !(await tryQ(booking)).e);
  ok("anon cannot create a 'confirmed' booking", !!(await tryQ(booking.replace("'')", "'')").replace("comment)", "comment, status)").replace(",'')", ",'','confirmed')"))).e);
  const sel = await tryQ(`select * from public.bookings`);
  ok("anon cannot read bookings (0 rows or error)", sel.e || sel.r.rows.length === 0);
  ok("anon can create a message", !(await tryQ(`insert into public.messages (name,contact,message) values ('Ali','ali@mail.uz','Hi')`)).e);
  ok("anon cannot create a pre-read message", !!(await tryQ(`insert into public.messages (name,contact,message,is_read) values ('Ali','ali@mail.uz','Hi',true)`)).e);
  const sm = await tryQ(`select * from public.messages`);
  ok("anon cannot read messages", sm.e || sm.r.rows.length === 0);
  ok("anon cannot call move_menu_item", !!(await tryQ(`select public.move_menu_item(gen_random_uuid(), 1)`)).e);
  ok("check: guests > 12 rejected", !!(await tryQ(booking.replace(",4,", ",13,"))).e);
  ok("check: bad time rejected", !!(await tryQ(booking.replace("'19:00'", "'7pm'"))).e);
});

// --- signed-in, but not an admin ---
await as("user", async () => {
  const sel = await tryQ(`select * from public.bookings`);
  ok("non-admin user cannot read bookings", sel.e || sel.r.rows.length === 0);
  const upd = await tryQ(`update public.menu_items set price = 1 returning id`);
  ok("non-admin user cannot update menu", upd.e || upd.r.rows.length === 0);
  const del = await tryQ(`delete from public.messages returning id`);
  ok("non-admin user cannot delete messages", del.e || del.r.rows.length === 0);
  ok("non-admin user cannot insert menu item", !!(await tryQ(`insert into public.menu_items (name,description,category,price) values ('{}','{}','coffee',1)`)).e);
});

// --- admin ---
await as("admin", async () => {
  ok("admin reads bookings", (await count("bookings")) === 1);
  ok("admin reads messages", (await count("messages")) === 1);
  const u = await tryQ(`update public.bookings set status = 'confirmed' returning id`);
  ok("admin confirms a booking", !u.e && u.r.rows.length === 1);
  const m = await tryQ(`update public.messages set is_read = true returning id`);
  ok("admin marks a message read", !m.e && m.r.rows.length === 1);

  const ins = await tryQ(`insert into public.menu_items (name,description,category,price) values ('{"en":"X"}','{"en":"Y"}','coffee',1000) returning position`);
  ok("admin inserts a menu item at the end (position after all seeded items)", !ins.e && ins.r.rows[0].position > 9, ins.e || `position ${ins.r.rows[0]?.position}`);

  const order = async () => (await db.query(`select name->>'en' n from public.menu_items order by position`)).rows.map((r) => r.n);
  const before = await order();
  const id = (await db.query(`select id from public.menu_items where name->>'en' = 'Honey raf'`)).rows[0].id;
  const mv = await tryQ(`select public.move_menu_item($1, -1)`, [id]);
  const after = await order();
  ok("move up swaps with the previous item", !mv.e && after[0] === "Honey raf" && after[1] === "Flat white", mv.e || after.slice(0, 3).join(" | "));
  await tryQ(`select public.move_menu_item($1, 1)`, [id]);
  ok("move down restores the order", JSON.stringify(await order()) === JSON.stringify(before));
  const first = (await db.query(`select id from public.menu_items order by position limit 1`)).rows[0].id;
  await tryQ(`select public.move_menu_item($1, -1)`, [first]);
  ok("moving the first item up does nothing", JSON.stringify(await order()) === JSON.stringify(before));

  const d = await tryQ(`delete from public.menu_items where name->>'en' = 'X' returning id`);
  ok("admin deletes a menu item", !d.e && d.r.rows.length === 1);
  const db2 = await tryQ(`delete from public.bookings returning id`);
  ok("admin deletes bookings", !db2.e && db2.r.rows.length === 1);
});

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
