alter table public.events add column if not exists original_downloads_enabled boolean not null default false;
alter table public.photos add column if not exists proof_storage_path text;
