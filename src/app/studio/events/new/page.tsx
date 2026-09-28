"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { studioFetch } from "@/lib/studio-fetch";
import { slugify, WeddingEvent } from "@/lib/events";

export default function NewEvent() {
  const router = useRouter();
  const [couple, setCouple] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [access, setAccess] = useState<WeddingEvent["access"]>("PIN");
  const [pin, setPin] = useState("");

  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);setError("");
    try{const r=await studioFetch("/api/studio/events",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({couple,slug:slugify(couple),date,venue,access,pin:access==="PIN"?pin:undefined})});const item=await r.json();if(!r.ok)throw new Error(item.error||"Unable to create wedding");router.push("/studio/events/"+item.id)}catch(err){setError(err instanceof Error?err.message:"Unable to create wedding")}finally{setSaving(false)}
  }

  return (
    <main className="formPage">
      <header className="simpleNav">
        <Link href="/studio">← Dashboard</Link>
        <div className="brand">Framehaven</div>
        <span>New wedding</span>
      </header>
      <form className="eventForm" onSubmit={submit}>
        <span className="eyebrow">Create event</span>
        <h1>Start a new wedding gallery.</h1>
        <label>Couple names<input required placeholder="e.g. Mehak & Gurpreet" value={couple} onChange={(e) => setCouple(e.target.value)} /></label>
        <div className="formGrid">
          <label>Wedding date<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Venue<input required placeholder="Patiala, Punjab" value={venue} onChange={(e) => setVenue(e.target.value)} /></label>
        </div>
        <fieldset>
          <legend>Gallery access</legend>
          {[
            ["PUBLIC_LINK", "Anyone with link"],
            ["PIN", "Require PIN"],
            ["PRIVATE", "Couple only"],
          ].map(([value, title]) => (
            <label className="radio" key={value}>
              <input type="radio" name="access" checked={access === value} onChange={() => setAccess(value as WeddingEvent["access"])} />
              <span>
                <b>{title}</b>
                <small>{value === "PIN" ? "Best default for wedding guests." : value === "PUBLIC_LINK" ? "Fastest guest experience." : "Most restrictive."}</small>
              </span>
            </label>
          ))}
        </fieldset>
        {access === "PIN" && <label>Gallery PIN<input required minLength={4} maxLength={8} placeholder="4–8 digits" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} /></label>}
        {error&&<p className="mutedText">{error}</p>}<button className="button wide" disabled={saving} type="submit">{saving?"Creating…":"Create wedding"}</button>
      </form>
    </main>
  );
}
