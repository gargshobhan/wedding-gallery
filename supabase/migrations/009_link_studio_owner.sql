-- Create the first studio login in Supabase Auth, then link that auth user to Foto Palace.
-- Replace the email before running this migration manually.
do $$
declare uid uuid; sid uuid;
begin
  select id into uid from auth.users where email='REPLACE_WITH_STUDIO_EMAIL';
  if uid is null then raise exception 'Create the studio user in Supabase Auth first and replace REPLACE_WITH_STUDIO_EMAIL'; end if;
  select id into sid from public.studios where slug='foto-palace';
  if sid is null then raise exception 'Foto Palace studio seed is missing'; end if;
  insert into public.studio_members(studio_id,user_id,role) values(sid,uid,'OWNER') on conflict(studio_id,user_id) do update set role='OWNER';
end $$;
