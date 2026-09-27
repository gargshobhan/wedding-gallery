-- Studio-visible gallery PIN. This is intentionally retrievable because photographers
-- need to communicate wedding access codes to couples and guests.
alter table public.events add column if not exists access_pin text;

-- Keep the seeded demo convenient after applying this migration.
update public.events
set access_pin='1810'
where slug='simran-arshdeep' and access='PIN' and access_pin is null;
