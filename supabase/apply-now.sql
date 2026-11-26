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

delete from public.slots s
using public.locations l
where l.id = s.location_id
  and (l.name_en ilike '%heliopolis%' or l.name_en ilike '%new cairo%')
  and s.starts_at > now()
  and not exists (select 1 from public.bookings b where b.slot_id = s.id);

with sched (pattern, dow, start_m, end_m) as (
  values
    ('%heliopolis%', 0, 14 * 60, 18 * 60),
    ('%heliopolis%', 3, 12 * 60, 16 * 60),
    ('%new cairo%', 2, 19 * 60, 22 * 60),
    ('%new cairo%', 4, 12 * 60, 14 * 60)
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


create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_booking() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_key text;
  v_loc text;
  v_tier text;
  v_online boolean;
  v_when text;
  v_visit text;
  v_name text;
  v_wa text;
  v_html text;
begin
  select ds.decrypted_secret into v_key from vault.decrypted_secrets ds where ds.name = 'resend_api_key' limit 1;
  if v_key is null then
    return new;
  end if;

  select l.name_en, s.tier, l.online into v_loc, v_tier, v_online
  from public.slots s join public.locations l on l.id = s.location_id
  where s.id = new.slot_id;

  v_when := to_char(new.starts_at at time zone 'Africa/Cairo', 'FMDay DD Mon YYYY, FMHH12:MI am');
  v_visit := case new.visit_type when 'first' then 'First visit' when 'follow_up' then 'Follow-up' else 'Second opinion' end;
  v_name := replace(replace(replace(new.patient_name, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  v_wa := regexp_replace(new.phone, '[^0-9]', '', 'g');

  v_html := '<div style="font-family:Arial,sans-serif;font-size:15px;color:#0d2033;line-height:1.6">'
    || '<h2 style="margin:0 0 12px">New booking ' || new.ref || '</h2>'
    || '<p style="margin:0 0 4px"><b>' || case when v_online then 'Online video consultation' when v_tier = 'vip' then 'VIP (seen exactly on time)' else 'Standard' end || '</b></p>'
    || '<p style="margin:0 0 16px">' || coalesce(v_loc, '') || '<br>' || v_when || '</p>'
    || '<p style="margin:0 0 4px"><b>Patient:</b> ' || v_name || '</p>'
    || '<p style="margin:0 0 4px"><b>Phone:</b> <a href="tel:' || new.phone || '">' || new.phone || '</a> &nbsp; <a href="https://wa.me/' || v_wa || '">WhatsApp</a></p>'
    || '<p style="margin:0 0 4px"><b>Visit:</b> ' || v_visit || '</p>'
    || '<p style="margin:0 0 4px"><b>Heard about us:</b> ' || coalesce(new.how_heard, '-') || '</p>'
    || '<p style="margin:0 0 16px"><b>Source:</b> ' || coalesce(new.utm_source, '-') || ' / ' || coalesce(new.utm_campaign, '-') || '</p>'
    || '<p style="margin:0"><a href="https://www.osmanuroclinic.com/en/admin/">Open the dashboard to confirm</a></p>'
    || '</div>';

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Osman Uroclinic <onboarding@resend.dev>',
      'to', jsonb_build_array('alam73@aucegypt.edu'),
      'subject', 'New booking ' || new.ref || ': ' || coalesce(v_loc, '') || ', ' || v_when || case when v_online then ' (online)' when v_tier = 'vip' then ' (VIP)' else '' end,
      'html', v_html
    )
  );
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.notify_new_booking() from public, anon, authenticated;

drop trigger if exists bookings_notify on public.bookings;
create trigger bookings_notify after insert on public.bookings
for each row execute function public.notify_new_booking();
