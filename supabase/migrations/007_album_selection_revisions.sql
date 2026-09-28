alter table public.events add column if not exists album_selection_locked boolean not null default false;

alter table public.album_submissions add column if not exists revision int;
update public.album_submissions set revision=1 where revision is null;
alter table public.album_submissions alter column revision set not null;
alter table public.album_submissions alter column revision set default 1;

alter table public.album_submissions drop constraint if exists album_submissions_event_id_key;
create unique index if not exists album_submissions_event_revision_idx on public.album_submissions(event_id,revision);
create index if not exists album_submissions_event_latest_idx on public.album_submissions(event_id,revision desc);
