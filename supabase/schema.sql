create extension if not exists pgcrypto;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null check (char_length(name_ar) between 2 and 120),
  name_en text not null check (char_length(name_en) between 2 and 120),
  address_ar text,
  address_en text,
  map_url text check (map_url is null or map_url ~ '^https://'),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

do $$ begin
  create type public.slot_status as enum ('open', 'held', 'booked', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('held', 'confirmed', 'cancelled', 'attended', 'no_show');
exception when duplicate_object then null; end $$;

create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.slot_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (location_id, starts_at),
  check (ends_at > starts_at)
);
create index if not exists slots_location_time on public.slots (location_id, starts_at);
create index if not exists slots_open_time on public.slots (starts_at) where status = 'open';

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  slot_id uuid not null references public.slots(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  starts_at timestamptz not null,
  patient_name text not null check (char_length(patient_name) between 2 and 80),
  phone text not null check (phone ~ '^\+?[0-9]{8,15}$'),
  visit_type text not null check (visit_type in ('first', 'follow_up', 'second_opinion')),
  lang text not null default 'ar' check (lang in ('ar', 'en')),
  how_heard text check (how_heard is null or char_length(how_heard) <= 40),
  utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 150),
  landing_path text check (landing_path is null or char_length(landing_path) <= 300),
  referrer text check (referrer is null or char_length(referrer) <= 300),
  consent_at timestamptz not null,
  status public.booking_status not null default 'held',
  staff_notes text check (staff_notes is null or char_length(staff_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bookings_one_active_per_slot on public.bookings (slot_id) where status <> 'cancelled';
create index if not exists bookings_time on public.bookings (starts_at);
create index if not exists bookings_phone on public.bookings (phone);

create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

alter table public.locations enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.staff enable row level security;

drop policy if exists locations_public_read on public.locations;
create policy locations_public_read on public.locations for select to anon, authenticated using (active or public.is_staff());
drop policy if exists locations_staff_write on public.locations;
create policy locations_staff_write on public.locations for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists slots_public_open on public.slots;
create policy slots_public_open on public.slots for select to anon, authenticated using (status = 'open' and starts_at > now());
drop policy if exists slots_staff_all on public.slots;
create policy slots_staff_all on public.slots for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists bookings_staff_all on public.bookings;
create policy bookings_staff_all on public.bookings for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists staff_self_read on public.staff;
create policy staff_self_read on public.staff for select to authenticated using (user_id = auth.uid());

revoke all on public.bookings from anon;
revoke all on public.staff from anon;
grant select on public.locations, public.slots to anon, authenticated;
grant insert, update, delete on public.locations, public.slots, public.bookings to authenticated;
grant select on public.bookings, public.staff to authenticated;

create or replace function public.book_slot(
  p_slot_id uuid,
  p_name text,
  p_phone text,
  p_visit_type text,
  p_lang text,
  p_consent boolean,
  p_how_heard text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_landing_path text default null,
  p_referrer text default null
) returns table (ref text, starts_at timestamptz, location_id uuid)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_slot public.slots%rowtype;
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]]', '', 'g'));
  v_ref text;
begin
  if v_phone ~ '^00[1-9]' then v_phone := '+' || substr(v_phone, 3); end if;
  if v_phone ~ '^0[0-9]{10}$' then v_phone := '+20' || substr(v_phone, 2); end if;
  if p_consent is not true then raise exception 'consent_required'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^\+?[0-9]{8,15}$' then raise exception 'invalid_phone'; end if;
  if (select count(*) from public.bookings b where b.created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'busy';
  end if;
  if (select count(*) from public.bookings b where b.phone = v_phone and b.status in ('held', 'confirmed') and b.starts_at > now()) >= 2 then
    raise exception 'too_many_bookings';
  end if;

  select * into v_slot from public.slots s where s.id = p_slot_id for update;
  if not found or v_slot.status <> 'open' or v_slot.starts_at < now() + interval '30 minutes' then
    raise exception 'slot_unavailable';
  end if;

  update public.slots set status = 'held' where id = v_slot.id;

  loop
    v_ref := 'UC-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.bookings b where b.ref = v_ref);
  end loop;

  insert into public.bookings (ref, slot_id, location_id, starts_at, patient_name, phone, visit_type, lang, how_heard, utm_source, utm_medium, utm_campaign, landing_path, referrer, consent_at)
  values (v_ref, v_slot.id, v_slot.location_id, v_slot.starts_at, v_name, v_phone, p_visit_type,
          case when p_lang = 'en' then 'en' else 'ar' end,
          left(p_how_heard, 40), left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150), left(p_landing_path, 300), left(p_referrer, 300), now());

  return query select v_ref, v_slot.starts_at, v_slot.location_id;
end;
$$;

revoke all on function public.book_slot(uuid, text, text, text, text, boolean, text, text, text, text, text, text) from public;
grant execute on function public.book_slot(uuid, text, text, text, text, boolean, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.sync_slot_from_booking() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status = 'cancelled' then
      update public.slots set status = 'open' where id = new.slot_id and status in ('held', 'booked');
    elsif new.status in ('confirmed', 'attended', 'no_show') then
      update public.slots set status = 'booked' where id = new.slot_id;
    elsif new.status = 'held' then
      update public.slots set status = 'held' where id = new.slot_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_sync_slot on public.bookings;
create trigger bookings_sync_slot before update on public.bookings for each row execute function public.sync_slot_from_booking();

create or replace function public.generate_slots(
  p_location_id uuid,
  p_from date,
  p_to date,
  p_weekdays int[],
  p_start time,
  p_end time,
  p_minutes int
) returns int
language plpgsql security invoker set search_path = public as $$
declare
  d date;
  m int;
  start_m int := (extract(hour from p_start) * 60 + extract(minute from p_start))::int;
  end_m int := (extract(hour from p_end) * 60 + extract(minute from p_end))::int;
  n int := 0;
  inserted int;
begin
  if not public.is_staff() then raise exception 'not_staff'; end if;
  if p_minutes < 5 or p_minutes > 240 then raise exception 'invalid_length'; end if;
  if p_to < p_from or p_to - p_from > 180 then raise exception 'invalid_range'; end if;
  if end_m <= start_m then raise exception 'invalid_hours'; end if;
  d := p_from;
  while d <= p_to loop
    if extract(dow from d)::int = any (p_weekdays) then
      m := start_m;
      while m + p_minutes <= end_m loop
        insert into public.slots (location_id, starts_at, ends_at)
        values (p_location_id,
                (d + make_interval(mins => m)) at time zone 'Africa/Cairo',
                (d + make_interval(mins => m + p_minutes)) at time zone 'Africa/Cairo')
        on conflict (location_id, starts_at) do nothing;
        get diagnostics inserted = row_count;
        n := n + inserted;
        m := m + p_minutes;
      end loop;
    end if;
    d := d + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.generate_slots(uuid, date, date, int[], time, time, int) from public;
grant execute on function public.generate_slots(uuid, date, date, int[], time, time, int) to authenticated;
