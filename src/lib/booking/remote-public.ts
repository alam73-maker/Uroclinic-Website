import type { BookingInput, BookingResult, Location, PublicApi, Slot } from './types';
import { toBookingError } from './types';

import { SUPABASE_URL as URL_, SUPABASE_KEY as KEY } from './env';
const headers: Record<string, string> = KEY?.startsWith('sb_') ? { apikey: KEY, 'Content-Type': 'application/json' } : { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try { res = await fetch(`${URL_}/rest/v1/${path}`, { headers }); } catch { throw toBookingError('network'); }
  if (!res.ok) throw toBookingError('network');
  return res.json() as Promise<T>;
}

export const remotePublicApi: PublicApi = {
  demo: false,
  listLocations: () => get<Location[]>('locations?select=id,name_ar,name_en,address_ar,address_en,map_url,active,sort&active=is.true&order=sort.asc'),
  listOpenSlots: (fromIso, toIso) =>
    get<Slot[]>(`slots?select=id,location_id,starts_at,ends_at&status=eq.open&starts_at=gte.${encodeURIComponent(fromIso)}&starts_at=lt.${encodeURIComponent(toIso)}&order=starts_at.asc&limit=2000`),
  async book(i: BookingInput): Promise<BookingResult> {
    const body = {
      p_slot_id: i.slot_id, p_name: i.name, p_phone: i.phone, p_visit_type: i.visit_type, p_lang: i.lang, p_consent: i.consent,
      p_how_heard: i.how_heard, p_utm_source: i.utm_source, p_utm_medium: i.utm_medium, p_utm_campaign: i.utm_campaign,
      p_landing_path: i.landing_path, p_referrer: i.referrer,
    };
    let res: Response;
    try { res = await fetch(`${URL_}/rest/v1/rpc/book_slot`, { method: 'POST', headers, body: JSON.stringify(body) }); } catch { throw toBookingError('network'); }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw toBookingError(data?.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ref) throw toBookingError('network');
    return row as BookingResult;
  },
};
