import { booking } from '../../i18n/ui';
import { getAttribution } from '../attribution';
import { h, fill } from '../dom';
import { publicApi, clinicWhatsApp } from './config';
import { addDays, cairoMinutes, cairoToDate, dateKey, fmt, fmtKey, fmtTime, today } from './time';
import { BookingError, type Location, type PublicApi, type Slot, type VisitType } from './types';

const WINDOW_DAYS = 56;

export async function initBooking() {
  const found = document.querySelector<HTMLElement>('[data-booking]');
  if (!found) return;
  const root: HTMLElement = found;
  const lang = (root.dataset.lang === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const t = booking[lang];
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const tabs = [...root.querySelectorAll<HTMLElement>('[data-step-tab]')];
  const form = q<HTMLFormElement>('[data-form]');
  const errorEl = q('[data-error]');
  const submit = q<HTMLButtonElement>('[data-submit]');

  let api: PublicApi;
  let locations: Location[] = [];
  let slots: Slot[] = [];
  let loc: Location | null = null;
  let day: string | null = null;
  let slot: Slot | null = null;
  let weekStart = today();

  const locName = (l: Location) => (lang === 'ar' ? l.name_ar : l.name_en);
  const locAddr = (l: Location) => (lang === 'ar' ? l.address_ar : l.address_en);
  const slotsFor = (locationId: string) => slots.filter((s) => s.location_id === locationId);
  const daySlots = (k: string) => (loc ? slotsFor(loc.id).filter((s) => dateKey(s.starts_at) === k) : []);

  function go(n: number, focus = true) {
    panels.forEach((p, i) => (p.hidden = i !== n));
    tabs.forEach((tb, i) => {
      tb.classList.toggle('is-done', i < n);
      if (i === n) tb.setAttribute('aria-current', 'step');
      else tb.removeAttribute('aria-current');
    });
    if (focus) {
      const head = panels[n].querySelector<HTMLElement>('h2');
      head?.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    summary();
  }

  function summary() {
    q('[data-sum="location"]').textContent = loc ? locName(loc) : t.notChosen;
    q('[data-sum="date"]').textContent = slot ? fmt(lang, slot.starts_at, { weekday: 'long', day: 'numeric', month: 'long' }) : day ? fmtKey(lang, day, { weekday: 'long', day: 'numeric', month: 'long' }) : t.notChosen;
    q('[data-sum="time"]').textContent = slot ? fmtTime(lang, slot.starts_at) : t.notChosen;
  }

  function renderLocations() {
    const list = q('[data-locations]');
    if (!locations.length) { fill(list, h('p', { class: 'hint' }, t.noAvailability)); return; }
    fill(list, locations.map((l) => {
      const next = slotsFor(l.id)[0];
      const addr = locAddr(l);
      return h('button', { type: 'button', class: 'loc' + (loc?.id === l.id ? ' is-selected' : ''), 'aria-pressed': String(loc?.id === l.id), onclick: () => pickLocation(l) },
        h('span', { class: 'loc-name' }, locName(l)),
        addr ? h('span', { class: 'loc-addr' }, addr) : null,
        h('span', { class: 'loc-next' + (next ? '' : ' none') }, next ? `${t.nextAvailable}: ${fmt(lang, next.starts_at, { weekday: 'long', day: 'numeric', month: 'short' })} · ${fmtTime(lang, next.starts_at)}` : t.noAvailability),
      );
    }));
  }

  function pickLocation(l: Location) {
    loc = l;
    slot = null;
    const first = slotsFor(l.id)[0];
    day = first ? dateKey(first.starts_at) : null;
    weekStart = day ? startOfWeek(day) : startOfWeek(today());
    renderLocations();
    renderDays();
    renderTimes();
    go(1);
  }

  function startOfWeek(k: string) {
    const base = today();
    const diff = Math.floor((Date.parse(k) - Date.parse(base)) / 864e5);
    return addDays(base, Math.max(0, Math.floor(diff / 7) * 7));
  }

  function renderDays() {
    const box = q('[data-days]');
    const end = addDays(weekStart, 6);
    q('[data-week-label]').textContent = `${fmtKey(lang, weekStart, { day: 'numeric', month: 'short' })} – ${fmtKey(lang, end, { day: 'numeric', month: 'short' })}`;
    q<HTMLButtonElement>('[data-week="-1"]').disabled = weekStart <= today();
    q<HTMLButtonElement>('[data-week="1"]').disabled = addDays(weekStart, 7) > addDays(today(), WINDOW_DAYS - 1);
    const items = [];
    for (let i = 0; i < 7; i++) {
      const k = addDays(weekStart, i);
      const n = daySlots(k).length;
      items.push(h('button', {
        type: 'button', class: 'day' + (k === day ? ' is-selected' : ''), disabled: n === 0, 'aria-pressed': String(k === day),
        'aria-label': `${fmtKey(lang, k, { weekday: 'long', day: 'numeric', month: 'long' })}${n ? '' : ' — ' + t.noSlotsDay}`,
        onclick: () => { day = k; slot = null; renderDays(); renderTimes(); summary(); },
      },
        h('span', { class: 'dow' }, fmtKey(lang, k, { weekday: 'short' })),
        h('span', { class: 'dnum' }, fmtKey(lang, k, { day: 'numeric' })),
        h('span', { class: 'mon' }, fmtKey(lang, k, { month: 'short' })),
        h('span', { class: 'avail', 'aria-hidden': 'true' }),
      ));
    }
    fill(box, items);
  }

  function renderTimes() {
    const box = q('[data-times]');
    if (!day) { fill(box, h('p', { class: 'hint' }, loc && !slotsFor(loc.id).length ? t.noAvailability : t.pickDayFirst)); return; }
    const list = daySlots(day);
    if (!list.length) { fill(box, h('p', { class: 'hint' }, t.noSlotsDay)); return; }
    const groups: [string, Slot[]][] = [[t.morning, []], [t.afternoon, []], [t.evening, []]];
    list.forEach((s) => { const m = cairoMinutes(s.starts_at); groups[m < 12 * 60 ? 0 : m < 17 * 60 ? 1 : 2][1].push(s); });
    fill(box, groups.filter(([, g]) => g.length).map(([label, g]) =>
      h('div', { class: 'time-group' }, h('p', { class: 'time-label' }, label),
        h('div', { class: 'time-grid' }, g.map((s) => h('button', {
          type: 'button', class: 'time' + (slot?.id === s.id ? ' is-selected' : ''), 'aria-pressed': String(slot?.id === s.id),
          onclick: () => { slot = s; renderTimes(); summary(); go(2); setTimeout(() => form.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }), 50); },
        }, fmtTime(lang, s.starts_at)))))));
  }

  async function loadData() {
    const from = new Date().toISOString();
    const to = cairoToDate(addDays(today(), WINDOW_DAYS), 0).toISOString();
    [locations, slots] = await Promise.all([api.listLocations(), api.listOpenSlots(from, to)]);
    const now = Date.now() + 30 * 60e3;
    slots = slots.filter((s) => Date.parse(s.starts_at) > now);
  }

  function showError(code: string) {
    errorEl.textContent = (t.errors as Record<string, string>)[code] ?? t.errors.network;
    errorEl.hidden = false;
  }

  function ics(start: string, end: string, ref: string) {
    const z = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const place = loc ? [locName(loc), locAddr(loc)].filter(Boolean).join(' - ') : '';
    const esc = (s: string) => s.replace(/[\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Uroclinic//Booking//EN', 'BEGIN:VEVENT', `UID:${ref}@uroclinic`, `DTSTAMP:${z(new Date().toISOString())}`,
      `DTSTART:${z(start)}`, `DTEND:${z(end)}`, `SUMMARY:${esc(t.calTitle)}`, `LOCATION:${esc(place)}`, `DESCRIPTION:${esc(`${t.reference}: ${ref}`)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  }

  form.addEventListener('input', () => { errorEl.hidden = true; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const fd = new FormData(form);
    const name = String(fd.get('name') ?? '').trim();
    const phone = String(fd.get('phone') ?? '').trim();
    if (name.length < 2) { showError('invalid_name'); form.querySelector<HTMLInputElement>('[name="name"]')?.focus(); return; }
    if (!/^\+?[0-9\s-]{8,20}$/.test(phone)) { showError('invalid_phone'); form.querySelector<HTMLInputElement>('[name="phone"]')?.focus(); return; }
    if (!fd.get('consent')) { showError('consent_required'); return; }
    if (!slot) { go(1); return; }
    submit.disabled = true;
    submit.textContent = t.submitting;
    const a = getAttribution();
    try {
      const chosen = slot;
      const res = await api.book({
        slot_id: chosen.id, name, phone, visit_type: (fd.get('visit_type') as VisitType) ?? 'first', lang, consent: true,
        how_heard: (fd.get('how_heard') as string) || null, ...a,
      });
      q('[data-ref]').textContent = res.ref;
      const icsLink = q<HTMLAnchorElement>('[data-ics]');
      icsLink.href = ics(chosen.starts_at, chosen.ends_at, res.ref);
      const wa = q<HTMLAnchorElement>('[data-wa]');
      if (clinicWhatsApp) {
        const when = `${fmt(lang, chosen.starts_at, { weekday: 'long', day: 'numeric', month: 'long' })} ${fmtTime(lang, chosen.starts_at)}`;
        const msg = lang === 'ar' ? `مرحبًا، حجزت موعدًا عبر الموقع. رقم الحجز: ${res.ref} — ${loc ? locName(loc) : ''} — ${when}` : `Hello, I booked online. Reference: ${res.ref} — ${loc ? locName(loc) : ''} — ${when}`;
        wa.href = `https://wa.me/${clinicWhatsApp}?text=${encodeURIComponent(msg)}`;
        wa.hidden = false;
      }
      slots = slots.filter((s) => s.id !== chosen.id);
      go(3);
    } catch (err) {
      const code = err instanceof BookingError ? err.code : 'network';
      if (code === 'slot_unavailable') {
        slots = slots.filter((s) => s.id !== slot?.id);
        slot = null;
        try { await loadData(); } catch {}
        renderLocations(); renderDays(); renderTimes();
        go(1);
        const box = q('[data-times]');
        box.prepend(h('p', { class: 'form-error', role: 'alert' }, t.errors.slot_unavailable));
      } else {
        showError(code);
      }
    } finally {
      submit.disabled = false;
      submit.textContent = t.submit;
    }
  });

  root.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.back))));
  root.querySelectorAll<HTMLButtonElement>('[data-week]').forEach((b) => b.addEventListener('click', () => {
    weekStart = addDays(weekStart, Number(b.dataset.week) * 7);
    if (weekStart < today()) weekStart = today();
    renderDays();
  }));
  q('[data-restart]').addEventListener('click', () => {
    form.reset();
    slot = null; day = null; loc = locations.length === 1 ? locations[0] : null;
    renderLocations();
    if (loc) pickLocation(loc); else go(0);
  });

  try {
    api = await publicApi();
    if (api.demo) q('[data-demo]').hidden = false;
    await loadData();
    renderLocations();
    summary();
    if (locations.length === 1) pickLocation(locations[0]);
  } catch {
    fill(q('[data-locations]'), h('p', { class: 'form-error' }, t.errors.load));
  }
}
