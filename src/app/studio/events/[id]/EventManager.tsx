"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { loadEvents, saveEvents, WeddingEvent } from "@/lib/events";

export default function EventManager({ id }: { id: string }) {
  const [item, setItem] = useState<WeddingEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");

  useEffect(() => {
    setItem(loadEvents().find((event) => event.id === id) || null);
  }, [id]);

  const galleryPath = item ? "/gallery/" + item.slug : "";
  const shareUrl = typeof window !== "undefined" ? window.location.origin + galleryPath : galleryPath;

  useEffect(() => {
    if (!item || !shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 220, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [item, shareUrl]);

  if (!item) {
    return <main className="emptyState"><h1>Event not found</h1><Link className="button" href="/studio">Back</Link></main>;
  }

  function publish() {
    if (!item) return;
    const next = { ...item, status: "Live" as const };
    setItem(next);
    saveEvents(loadEvents().map((event) => event.id === id ? next : event));
  }

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
      <article className="manageCard"><span className="eyebrow">Photos</span><h3>0 uploaded</h3><button className="button">Upload photographs</button><p className="mutedText">Cloud upload comes in the storage milestone.</p></article>
      <article className="manageCard"><span className="eyebrow">Album</span><h3>Couple selection</h3><p>Review the exact photographs submitted by the couple and export the selection.</p><Link className="ghost" href={"/studio/events/"+id+"/album"}>Review album selection</Link></article>
      <article className="manageCard"><span className="eyebrow">Guests</span><h3>Guest uploads</h3><p>Review contributions from friends and family separately from professional photographs.</p><Link className="ghost" href={"/studio/events/"+id+"/guest-uploads"}>Review guest uploads</Link></article>
    </section>
  </main>;
}