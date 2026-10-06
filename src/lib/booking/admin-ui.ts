import { admin, booking } from '../../i18n/ui';
import { h, fill } from '../dom';
import { adminApi, hasBackend } from './config';
import { addDays, cairoToDate, dateKey, fmtKey, fmtTime, today, weekday } from './time';
import { BookingError, type AdminApi, type Booking, type BookingStatus, type Location, type Slot, type VisitType } from './types';

const STATUSES: BookingStatus[] = ['held', 'confirmed', 'attended', 'no_show', 'cancelled'];

export async function initAdmin() {
  const found = document.querySelector<HTMLElement>('[data-admin]');
  if (!found) return;
  const root: HTMLElement = found;
  const lang = (root.dataset.lang === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const a = admin[lang];
  const b = booking[lang];
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const api: AdminApi = await adminApi();
  const tr = (s: string, n: number) => s.replace('{n}', String(n));
  const locName = (l?: Location) => (l ? (lang === 'ar' ? l.name_ar : l.name_en) : '—');

  let locations: Location[] = [];
  let bookings: Booking[] = [];
  const bf = { range: 'upcoming', location: '', status: '', search: '' };
  const av = { location: '', week: today() };

  let toastTimer = 0;
  function toast(msg: string, bad = false) {
    const el = q('[data-toast]');
    el.textContent = msg;
    el.classList.toggle('bad', bad);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (el.hidden = true), 2600);
  }
  const fail = (e: unknown) => { console.warn('[admin]', e); toast(e instanceof BookingError && (b.errors as Record<string, string>)[e.code] ? (b.errors as Record<string, string>)[e.code] : a.error, true); };

  if (api.demo) q('[data-demo]').hidden = false;

  async function boot() {
    const s = await api.session();
    q('[data-login]').hidden = !!s;
    q('[data-app]').hidden = !s;
    q('[data-signout]').hidden = !s;
    if (!s) {
      q('[data-login-form]').hidden = !hasBackend;
      q('[data-demo-signin]').hidden = hasBackend;
      return;
    }
    locations = await api.listAllLocations();
    av.location ||= locations[0]?.id ?? '';
    await loadBookings();
    renderAvailability();
    renderLocations();
  }

  q('[data-login-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    q('[data-login-error]').hidden = true;
    try { await api.signIn(String(f.get('email')), String(f.get('password'))); await boot(); }
    catch { q('[data-login-error]').hidden = false; }
  });
  q('[data-demo-signin]').addEventListener('click', async () => { await api.signIn('', ''); await boot(); });
  q('[data-signout]').addEventListener('click', async () => { await api.signOut(); await boot(); });

  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
    root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === tab)));
    root.querySelectorAll<HTMLElement>('[data-view]').forEach((v) => (v.hidden = v.dataset.view !== tab.dataset.tab));
    if (tab.dataset.tab === 'bookings') void loadBookings();
    if (tab.dataset.tab === 'availability') void renderAvailability();
  }));

  function range(): [string | null, string | null] {
    const t0 = cairoToDate(today(), 0).toISOString();
    const t1 = cairoToDate(addDays(today(), 1), 0).toISOString();
    if (bf.range === 'today') return [t0, t1];
    if (bf.range === 'upcoming') return [t0, null];
    if (bf.range === 'past') return [null, t0];
    return [null, null];
  }

  let bkToken = 0;
  async function loadBookings() {
    const token = ++bkToken;
    let rows: Booking[] = [];
    try { rows = await api.listBookings(...range()); } catch (e) { fail(e); }
    if (token !== bkToken) return;
    bookings = rows;
    if (bf.range === 'past') bookings.reverse();
    const held = bookings.filter((x) => x.status === 'held').length;
    const badge = q('[data-badge]');
    badge.textContent = String(held);
    badge.hidden = held === 0;
    renderBookings();
  }

  function sourceOf(x: Booking) {
    const heard = x.how_heard ? ((b.howHeardOptions as Record<string, string>)[x.how_heard] ?? (a.channels as Record<string, string>)[x.how_heard] ?? x.how_heard) : '';
    const utm = [x.utm_source, x.utm_medium, x.utm_campaign].filter(Boolean).join(' / ');
    return [heard, utm, !heard && !utm && x.referrer ? x.referrer : ''].filter(Boolean).join(' · ') || '—';
  }

  function filtered() {
    const s = bf.search.trim().toLowerCase();
    return bookings.filter((x) => (!bf.location || x.location_id === bf.location) && (!bf.status || x.status === bf.status)
      && (!s || x.patient_name.toLowerCase().includes(s) || x.phone.includes(s.replace(/[^0-9+]/g, '') || '§') || x.ref.toLowerCase().includes(s)));
  }

  function select(name: string, value: string, options: [string, string][], onchange: (v: string) => void, label: string) {
    return h('label', { class: 'adm-field' }, h('span', {}, label),
      h('select', { name, onchange: (e: Event) => onchange((e.target as HTMLSelectElement).value) },
        options.map(([v, l]) => h('option', { value: v, selected: v === value }, l))));
  }

  function renderBookings() {
    const view = q('[data-view="bookings"]');
    const controls = h('div', { class: 'adm-controls' },
      select('range', bf.range, Object.entries(a.filters) as [string, string][], (v) => { bf.range = v; void loadBookings(); }, lang === 'ar' ? 'عرض' : 'Show'),
      select('loc', bf.location, [['', a.allLocations], ...locations.map((l) => [l.id, locName(l)] as [string, string])], (v) => { bf.location = v; renderBookings(); }, a.location),
      select('status', bf.status, [['', a.allStatuses], ...STATUSES.map((s) => [s, a.status[s]] as [string, string])], (v) => { bf.status = v; renderBookings(); }, lang === 'ar' ? 'الحالة' : 'Status'),
      h('label', { class: 'adm-field grow' }, h('span', {}, lang === 'ar' ? 'بحث' : 'Search'),
        h('input', { type: 'search', value: bf.search, placeholder: lang === 'ar' ? 'الاسم أو الرقم أو رقم الحجز' : 'Name, phone or reference', oninput: (e: Event) => { bf.search = (e.target as HTMLInputElement).value; renderList(); } })),
    );
    const actions = h('div', { class: 'adm-actions' },
      h('p', { class: 'adm-count', 'data-count': '' }),
      h('button', { type: 'button', class: 'btn', onclick: () => exportCsv(filtered()) }, a.exportCsv),
      h('button', { type: 'button', class: 'btn btn--solid', onclick: () => manualBooking(view) }, a.addBooking),
    );
    const listBox = h('div', { class: 'adm-list', 'data-list': '' });
    fill(view, controls, actions, h('div', { 'data-manual': '' }), listBox);
    renderList();
  }

  function renderList() {
    const view = q('[data-view="bookings"]');
    const list = filtered();
    const box = view.querySelector<HTMLElement>('[data-list]')!;
    const held = list.filter((x) => x.status === 'held').length;
    view.querySelector('[data-count]')!.textContent = `${tr(a.count, list.length)}${held ? ` · ${held} ${a.awaiting}` : ''}`;
    if (!list.length) { fill(box, h('p', { class: 'adm-empty' }, a.noBookings)); return; }
    const byDay = new Map<string, Booking[]>();
    list.forEach((x) => { const k = dateKey(x.starts_at); byDay.set(k, [...(byDay.get(k) ?? []), x]); });
    fill(box, [...byDay].map(([k, rows]) => h('section', { class: 'adm-day' },
      h('h3', {}, fmtKey(lang, k, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
      rows.map((x) => bookingRow(x)))));
  }

  function bookingRow(x: Booking) {
    const l = locations.find((y) => y.id === x.location_id);
    const wa = x.phone.replace(/[^0-9]/g, '');
    const notes = h('textarea', { rows: 2, maxlength: 1000 }) as HTMLTextAreaElement;
    notes.value = x.staff_notes ?? '';
    const statusSel = h('select', {
      class: `status-sel s-${x.status}`, 'aria-label': lang === 'ar' ? 'الحالة' : 'Status',
      onchange: async (e: Event) => {
        const v = (e.target as HTMLSelectElement).value as BookingStatus;
        try { await api.updateBooking(x.id, { status: v }); x.status = v; (e.target as HTMLElement).className = `status-sel s-${v}`; toast(a.saved); await loadBookings(); }
        catch (err) { fail(err); }
      },
    }, STATUSES.map((s) => h('option', { value: s, selected: s === x.status }, a.status[s])));
    return h('article', { class: `adm-row st-${x.status}` },
      h('div', { class: 'r-time' }, fmtTime(lang, x.starts_at)),
      h('div', { class: 'r-main' },
        h('p', { class: 'r-name' }, x.patient_name, h('span', { class: 'r-ref', dir: 'ltr' }, x.ref)),
        h('p', { class: 'r-meta' }, locName(l), ' · ', b.visitTypes[x.visit_type as VisitType] ?? x.visit_type),
        h('p', { class: 'r-meta' }, `${a.source}: `, sourceOf(x)),
        h('details', {}, h('summary', {}, a.notes + (x.staff_notes ? ' •' : '')), notes,
          h('button', { type: 'button', class: 'adm-link', onclick: async () => { try { await api.updateBooking(x.id, { staff_notes: notes.value.trim() || null }); x.staff_notes = notes.value.trim() || null; toast(a.saved); } catch (e) { fail(e); } } }, a.save)),
      ),
      h('div', { class: 'r-contact' },
        h('a', { href: `tel:${x.phone}`, dir: 'ltr', class: 'r-phone' }, x.phone),
        h('span', { class: 'r-links' }, h('a', { href: `tel:${x.phone}` }, a.call), h('a', { href: `https://wa.me/${wa}`, target: '_blank', rel: 'noopener noreferrer' }, a.whatsapp)),
      ),
      h('div', { class: 'r-status' }, statusSel),
    );
  }

  function exportCsv(rows: Booking[]) {
    const cols = ['ref', 'date', 'time', 'location', 'patient_name', 'phone', 'visit_type', 'status', 'how_heard', 'utm_source', 'utm_medium', 'utm_campaign', 'landing_path', 'referrer', 'created_at', 'staff_notes'];
    const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const lines = rows.map((x) => [x.ref, dateKey(x.starts_at), fmtTime('en', x.starts_at), locName(locations.find((l) => l.id === x.location_id)), x.patient_name, x.phone, x.visit_type, x.status, x.how_heard, x.utm_source, x.utm_medium, x.utm_campaign, x.landing_path, x.referrer, x.created_at, x.staff_notes].map(cell).join(','));
    const blob = new Blob(['﻿' + [cols.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = h('a', { href: URL.createObjectURL(blob), download: `uroclinic-bookings-${today()}.csv` });
    document.body.append(link); link.click(); link.remove();
  }

  function manualBooking(view: HTMLElement) {
    const box = view.querySelector<HTMLElement>('[data-manual]')!;
    if (box.childElementCount) { fill(box); return; }
    let chosen: Slot | null = null;
    const locSel = h('select', { name: 'loc' }, locations.filter((l) => l.active).map((l) => h('option', { value: l.id }, locName(l)))) as HTMLSelectElement;
    const dateIn = h('input', { type: 'date', value: today(), min: today() }) as HTMLInputElement;
    const slotBox = h('div', { class: 'time-grid' });
    async function loadSlots() {
      chosen = null;
      const k = dateIn.value;
      if (!k) return;
      const open = await api.listOpenSlots(cairoToDate(k, 0).toISOString(), cairoToDate(addDays(k, 1), 0).toISOString());
      const mine = open.filter((s) => s.location_id === locSel.value && Date.parse(s.starts_at) > Date.now() + 30 * 60e3);
      fill(slotBox, mine.length ? mine.map((s) => h('button', { type: 'button', class: 'time', onclick: (e: Event) => {
        chosen = s; slotBox.querySelectorAll('.time').forEach((el) => el.classList.toggle('is-selected', el === e.currentTarget));
      } }, fmtTime(lang, s.starts_at))) : h('p', { class: 'adm-empty' }, b.noSlotsDay));
    }
    locSel.addEventListener('change', loadSlots);
    dateIn.addEventListener('change', loadSlots);
    const form = h('form', { class: 'adm-card adm-manual', onsubmit: async (e: Event) => {
      e.preventDefault();
      const f = new FormData(e.target as HTMLFormElement);
      if (!chosen) { toast(a.pickSlot, true); return; }
      try {
        const r = await api.book({ slot_id: chosen.id, name: String(f.get('name')), phone: String(f.get('phone')), visit_type: f.get('visit_type') as VisitType, lang, consent: true,
          how_heard: String(f.get('channel')), utm_source: null, utm_medium: null, utm_campaign: null, landing_path: 'admin', referrer: null });
        toast(`${a.saved} · ${r.ref}`);
        fill(box);
        await loadBookings();
      } catch (err) { fail(err); }
    } },
      h('h3', {}, a.addBooking),
      h('div', { class: 'adm-grid' },
        h('label', { class: 'adm-field' }, h('span', {}, a.location), locSel),
        h('label', { class: 'adm-field' }, h('span', {}, b.date), dateIn),
      ),
      h('p', { class: 'adm-label' }, a.pickSlot), slotBox,
      h('div', { class: 'adm-grid' },
        h('label', { class: 'adm-field' }, h('span', {}, b.name), h('input', { name: 'name', required: true, minlength: 2, maxlength: 80 })),
        h('label', { class: 'adm-field' }, h('span', {}, b.phone), h('input', { name: 'phone', type: 'tel', required: true, dir: 'ltr' })),
        h('label', { class: 'adm-field' }, h('span', {}, b.visitType), h('select', { name: 'visit_type' }, Object.entries(b.visitTypes).map(([k, v]) => h('option', { value: k }, v)))),
        h('label', { class: 'adm-field' }, h('span', {}, a.channel), h('select', { name: 'channel' }, Object.entries(a.channels).map(([k, v]) => h('option', { value: k }, v)))),
      ),
      h('div', { class: 'adm-actions' }, h('button', { type: 'submit', class: 'btn btn--solid' }, a.save), h('button', { type: 'button', class: 'adm-link', onclick: () => fill(box) }, a.cancel)),
    );
    fill(box, form);
    void loadSlots();
  }

  let avToken = 0;
  async function renderAvailability() {
    const token = ++avToken;
    const view = q('[data-view="availability"]');
    if (!locations.length) { fill(view, h('p', { class: 'adm-empty' }, a.noSlots)); return; }
    const weekEnd = addDays(av.week, 7);
    let slots: Slot[] = [];
    try { slots = await api.listSlots(av.location, cairoToDate(av.week, 0).toISOString(), cairoToDate(weekEnd, 0).toISOString()); } catch (e) { fail(e); }
    if (token !== avToken) return;
    const head = h('div', { class: 'adm-controls' },
      select('aloc', av.location, locations.map((l) => [l.id, locName(l)] as [string, string]), (v) => { av.location = v; void renderAvailability(); }, a.location),
      h('div', { class: 'week-nav' },
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': b.prevWeek, onclick: () => { av.week = addDays(av.week, -7); void renderAvailability(); } }, '‹'),
        h('span', { class: 'week-label' }, `${fmtKey(lang, av.week, { day: 'numeric', month: 'short' })} – ${fmtKey(lang, addDays(av.week, 6), { day: 'numeric', month: 'short' })}`),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': b.nextWeek, onclick: () => { av.week = addDays(av.week, 7); void renderAvailability(); } }, '›'),
      ),
    );
    const cols = [];
    for (let i = 0; i < 7; i++) {
      const k = addDays(av.week, i);
      const day = slots.filter((s) => dateKey(s.starts_at) === k);
      cols.push(h('div', { class: 'cal-day' + (k === today() ? ' is-today' : '') },
        h('p', { class: 'cal-head' }, h('strong', {}, fmtKey(lang, k, { weekday: 'short' })), ' ', fmtKey(lang, k, { day: 'numeric', month: 'short' })),
        day.length ? day.map((s) => slotChip(s)) : h('p', { class: 'cal-empty' }, a.noSlots)));
    }
    const keep = view.querySelector<HTMLFormElement>('form.adm-gen');
    fill(view, head, h('div', { class: 'cal' }, cols), keep ?? generator());
  }

  function slotChip(s: Slot) {
    const st = s.status ?? 'open';
    const editable = st === 'open' || st === 'blocked';
    return h('div', { class: `chip c-${st}` },
      h('span', {}, fmtTime(lang, s.starts_at)),
      h('span', { class: 'chip-st' }, a.slotStatus[st]),
      editable ? h('span', { class: 'chip-acts' },
        h('button', { type: 'button', onclick: async () => { try { await api.setSlotStatus(s.id, st === 'open' ? 'blocked' : 'open'); await renderAvailability(); } catch (e) { fail(e); } } }, st === 'open' ? a.block : a.unblock),
        h('button', { type: 'button', 'aria-label': a.remove, onclick: async () => { try { await api.deleteSlot(s.id); await renderAvailability(); } catch (e) { fail(e); } } }, '×'),
      ) : null);
  }

  function generator() {
    const days = [6, 0, 1, 2, 3, 4, 5];
    const form = h('form', { class: 'adm-card adm-gen' }) as HTMLFormElement;
    const preview = h('p', { class: 'adm-preview' });
    const field = (label: string, input: HTMLElement) => h('label', { class: 'adm-field' }, h('span', {}, label), input);
    form.append(
      h('h3', {}, a.addSlots),
      h('div', { class: 'adm-grid' },
        field(a.from, h('input', { type: 'date', name: 'from', value: today(), min: today(), required: true })),
        field(a.to, h('input', { type: 'date', name: 'to', value: addDays(today(), 27), min: today(), required: true })),
        field(a.startTime, h('input', { type: 'time', name: 'start', value: '17:00', required: true, step: 300 })),
        field(a.endTime, h('input', { type: 'time', name: 'end', value: '21:00', required: true, step: 300 })),
        field(a.length, h('select', { name: 'minutes' }, [10, 15, 20, 30, 45, 60].map((m) => h('option', { value: m, selected: m === 30 }, String(m))))),
      ),
      h('fieldset', { class: 'adm-days' }, h('legend', {}, a.days),
        days.map((d) => h('label', { class: 'choice' }, h('input', { type: 'checkbox', name: 'wd', value: d }), h('span', {}, a.weekdays[d])))),
      preview,
      h('button', { type: 'submit', class: 'btn btn--solid' }, a.create),
    );
    const read = () => {
      const f = new FormData(form);
      const [sh, sm] = String(f.get('start')).split(':').map(Number);
      const [eh, em] = String(f.get('end')).split(':').map(Number);
      return { from: String(f.get('from')), to: String(f.get('to')), weekdays: f.getAll('wd').map(Number), start: String(f.get('start')), end: String(f.get('end')), minutes: Number(f.get('minutes')), startM: sh * 60 + sm, endM: eh * 60 + em };
    };
    const count = () => {
      const g = read();
      if (!g.from || !g.to || g.to < g.from || !g.weekdays.length || g.endM <= g.startM) return 0;
      let n = 0;
      for (let k = g.from; k <= g.to; k = addDays(k, 1)) if (g.weekdays.includes(weekday(k))) n += Math.floor((g.endM - g.startM) / g.minutes);
      return n;
    };
    form.addEventListener('input', () => { preview.textContent = tr(a.willCreate, count()); });
    preview.textContent = tr(a.willCreate, 0);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const g = read();
      if (!count()) { toast(a.error, true); return; }
      try { const n = await api.generateSlots({ location_id: av.location, from: g.from, to: g.to, weekdays: g.weekdays, start: g.start, end: g.end, minutes: g.minutes }); toast(tr(a.created, n)); av.week = g.from; await renderAvailability(); }
      catch (err) { fail(err); }
    });
    return form;
  }

  function renderLocations() {
    const view = q('[data-view="locations"]');
    const rows = locations.map((l) => locationForm(l));
    fill(view, rows, h('div', { 'data-new': '' }, h('button', { type: 'button', class: 'btn btn--solid', onclick: (e: Event) => { (e.currentTarget as HTMLElement).replaceWith(locationForm(null)); } }, a.addLocation)));
  }

  function locationForm(l: Location | null) {
    const field = (label: string, name: string, value: string | null, attrs: Record<string, string | boolean> = {}) =>
      h('label', { class: 'adm-field' }, h('span', {}, label), h('input', { name, value: value ?? '', ...attrs }));
    const form = h('form', { class: 'adm-card', onsubmit: async (e: Event) => {
      e.preventDefault();
      const f = new FormData(e.target as HTMLFormElement);
      const map = String(f.get('map_url') ?? '').trim();
      try {
        await api.saveLocation({ id: l?.id, name_ar: String(f.get('name_ar')).trim(), name_en: String(f.get('name_en')).trim(), address_ar: String(f.get('address_ar')).trim() || null, address_en: String(f.get('address_en')).trim() || null, map_url: map || null, active: f.get('active') === 'on' });
        locations = await api.listAllLocations();
        av.location ||= locations[0]?.id ?? '';
        toast(a.saved);
        renderLocations();
      } catch (err) { fail(err); }
    } },
      h('h3', {}, l ? locName(l) : a.addLocation),
      h('div', { class: 'adm-grid' },
        field(a.nameAr, 'name_ar', l?.name_ar ?? '', { required: true, dir: 'rtl', minlength: '2' }),
        field(a.nameEn, 'name_en', l?.name_en ?? '', { required: true, dir: 'ltr', minlength: '2' }),
        field(a.addressAr, 'address_ar', l?.address_ar ?? '', { dir: 'rtl' }),
        field(a.addressEn, 'address_en', l?.address_en ?? '', { dir: 'ltr' }),
        field(a.mapUrl, 'map_url', l?.map_url ?? '', { type: 'url', dir: 'ltr', pattern: 'https://.*' }),
      ),
      h('label', { class: 'consent' }, h('input', { type: 'checkbox', name: 'active', checked: l ? l.active : true }), h('span', {}, a.active)),
      h('button', { type: 'submit', class: 'btn' }, a.save),
    );
    return form;
  }

  await boot();
}
