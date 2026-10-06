import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite({ extensions: { pgcrypto } });
const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`);
await db.exec(schema);

const staffId = '11111111-1111-1111-1111-111111111111';
const otherId = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users values ('${staffId}'), ('${otherId}'); insert into public.staff (user_id) values ('${staffId}');`);
const loc = (await db.query(`insert into public.locations (name_ar, name_en) values ('العيادة', 'Clinic') returning id`)).rows[0].id;
const loc2 = (await db.query(`insert into public.locations (name_ar, name_en, active) values ('مخفي', 'Hidden', false) returning id`)).rows[0].id;

async function as(role, sub, fn) {
  await db.exec(`set role ${role}; select set_config('request.jwt.sub', '${sub ?? ''}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.sub', '', false);`); }
}
async function rejects(promise, code) {
  try { await promise; } catch (e) { assert.match(e.message, new RegExp(code)); return; }
  assert.fail(`expected ${code}`);
}
let passed = 0;
const ok = (name) => { passed++; console.log('  ok', name); };

const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
const d2 = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
const allDays = '{0,1,2,3,4,5,6}';

await rejects(as('anon', null, () => db.query(`select public.generate_slots('${loc}', '${d}', '${d}', '${allDays}', '10:00', '12:00', 30)`)), 'not_staff|permission denied');
await rejects(as('authenticated', otherId, () => db.query(`select public.generate_slots('${loc}', '${d}', '${d}', '${allDays}', '10:00', '12:00', 30)`)), 'not_staff');
ok('only staff can create slots');

const n = await as('authenticated', staffId, () => db.query(`select public.generate_slots('${loc}', '${d}', '${d2}', '${allDays}', '17:00', '21:00', 30) as n`));
assert.equal(n.rows[0].n, 7 * 8);
const again = await as('authenticated', staffId, () => db.query(`select public.generate_slots('${loc}', '${d}', '${d2}', '${allDays}', '17:00', '21:00', 30) as n`));
assert.equal(again.rows[0].n, 0);
ok('generates 8 slots a day for 7 days and never duplicates');

const late = await as('authenticated', staffId, () => db.query(`select public.generate_slots('${loc}', '${d}', '${d}', '${allDays}', '22:30', '23:59', 60) as n`));
assert.equal(late.rows[0].n, 1);
ok('no slot runs past closing time');

const local = await db.query(`select to_char(starts_at at time zone 'Africa/Cairo', 'HH24:MI') as t from public.slots where location_id = '${loc}' order by starts_at limit 1`);
assert.equal(local.rows[0].t, '17:00');
ok('slot times are stored in Cairo time');

const fri = await as('authenticated', staffId, () => db.query(`select public.generate_slots('${loc2}', '${d}', '${d2}', '{5}', '10:00', '11:00', 60) as n`));
assert.equal(fri.rows[0].n, 1);
ok('weekday filter works');

await rejects(as('anon', null, () => db.query(`insert into public.slots (location_id, starts_at, ends_at) values ('${loc}', now() + interval '5 day', now() + interval '5 day 30 min')`)), 'permission denied|row-level security');
ok('public cannot create slots');

const pubLocs = await as('anon', null, () => db.query(`select id from public.locations`));
assert.equal(pubLocs.rows.length, 1);
ok('public sees only active locations');

const slotRows = (await as('anon', null, () => db.query(`select id from public.slots where location_id = '${loc}' order by starts_at`))).rows;
assert.equal(slotRows.length, 57);
const slot = slotRows[0].id;

const book = (sid, phone, name = 'Ahmed Ali') => as('anon', null, () => db.query(
  `select * from public.book_slot($1, $2, $3, 'first', 'ar', true, 'instagram', 'meta', 'paid', 'oct', '/', null)`, [sid, name, phone]));

await rejects(as('anon', null, () => db.query(`select * from public.book_slot($1, 'Ahmed', '01001234567', 'first', 'ar', false)`, [slot])), 'consent_required');
await rejects(book(slot, '123'), 'invalid_phone');
await rejects(book(slot, '01001234567', 'A'), 'invalid_name');
ok('rejects missing consent, bad phone, bad name');

const r1 = await book(slot, '+20 100 123 4567');
assert.match(r1.rows[0].ref, /^UC-[0-9A-F]{6}$/);
ok('patient can hold an open slot and gets a reference');

await rejects(book(slot, '01112223334'), 'slot_unavailable');
ok('a held slot cannot be double-booked');

const visible = await as('anon', null, () => db.query(`select count(*)::int as c from public.slots where id = '${slot}'`));
assert.equal(visible.rows[0].c, 0);
ok('held slot disappears from public availability');

await rejects(as('anon', null, () => db.query(`select * from public.bookings`)), 'permission denied');
const other = await as('authenticated', otherId, () => db.query(`select * from public.bookings`));
assert.equal(other.rows.length, 0);
ok('public and non-staff users cannot read bookings');

await book(slotRows[1].id, '00201001234567');
await rejects(book(slotRows[2].id, '01001234567'), 'too_many_bookings');
ok('one phone number cannot hold more than two upcoming slots');

const staffView = await as('authenticated', staffId, () => db.query(`select id, phone, how_heard, utm_source, status from public.bookings order by created_at`));
assert.equal(staffView.rows.length, 2);
assert.equal(staffView.rows[0].phone, '+201001234567');
assert.equal(staffView.rows[0].utm_source, 'meta');
ok('staff see bookings with normalised phone and source');

const bid = staffView.rows[0].id;
await as('authenticated', staffId, () => db.query(`update public.bookings set status = 'confirmed' where id = $1`, [bid]));
let s = await db.query(`select status from public.slots where id = $1`, [slot]);
assert.equal(s.rows[0].status, 'booked');
await as('authenticated', staffId, () => db.query(`update public.bookings set status = 'cancelled' where id = $1`, [bid]));
s = await db.query(`select status from public.slots where id = $1`, [slot]);
assert.equal(s.rows[0].status, 'open');
ok('confirming books the slot, cancelling reopens it');

const r2 = await book(slot, '01223334445');
assert.ok(r2.rows[0].ref);
ok('a reopened slot can be booked again');

await db.exec(`insert into public.slots (location_id, starts_at, ends_at) values ('${loc}', now() + interval '10 minutes', now() + interval '40 minutes')`);
const soon = (await db.query(`select id from public.slots where starts_at < now() + interval '20 minutes'`)).rows[0].id;
await rejects(book(soon, '01555555555'), 'slot_unavailable');
ok('slots starting within 30 minutes cannot be booked online');

const blocked = slotRows[5].id;
await as('authenticated', staffId, () => db.query(`update public.slots set status = 'blocked' where id = $1`, [blocked]));
await rejects(book(blocked, '01666666666'), 'slot_unavailable');
ok('blocked slots cannot be booked');

await rejects(as('anon', null, () => db.query(`update public.slots set status = 'open' where id = $1`, [slot])).then(async () => {
  const st = (await db.query(`select status from public.slots where id = $1`, [slot])).rows[0].status;
  if (st === 'held') throw new Error('permission denied (no rows updated)');
}), 'permission denied');
ok('public cannot change slot status');

console.log(`\n${passed} database checks passed`);
