# Connect the real booking system

About 15 minutes. You need a GitHub account.

## 1. Supabase (database)

1. Go to supabase.com → **New project**. Region: **Frankfurt (eu-central-1)**, closest to Egypt. Save the database password somewhere safe.
2. Left menu → **SQL Editor** → **New query**. Paste all of `supabase/schema.sql` → **Run**. You should see "Success".
3. Left menu → **Authentication** → **Users** → **Add user** → **Create new user**. Enter reception's email and a strong password. Tick **Auto confirm user**.
4. Copy that user's **UID** from the users list.
5. **SQL Editor** → new query → run (replace the UID):

```sql
insert into public.staff (user_id, display_name) values ('PASTE-UID-HERE', 'Reception');
```

Repeat 3–5 for each staff member who needs the dashboard.

6. **Authentication** → **Sign In / Providers** → **Email**: turn **off** "Allow new users to sign up". Only people you add can log in.
7. **Project Settings** → **API**. Copy:
   - **Project URL**
   - **anon public** key (never use the `service_role` key on the website)

## 2. Vercel (hosting)

1. Put this folder in a new **private** GitHub repository.
2. vercel.com → **Add New → Project** → import the repository. Framework: Astro (auto-detected).
3. **Environment Variables**:

| Name | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | Project URL from step 1.7 |
| `PUBLIC_SUPABASE_ANON_KEY` | anon public key from step 1.7 |
| `PUBLIC_CLINIC_WHATSAPP` | Clinic WhatsApp number, e.g. `201001234567` (optional) |

4. **Deploy**. Preview deployments work immediately. **Production is blocked** until every item in `launch-config.json` is filled in and set to `true`. That is deliberate: the clinic must approve addresses, phone, privacy policy and the Egyptian medical-advertising review first.

## 3. First use

1. Open `your-site/admin/` → sign in with the staff email.
2. **Locations** tab → add each clinic (Arabic + English name, address, Google Maps link).
3. **Availability** tab → pick a location → set dates, days, start/end time, appointment length → **Create times**.
4. Open `your-site/appointments/` → book a test appointment → it appears in **Bookings** as "Awaiting confirmation".

## How bookings work

- A patient picks location → day → time → name, mobile, visit type. The slot is **held** immediately so nobody else can take it.
- Reception confirms by phone/WhatsApp, then sets status: **Confirmed → Attended / No-show**, or **Cancelled** (frees the slot again).
- Online booking closes 30 minutes before a slot. One mobile number can hold at most 2 upcoming bookings.
- Phone and walk-in bookings: **Bookings → Add a phone booking**, so every patient is in one list.
- Every booking records its source: "How did you hear", campaign tags (`utm_source`, `utm_medium`, `utm_campaign`), Google/Meta/TikTok click IDs, and the landing page. **Export CSV** gives you the lead ledger for attribution reports.

## Campaign links

Tag every ad and bio link, e.g.:

```
https://your-site/appointments/?utm_source=instagram&utm_medium=paid&utm_campaign=prostate_oct
```

## Still needed from the clinic before launch

Final location addresses and hours, verified phone/WhatsApp, legal operator and privacy contact, data retention period, fee and cancellation rules, approved doctor bio and photos, Egyptian medical-advertising review, custom domain.
