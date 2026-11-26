alter table public.locations add column if not exists online boolean not null default false;

insert into public.locations (name_ar, name_en, address_ar, address_en, sort, online)
select 'استشارة أونلاين', 'Online consultation', 'مكالمة فيديو للمرضى داخل مصر وخارجها', 'Video call, for patients in Egypt or abroad', 3, true
where not exists (select 1 from public.locations where online);

with sched (dow, start_m, end_m) as (
  values
    (0, 10 * 60, 11 * 60),
    (3, 22 * 60, 23 * 60)
),
loc as (
  select s.*, (select l.id from public.locations l where l.online order by l.sort, l.created_at limit 1) as location_id
  from sched s
),
days as (
  select gs::date as d
  from generate_series((now() at time zone 'Africa/Cairo')::date, (now() at time zone 'Africa/Cairo')::date + 59, interval '1 day') gs
)
insert into public.slots (location_id, starts_at, ends_at, tier, capacity)
select loc.location_id,
       (days.d + make_interval(mins => m)) at time zone 'Africa/Cairo',
       (days.d + make_interval(mins => m + 20)) at time zone 'Africa/Cairo',
       'normal',
       1
from loc
join days on extract(dow from days.d)::int = loc.dow
cross join lateral generate_series(loc.start_m, loc.end_m - 20, 20) as m
where loc.location_id is not null
  and (days.d + make_interval(mins => m)) at time zone 'Africa/Cairo' > now()
on conflict (location_id, starts_at) do nothing;
