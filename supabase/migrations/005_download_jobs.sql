create type public.download_job_status as enum ('QUEUED','PROCESSING','READY','FAILED');
create table public.download_jobs(
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  status public.download_job_status not null default 'QUEUED',
  photo_ids uuid[] not null default '{}',
  storage_path text,
  file_name text not null,
  photo_count int not null default 0,
  size_bytes bigint,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index download_jobs_event_idx on public.download_jobs(event_id,created_at desc);
alter table public.download_jobs enable row level security;
