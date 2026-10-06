import { createClient } from '@supabase/supabase-js';
import type { AdminApi, Booking, Location, Slot } from './types';
import { toBookingError } from './types';
import { remotePublicApi } from './remote-public';

import { SUPABASE_URL, SUPABASE_KEY } from './env';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'uc_staff' },
});

function check<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw toBookingError(r.error.message);
  return r.data as T;
}

export const remoteAdminApi: AdminApi = {
  ...remotePublicApi,
  async book(input) {
    const r = await sb.rpc('book_slot', {
      p_slot_id: input.slot_id, p_name: input.name, p_phone: input.phone, p_visit_type: input.visit_type, p_lang: input.lang, p_consent: input.consent,
      p_how_heard: input.how_heard, p_utm_source: input.utm_source, p_utm_medium: input.utm_medium, p_utm_campaign: input.utm_campaign,
      p_landing_path: input.landing_path, p_referrer: input.referrer,
    });
    const rows = check(r) as { ref: string; starts_at: string; location_id: string }[];
    return rows[0];
  },
  async session() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    const staff = await sb.from('staff').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
    if (!staff.data) { await sb.auth.signOut(); return null; }
    return { email: data.session.user.email ?? '' };
  },
  async signIn(email, password) {
    const r = await sb.auth.signInWithPassword({ email, password });
    if (r.error) throw toBookingError('not_staff');
    const s = await this.session();
    if (!s) throw toBookingError('not_staff');
  },
  async signOut() { await sb.auth.signOut(); },
  async listAllLocations() { return check(await sb.from('locations').select('*').order('sort')) as Location[]; },
  async saveLocation(loc) {
    const { id, ...rest } = loc;
    if (id) check(await sb.from('locations').update(rest).eq('id', id));
    else check(await sb.from('locations').insert(rest));
  },
  async listSlots(locationId, fromIso, toIso) {
    return check(await sb.from('slots').select('id,location_id,starts_at,ends_at,status').eq('location_id', locationId).gte('starts_at', fromIso).lt('starts_at', toIso).order('starts_at').limit(3000)) as Slot[];
  },
  async generateSlots(g) {
    const r = await sb.rpc('generate_slots', { p_location_id: g.location_id, p_from: g.from, p_to: g.to, p_weekdays: g.weekdays, p_start: g.start, p_end: g.end, p_minutes: g.minutes });
    return check(r) as number;
  },
  async setSlotStatus(id, status) { check(await sb.from('slots').update({ status }).eq('id', id).in('status', ['open', 'blocked'])); },
  async deleteSlot(id) { check(await sb.from('slots').delete().eq('id', id).in('status', ['open', 'blocked'])); },
  async listBookings(fromIso, toIso) {
    let q = sb.from('bookings').select('*').order('starts_at').limit(2000);
    if (fromIso) q = q.gte('starts_at', fromIso);
    if (toIso) q = q.lt('starts_at', toIso);
    return check(await q) as Booking[];
  },
  async updateBooking(id, patch) { check(await sb.from('bookings').update(patch).eq('id', id)); },
};
