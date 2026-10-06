export const TZ = 'Africa/Cairo';

const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function dateKey(d: Date | string): string {
  return keyFmt.format(typeof d === 'string' ? new Date(d) : d);
}

export function cairoMinutes(d: Date | string): number {
  const p = Object.fromEntries(partsFmt.formatToParts(typeof d === 'string' ? new Date(d) : d).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
}

function offsetMs(at: number): number {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return asUtc - Math.floor(at / 1000) * 1000;
}

export function cairoToDate(key: string, minutes: number): Date {
  const [y, m, d] = key.split('-').map(Number);
  const naive = Date.UTC(y, m - 1, d, 0, minutes);
  let ts = naive - offsetMs(naive);
  ts = naive - offsetMs(ts);
  return new Date(ts);
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function weekday(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function today(): string {
  return dateKey(new Date());
}

export function locale(lang: 'ar' | 'en') {
  return lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
}

export function fmt(lang: 'ar' | 'en', d: Date | string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale(lang), { timeZone: TZ, ...opts }).format(typeof d === 'string' ? new Date(d) : d);
}

export function fmtKey(lang: 'ar' | 'en', key: string, opts: Intl.DateTimeFormatOptions) {
  return fmt(lang, cairoToDate(key, 12 * 60), opts);
}

export function fmtTime(lang: 'ar' | 'en', d: Date | string) {
  return fmt(lang, d, { hour: 'numeric', minute: '2-digit', hour12: true });
}
