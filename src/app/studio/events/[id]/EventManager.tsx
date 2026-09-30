"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FramehavenLoading from "@/components/FramehavenLoading";
import { studioFetch } from "@/lib/studio-fetch";
import QRCode from "qrcode";
import { WeddingEvent } from "@/lib/events";
import { uploadProfessionalPhoto } from "@/lib/storage";

export default function EventManager({ id }: { id: string }) {
  const router=useRouter();
  const [item, setItem] = useState<WeddingEvent | null>(null);
  const [copied, setCopied] = useState(false);const[coupleCopied,setCoupleCopied]=useState(false);const[coupleInviteBusy,setCoupleInviteBusy]=useState(false);const[loading,setLoading]=useState(true);const[pin,setPin]=useState("");const[pinSaved,setPinSaved]=useState(false);
  const [qr, setQr] = useState("");
  const [photoCount,setPhotoCount]=useState(0);const[downloadsEnabled,setDownloadsEnabled]=useState(false); const [uploading,setUploading]=useState(false); const [uploadError,setUploadError]=useState(""); const photoInput=useRef<HTMLInputElement>(null);

  useEffect(() => {
    studioFetch("/api/studio/events",{cache:"no-store"}).then(r=>r.json()).then(x=>setItem(Array.isArray(x)?x.find((event:WeddingEvent)=>event.id===id)||null:null)).catch(()=>setItem(null)).finally(()=>setLoading(false));
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

  if(loading)return <FramehavenLoading message="Opening wedding control room…" />;
  if (!item) {
    return <main className="emptyState"><h1>Event not found</h1><Link className="button" href="/studio">Back</Link></main>;
  }

  async function publish() {
    if (!item) return;
    const next = { ...item, status: "Live" as const };
    const r=await studioFetch("/api/studio/events/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"Live"})});if(r.ok)setItem(next);
  }

  async function savePin(){if(!item||!pin)return;const r=await studioFetch("/api/studio/events/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});if(r.ok){setItem({...item,pin});setPin("");setPinSaved(true);setTimeout(()=>setPinSaved(false),1500)}}

  async function toggleDownloads(){if(!item)return;const next=!downloadsEnabled;const r=await studioFetch("/api/studio/events/"+id+"/download-settings",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({enabled:next,eventSlug:item.slug})});if(r.ok)setDownloadsEnabled(next)}

  async function copyCoupleInvite(){if(!item)return;setCoupleInviteBusy(true);try{const r=await studioFetch("/api/studio/events/"+id+"/couple-invite",{method:"POST"});const x=await r.json();if(!r.ok)throw new Error(x.error||"Unable to create invitation");await navigator.clipboard.writeText(window.location.origin+x.path);setCoupleCopied(true);setTimeout(()=>setCoupleCopied(false),1800)}finally{setCoupleInviteBusy(false)}}

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function deleteWedding(){if(!item)return;const typed=window.prompt(`Permanent deletion removes the wedding, photos, downloads, leads and album data. Type DELETE ${item.couple} to continue.`);if(typed!==`DELETE ${item.couple}`)return;const r=await studioFetch("/api/studio/events/"+id,{method:"DELETE"});if(r.ok)router.replace("/studio");else alert((await r.json()).error||"Unable to delete wedding")}

  return <main className="managePage">
    <header className="simpleNav">
      <Link href="/studio">← Dashboard</Link>
      <div className="brand">Framehaven</div>
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
      <article className="manageCard"><span className="eyebrow">Gallery access</span><h3>{item.access.replace("_", " ")}</h3>{item.access==="PIN"&&<><p className="mutedText">Current PIN: <b>{item.pin||"Not set"}</b>. Set a new PIN below if needed.</p><div className="actions"><input aria-label="New gallery PIN" inputMode="numeric" minLength={4} maxLength={8} placeholder="New PIN" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}/><button className="ghost" disabled={pin.length<4} onClick={savePin}>{pinSaved?"Saved!":"Set / reset PIN"}</button></div></>}<p className="mutedText">Print this QR at the venue or share the link on WhatsApp.</p></article>
      <article className="manageCard"><span className="eyebrow">Photos</span><h3>{photoCount} uploaded</h3><input ref={photoInput} hidden type="file" accept="image/*" multiple onChange={uploadPhotos}/><button className="button" disabled={uploading} onClick={()=>photoInput.current?.click()}>{uploading?"Uploading…":"Upload photographs"}</button>{uploadError&&<p className="mutedText">{uploadError}</p>}<p className="mutedText">Clients see reduced, watermarked proofs. Originals stay private.</p><label className="downloadToggle"><input type="checkbox" checked={downloadsEnabled} onChange={toggleDownloads}/> Allow clients to download original high-resolution photos</label></article>
      <article className="manageCard"><span className="eyebrow">Album</span><h3>Couple selection</h3><p>Share a private invitation for album selection. Creating a new link replaces the previous invitation.</p><div className="actions"><button className="ghost" disabled={coupleInviteBusy} onClick={copyCoupleInvite}>{coupleInviteBusy?"Creating…":coupleCopied?"Copied private link!":"Copy couple invitation"}</button><Link className="ghost" href={"/studio/events/"+id+"/album"}>Review selection</Link></div></article>
      <article className="manageCard"><span className="eyebrow">Guests</span><h3>Guest uploads</h3><p>Review contributions from friends and family separately from professional photographs.</p><Link className="ghost" href={"/studio/events/"+id+"/guest-uploads"}>Review guest uploads</Link></article>
    </section>
    <section className="dangerZone"><span className="eyebrow">Danger zone</span><h2>Delete wedding</h2><p>Permanently removes this wedding and its stored photos, generated downloads, leads and album data.</p><button className="dangerButton" onClick={deleteWedding}>Delete wedding permanently</button></section>
  </main>;
}