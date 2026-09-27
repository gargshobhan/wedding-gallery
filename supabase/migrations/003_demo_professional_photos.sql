-- Stable professional demo-photo rows used by the album-selection pilot.
-- The image bytes remain in the existing demo URLs until professional uploads move to Storage.
insert into public.photos(id,studio_id,event_id,source,storage_path,original_name,category,title)
select v.id,s.id,e.id,'PROFESSIONAL',v.path,v.name,v.category,v.title
from public.studios s join public.events e on e.studio_id=s.id and e.slug='simran-arshdeep'
cross join (values
('00000000-0000-4000-8000-000000000001'::uuid,'demo/professional/1','PHOTO-1','Wedding','The Arrival'),
('00000000-0000-4000-8000-000000000002'::uuid,'demo/professional/2','PHOTO-2','Couple','Golden Hour'),
('00000000-0000-4000-8000-000000000003'::uuid,'demo/professional/3','PHOTO-3','Reception','Celebration'),
('00000000-0000-4000-8000-000000000004'::uuid,'demo/professional/4','PHOTO-4','Portraits','Together'),
('00000000-0000-4000-8000-000000000005'::uuid,'demo/professional/5','PHOTO-5','Wedding','Family'),
('00000000-0000-4000-8000-000000000006'::uuid,'demo/professional/6','PHOTO-6','Reception','The Night')
) as v(id,path,name,category,title)
where s.slug='foto-palace'
on conflict(id) do update set title=excluded.title,category=excluded.category,original_name=excluded.original_name;
