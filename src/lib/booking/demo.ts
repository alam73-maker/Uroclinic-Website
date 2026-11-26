import type { AdminApi, Booking, BookingInput, GenerateInput, Location, Slot, SlotStatus } from './types';
import { BookingError } from './types';
import { addDays, cairoToDate, today, weekday } from './time';

const KEY = 'uc_demo_v5';

interface DemoSlot extends Slot { status: SlotStatus }
interface State { locations: Location[]; slots: DemoSlot[]; bookings: Booking[]; signedIn: boolean }

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

function makeSlots(loc: string, from: string, to: string, days: number[], startM: number, endM: number, len: number, existing: DemoSlot[], capacity = 2, vipMinutes = 60): DemoSlot[] {
  const taken = new Set(existing.filter((s) => s.location_id === loc).map((s) => s.starts_at));
  const out: DemoSlot[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) {
    if (!days.includes(weekday(k))) continue;
    for (let m = startM; m + len <= endM; m += len) {
      const s = cairoToDate(k, m).toISOString();
      if (taken.has(s)) continue;
      taken.add(s);
      const vip = m < startM + vipMinutes;
      out.push({ id: uid(), location_id: loc, starts_at: s, ends_at: cairoToDate(k, m + len).toISOString(), status: 'open', tier: vip ? 'vip' : 'normal', capacity: vip ? 1 : capacity });
    }
  }
  return out;
}

function seed(): State {
  const a: Location = { id: uid(), name_ar: 'عيادة مصر الجديدة', name_en: 'Heliopolis clinic', address_ar: null, address_en: null, map_url: null, active: true, sort: 1 };
  const b: Location = { id: uid(), name_ar: 'عيادة القاهرة الجديدة', name_en: 'New Cairo clinic', address_ar: null, address_en: null, map_url: null, active: true, sort: 2 };
  const o: Location = { id: uid(), name_ar: 'استشارة أونلاين', name_en: 'Online consultation', address_ar: 'مكالمة فيديو للمرضى داخل مصر وخارجها', address_en: 'Video call, for patients in Egypt or abroad', map_url: null, active: true, sort: 3, online: true };
  const from = today();
  const to = addDays(from, 59);
  const slots = [
    ...makeSlots(a.id, from, to, [0], 14 * 60, 18 * 60, 20, []),
    ...makeSlots(a.id, from, to, [3], 12 * 60, 16 * 60, 20, []),
    ...makeSlots(b.id, from, to, [2], 19 * 60, 22 * 60, 20, []),
    ...makeSlots(b.id, from, to, [4], 12 * 60, 14 * 60, 20, []),
    ...makeSlots(o.id, from, to, [0], 10 * 60, 11 * 60, 20, [], 1, 0),
    ...makeSlots(o.id, from, to, [3], 22 * 60, 23 * 60, 20, [], 1, 0),
  ];
  slots.forEach((s, i) => { if (i % 9 === 4) s.status = 'held'; });
  return { locations: [a, b, o], slots, bookings: [], signedIn: false };
}

let mem: State | null = null;
function load(): State {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { mem = JSON.parse(raw) as State; return mem; }
  } catch {}
  mem = seed();
  save();
  return mem;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch {} }
const wait = <T>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));

function normalisePhone(p: string) {
  let v = p.replace(/[^0-9+]/g, '');
  if (/^00[1-9]/.test(v)) v = '+' + v.slice(2);
  if (/^0[0-9]{10}$/.test(v)) v = '+20' + v.slice(1);
  return v;
}

function syncSlot(st: State, slotId: string) {
  const slot = st.slots.find((s) => s.id === slotId);
  if (!slot || slot.status === 'blocked') return;
  const active = st.bookings.filter((b) => b.slot_id === slotId && b.status !== 'cancelled');
  slot.status = active.length < (slot.capacity ?? 2) ? 'open' : active.some((b) => b.status === 'held') ? 'held' : 'booked';
}
const activeCount = (st: State, slotId: string) => st.bookings.filter((b) => b.slot_id === slotId && b.status !== 'cancelled').length;

