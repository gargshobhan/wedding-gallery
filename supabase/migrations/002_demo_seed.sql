-- Development/pilot seed for the current Yaadein demo.
-- Safe to run repeatedly.
insert into public.studios(name,slug,location,whatsapp_number)
values('Foto Palace Photography','foto-palace','Sangrur, Punjab',null)
on conflict(slug) do update set name=excluded.name,location=excluded.location;

insert into public.events(studio_id,slug,couple,event_date,venue,access,pin_hash,status,album_limit,guest_uploads_enabled)
select s.id,'simran-arshdeep','Simran & Arshdeep','2026-10-18','Sangrur, Punjab','PUBLIC_LINK',null,'LIVE',150,true
from public.studios s where s.slug='foto-palace'
on conflict(studio_id,slug) do update set
couple=excluded.couple,event_date=excluded.event_date,venue=excluded.venue,status='LIVE',guest_uploads_enabled=true;
