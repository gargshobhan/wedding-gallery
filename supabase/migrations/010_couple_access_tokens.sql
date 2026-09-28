create table if not exists public.couple_access_tokens (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists couple_access_tokens_event_idx on public.couple_access_tokens(event_id,created_at desc);
alter table public.couple_access_tokens enable row level security;
