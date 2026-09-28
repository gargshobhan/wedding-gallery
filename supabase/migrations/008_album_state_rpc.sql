create or replace function public.get_album_state(event_slug text)
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
with target as (
  select id,album_selection_locked from public.events where slug=event_slug limit 1
),
subs as (
  select s.id,s.submitted_at,s.revision,
    coalesce(array_agg(i.photo_id order by i.photo_id) filter (where i.photo_id is not null),'{}'::uuid[]) photo_ids
  from public.album_submissions s
  join target t on t.id=s.event_id
  left join public.album_selection_items i on i.submission_id=s.id
  group by s.id,s.submitted_at,s.revision
),
ranked as (
  select *,row_number() over(order by revision desc) rn from subs
),
latest as (select * from ranked where rn=1),
previous as (select * from ranked where rn=2)
select jsonb_build_object(
  'found',exists(select 1 from target),
  'locked',coalesce((select album_selection_locked from target),false),
  'submitted',coalesce(cardinality((select photo_ids from latest)),0)>0,
  'submittedAt',(select submitted_at from latest),
  'photoIds',coalesce(to_jsonb((select photo_ids from latest)),'[]'::jsonb),
  'currentRevision',(select revision from latest),
  'revisions',coalesce((select jsonb_agg(jsonb_build_object('revision',revision,'submittedAt',submitted_at,'photoCount',cardinality(photo_ids)) order by revision desc) from ranked),'[]'::jsonb),
  'delta',jsonb_build_object(
    'added',coalesce((select jsonb_agg(x) from (select unnest((select photo_ids from latest)) x except select unnest(coalesce((select photo_ids from previous),'{}'::uuid[]))) q),'[]'::jsonb),
    'removed',coalesce((select jsonb_agg(x) from (select unnest(coalesce((select photo_ids from previous),'{}'::uuid[])) x except select unnest((select photo_ids from latest))) q),'[]'::jsonb)
  )
)
$$;
