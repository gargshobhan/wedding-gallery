-- Framehaven platform administration and studio onboarding.
create table public.platform_admins(
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'ADMIN' check(role in ('ADMIN','SUPER_ADMIN')),
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;

alter table public.studios
  add column if not exists status text not null default 'ACTIVE' check(status in ('PENDING','ACTIVE','SUSPENDED','ARCHIVED')),
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists plan text not null default 'PILOT',
  add column if not exists storage_limit_bytes bigint,
  add column if not exists onboarded_at timestamptz;

create table public.usage_events(
  id bigint generated always as identity primary key,
  studio_id uuid not null references public.studios on delete cascade,
  event_id uuid references public.events on delete cascade,
  kind text not null,
  bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index usage_events_studio_created_idx on public.usage_events(studio_id,created_at desc);
create index usage_events_event_created_idx on public.usage_events(event_id,created_at desc);
alter table public.usage_events enable row level security;

-- Platform tables intentionally have no client policies. They are accessed only
-- by server routes using the service-role client after platform-admin auth.
-- Bootstrap the first admin manually after creating its Supabase Auth account:
-- insert into public.platform_admins(user_id,role) values ('<auth-user-uuid>','SUPER_ADMIN');