export const demoApi: AdminApi = {
  demo: true,
  async listLocations() { return wait(load().locations.filter((l) => l.active).sort((x, y) => x.sort - y.sort)); },
  async listOpenSlots(fromIso, toIso) {
    const now = new Date().toISOString();
    return wait(load().slots.filter((s) => s.status === 'open' && s.starts_at > now && s.starts_at >= fromIso && s.starts_at < toIso).sort((x, y) => x.starts_at.localeCompare(y.starts_at)).map(({ status, booked, ...s }) => s));
  },
  async book(input: BookingInput) {
    const st = load();
    const phone = normalisePhone(input.phone);
    const name = input.name.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (!input.consent) throw new BookingError('consent_required');
    if (name.length < 2 || name.length > 80) throw new BookingError('invalid_name');
    if (!/^\+?[0-9]{8,15}$/.test(phone)) throw new BookingError('invalid_phone');
    const now = Date.now();
    if (st.bookings.filter((b) => b.phone === phone && (b.status === 'held' || b.status === 'confirmed') && Date.parse(b.starts_at) > now).length >= 2) throw new BookingError('too_many_bookings');
    const slot = st.slots.find((s) => s.id === input.slot_id);
    if (!slot || slot.status === 'blocked' || Date.parse(slot.starts_at) < now + 30 * 60e3 || activeCount(st, slot.id) >= (slot.capacity ?? 2)) throw new BookingError('slot_unavailable');
    if (st.bookings.some((b) => b.slot_id === slot.id && b.phone === phone && b.status !== 'cancelled')) throw new BookingError('too_many_bookings');
    const ref = 'UC-' + Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, '0');
    st.bookings.push({
      id: uid(), ref, slot_id: slot.id, location_id: slot.location_id, starts_at: slot.starts_at, patient_name: name, phone,
      visit_type: input.visit_type, lang: input.lang, how_heard: input.how_heard, utm_source: input.utm_source, utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign, landing_path: input.landing_path, referrer: input.referrer, status: 'held', staff_notes: null, created_at: new Date().toISOString(),
    });
    syncSlot(st, slot.id);
    save();
    return wait({ ref, starts_at: slot.starts_at, location_id: slot.location_id });
  },
  async session() { return wait(load().signedIn ? { email: 'demo@uroclinic.local' } : null); },
  async signIn() { load().signedIn = true; save(); await wait(null); },
  async signOut() { load().signedIn = false; save(); await wait(null); },
  async listAllLocations() { return wait([...load().locations].sort((x, y) => x.sort - y.sort)); },
  async saveLocation(loc) {
    const st = load();
    const existing = loc.id ? st.locations.find((l) => l.id === loc.id) : undefined;
    if (existing) Object.assign(existing, loc);
    else st.locations.push({ id: uid(), address_ar: null, address_en: null, map_url: null, active: true, sort: st.locations.length + 1, ...loc } as Location);
    save();
    await wait(null);
  },
  async listSlots(locationId, fromIso, toIso) {
    const st = load();
    return wait(st.slots.filter((s) => s.location_id === locationId && s.starts_at >= fromIso && s.starts_at < toIso).sort((x, y) => x.starts_at.localeCompare(y.starts_at)).map((s) => ({ ...s, booked: activeCount(st, s.id) })));
  },
  async generateSlots(g: GenerateInput) {
    const st = load();
    const [sh, sm] = g.start.split(':').map(Number);
    const [eh, em] = g.end.split(':').map(Number);
    if (g.minutes < 5 || g.minutes > 240 || g.capacity < 1 || g.capacity > 10 || g.vipMinutes < 0 || g.vipMinutes > 480) throw new BookingError('invalid_length');
    if (g.to < g.from) throw new BookingError('invalid_range');
    if (eh * 60 + em <= sh * 60 + sm) throw new BookingError('invalid_hours');
    const made = makeSlots(g.location_id, g.from, g.to, g.weekdays, sh * 60 + sm, eh * 60 + em, g.minutes, st.slots, g.capacity, g.vipMinutes);
    st.slots.push(...made);
    save();
    return wait(made.length);
  },
  async setSlotStatus(id, status) {
    const s = load().slots.find((x) => x.id === id);
    if (s && (s.status === 'open' || s.status === 'blocked')) s.status = status;
    save();
    await wait(null);
  },
  async deleteSlot(id) {
    const st = load();
    if (st.bookings.some((b) => b.slot_id === id)) throw new BookingError('slot_unavailable');
    st.slots = st.slots.filter((s) => s.id !== id);
    save();
    await wait(null);
  },
  async listBookings(fromIso, toIso) {
    const st = load();
    return wait(st.bookings.filter((b) => (!fromIso || b.starts_at >= fromIso) && (!toIso || b.starts_at < toIso)).sort((x, y) => x.starts_at.localeCompare(y.starts_at)).map((b) => ({ ...b, tier: st.slots.find((s) => s.id === b.slot_id)?.tier })));
  },
  async updateBooking(id, patch) {
    const st = load();
    const b = st.bookings.find((x) => x.id === id);
    if (!b) return;
    const prev = b.status;
    Object.assign(b, patch);
    if (patch.status && patch.status !== prev) syncSlot(st, b.slot_id);
    save();
    await wait(null);
  },
};
