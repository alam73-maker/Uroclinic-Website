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
