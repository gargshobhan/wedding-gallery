import archiver from "archiver";
import{Readable,PassThrough}from"node:stream";
import{createAdminClient}from"@/lib/supabase/admin";

const bucket="wedding-photos";

export async function processDownloadJob(jobId:string){
 const s=createAdminClient();
 try{
  const{data:job,error:je}=await s.from("download_jobs").select("id,event_id,photo_ids,file_name").eq("id",jobId).single();if(je||!job)throw je||new Error("Download job not found");
  await s.from("download_jobs").update({status:"PROCESSING",error:null}).eq("id",jobId);
  let q=s.from("photos").select("id,storage_path,proof_storage_path,original_name,size_bytes").eq("event_id",job.event_id).eq("source","PROFESSIONAL");
  if(!job.photo_ids?.length)throw new Error("Download job has no photos");q=q.in("id",job.photo_ids);
  const{data:photos,error:pe}=await q;if(pe)throw pe;photos=(photos||[]).filter((p:any)=>p.proof_storage_path&&!p.storage_path.startsWith("demo/"));if(!photos.length)throw new Error("No photos to download");if(photos.length!==job.photo_ids.length)throw new Error("One or more downloadable photos are no longer available");
  const zip=archiver("zip",{zlib:{level:0}});const out=new PassThrough();zip.pipe(out);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw new Error("Supabase credentials missing");
  const path=`${job.event_id}/downloads/${jobId}.zip`;
  const upload=fetch(`${url}/storage/v1/object/${bucket}/${path}`,{method:"POST",headers:{Authorization:`Bearer ${key}`,apikey:key,"Content-Type":"application/zip","x-upsert":"true"},body:out as any,duplex:"half" as any});
  for(const p of photos){
   const{data,error}=await s.storage.from(bucket).createSignedUrl(p.storage_path,900);if(error)throw error;
   const r=await fetch(data.signedUrl);if(!r.ok||!r.body)throw new Error("Unable to read "+p.original_name);
   zip.append(Readable.fromWeb(r.body as any),{name:p.original_name||p.id+".jpg"});
  }
  await zip.finalize();const ur=await upload;if(!ur.ok)throw new Error("ZIP upload failed: "+await ur.text());
  const size=photos.reduce((n,p)=>n+Number(p.size_bytes||0),0);
  await s.from("download_jobs").update({status:"READY",storage_path:path,photo_count:photos.length,size_bytes:size,completed_at:new Date().toISOString()}).eq("id",jobId);
 }catch(e){await s.from("download_jobs").update({status:"FAILED",error:e instanceof Error?e.message:"ZIP creation failed",completed_at:new Date().toISOString()}).eq("id",jobId)}
}
