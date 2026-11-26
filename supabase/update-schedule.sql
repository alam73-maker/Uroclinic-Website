delete from public.slots s
using public.locations l
where l.id = s.location_id
  and (l.name_en ilike '%heliopolis%' or l.name_en ilike '%new cairo%')
  and s.starts_at > now()
  and not exists (select 1 from public.bookings b where b.slot_id = s.id);

with sched (pattern, dow, start_m, end_m) as (
  values
    ('%heliopolis%', 0, 14 * 60, 17 * 60),
    ('%heliopolis%', 3, 12 * 60, 15 * 60),
    ('%new cairo%', 2, 19 * 60, 21 * 60),
    ('%new cairo%', 4, 12 * 60, 13 * 60)
),
loc as (
  select s.*, (select l.id from public.locations l where l.name_en ilike s.pattern order by l.sort, l.created_at limit 1) as location_id
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
       case when m < loc.start_m + 60 then 'vip' else 'normal' end,
       case when m < loc.start_m + 60 then 1 else 2 end
from loc
join days on extract(dow from days.d)::int = loc.dow
cross join lateral generate_series(loc.start_m, loc.end_m - 20, 20) as m
where loc.location_id is not null
  and (days.d + make_interval(mins => m)) at time zone 'Africa/Cairo' > now()
on conflict (location_id, starts_at) do nothing;

select l.name_en, to_char(s.starts_at at time zone 'Africa/Cairo', 'Dy DD Mon HH12:MI am') as kept_booked_time, b.ref, b.patient_name, b.phone, b.status
from public.bookings b
join public.slots s on s.id = b.slot_id
join public.locations l on l.id = s.location_id
where s.starts_at > now() and b.status <> 'cancelled'
order by s.starts_at;
