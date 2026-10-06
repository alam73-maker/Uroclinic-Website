# Uroclinic website v2

Astro static site. Arabic at `/`, English at `/en/`. Slot booking per location, clinic dashboard at `/admin/`.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:4321. Without Supabase keys the booking page and dashboard run in **demo mode** (sample slots, saved in your browser only).

## Where things are

| What | File |
|---|---|
| Home page | `src/components/Home.astro` |
| Other pages' text (Arabic + English) | `src/content/pages.ts` |
| Menu, footer, booking and dashboard wording | `src/i18n/ui.ts` |
| Design | `src/styles/global.css`, `booking.css`, `admin.css` |
| Booking flow | `src/components/BookingPage.astro`, `src/lib/booking/ui.ts` |
| Clinic dashboard | `src/components/AdminPage.astro`, `src/lib/booking/admin-ui.ts` |
| Database | `supabase/schema.sql` |
| Security headers and caching | `vercel.json` |
| Launch guard | `launch-config.json`, `scripts/predeploy.mjs` |

## Tests

```sh
npm run test:db
```

19 database checks: no double booking, patients cannot read bookings, only staff can create slots, cancel reopens a slot, phone limits, Cairo time.

Browser checks (`tests/e2e.cjs`) need Playwright and a running build. See `SETUP.md`.

## Go live

Follow `SETUP.md`.
