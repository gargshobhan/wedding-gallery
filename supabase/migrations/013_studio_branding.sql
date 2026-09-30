alter table public.studios
  add column if not exists logo_url text,
  add column if not exists instagram_url text,
  add column if not exists primary_color text,
  add column if not exists accent_color text;

comment on column public.studios.logo_url is 'Public studio logo URL used in branded gallery surfaces.';
comment on column public.studios.instagram_url is 'Studio Instagram profile URL.';
comment on column public.studios.primary_color is 'Studio primary brand color as a CSS hex value.';
comment on column public.studios.accent_color is 'Studio accent brand color as a CSS hex value.';
