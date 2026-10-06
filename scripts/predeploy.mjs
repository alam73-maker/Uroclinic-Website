import { readFileSync } from 'node:fs';

const env = process.env.VERCEL_ENV ?? 'local';
const cfg = JSON.parse(readFileSync(new URL('../launch-config.json', import.meta.url), 'utf8'));
const missing = Object.entries(cfg).filter(([, v]) => v === '' || v === false).map(([k]) => k);

if (missing.length) {
  console.warn('Launch checklist incomplete. The site stays hidden from Google (noindex) until these are done:\n - ' + missing.join('\n - '));
}
console.log(`Predeploy check passed for ${env}.`);
