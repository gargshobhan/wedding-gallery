alter table public.events add column if not exists access_pin text;
update public.events set access_pin='1810' where slug='simran-arshdeep' and access='PIN' and access_pin is null;
