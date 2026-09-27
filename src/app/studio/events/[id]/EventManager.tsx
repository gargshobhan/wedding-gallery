"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { WeddingEvent } from "@/lib/events";
import { uploadProfessionalPhoto } from "@/lib/storage";

export default function EventManager({ id }: { id: string }) {
  const [item, setItem] = useState<WeddingEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");
  const [photoCount,setPhotoCount]=useState(0);const[downloadsEnabled,setDownloadsEnabled]=useState(false); const [uploading,setUploading]=useState(false); const [uploadError,setUploadError]=useState(""); const photoInput=useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/studio/events",{cache:"no-store"}).then(r=>r.json()).then(x=>setItem(Array.isArray(x)?x.find((event:WeddingEvent)=>event.id===id)||null:null)).catch(()=>setItem(null));
  }, [id]);

  const galleryPath = item ? "/gallery/" + item.slug : "";
  const shareUrl = typeof window !== "undefined" ? window.location.origin + galleryPath : galleryPath;

  useEffect(() => {
    if (!item || !shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 220, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [item, shareUrl]);

  async function uploadPhotos(e:ChangeEvent<HTMLInputElement>){const files=Array.from(e.target.files||[]);e.target.value="";if(!item||!files.length)return;setUploading(true);setUploadError("");try{for(const file of files)await uploadProfessionalPhoto(item.slug,file);setPhotoCount(x=>x+files.length)}catch(err){setUploadError(err instanceof Error?err.message:"Upload failed")}finally{setUploading(false)}}

  useEffect(()=>{if(item)fetch("/api/events/"+item.slug+"/photos",{cache:"no-store"}).then(r=>r.json()).then(x=>{if(Array.isArray(x?.photos))setPhotoCount(x.photos.length);setDownloadsEnabled(!!x?.downloadsEnabled)}).catch(()=>{})},[item?.slug]);

  if (!item) {
    return <main className="emptyState"><h1>Event not found</h1><Link className="button" href="/studio">Back</Link></main>;
  }

  async function publish() {
    if (!item) return;
    const next = { ...item, status: "Live" as const };
    const r=await fetch("/api/studio/events/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"Live"})});if(r.ok)setItem(next);
  }

  async function toggleDownloads(){if(!item)return;const next=!downloadsEnabled;const r=await fetch("/api/studio/events/"+id+"/download-settings",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({enabled:next,eventSlug:item.slug})});if(r.ok)setDownloadsEnabled(next)}

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return <main className="managePage">
    <header className="simpleNav">
      <Link href="/studio">← Dashboard</Link>
      <div className="brand">Yaadein</div>
      <span className={"pill " + (item.status === "Draft" ? "draft" : "")}>{item.status}</span>
    </header>
    <section className="manageHero">
      <div>
        <span className="eyebrow">Wedding control room</span>
        <h1>{item.couple}</h1>
        <p>{item.date} · {item.venue}</p>
        <div className="actions">
          {item.status === "Draft" ? <button className="button" onClick={publish}>Publish gallery</button> : <Link className="button" href={galleryPath}>Open gallery</Link>}
          <button className="ghost" onClick={copy}>{copied ? "Copied!" : "Copy guest link"}</button>
        </div>
      </div>
      <div className="qrCard">
        {qr ? <img src={qr} alt="Guest gallery QR code" /> : <div className="qrPlaceholder">Generating QR…</div>}
        <b>Guest QR</b><small>Scan to open gallery</small>
      </div>
    </section>
    <section className="manageGrid">
      <article className="manageCard"><span className="eyebrow">Gallery access</span><h3>{item.access.replace("_", " ")}</h3>{item.pin && <p>PIN: <b>{item.pin}</b></p>}<p className="mutedText">Print this QR at the venue or share the link on WhatsApp.</p></article>
      <article className="manageCard"><span className="eyebrow">Photos</span><h3>{photoCount} uploaded</h3><input ref={photoInput} hidden type="file" accept="image/*" multiple onChange={uploadPhotos}/><button className="button" disabled={uploading} onClick={()=>photoInput.current?.click()}>{uploading?"Uploading…":"Upload photographs"}</button>{uploadError&&<p className="mutedText">{uploadError}</p>}<p className="mutedText">Clients see reduced, watermarked proofs. Originals stay private.</p><label className="downloadToggle"><input type="checkbox" checked={downloadsEnabled} onChange={toggleDownloads}/> Allow clients to download original high-resolution photos</label></article>
      <article className="manageCard"><span className="eyebrow">Album</span><h3>Couple selection</h3><p>Review the exact photographs submitted by the couple and export the selection.</p><Link className="ghost" href={"/studio/events/"+id+"/album"}>Review album selection</Link></article>
      <article className="manageCard"><span className="eyebrow">Guests</span><h3>Guest uploads</h3><p>Review contributions from friends and family separately from professional photographs.</p><Link className="ghost" href={"/studio/events/"+id+"/guest-uploads"}>Review guest uploads</Link></article>
    </section>
  </main>;
}