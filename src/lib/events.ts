export type WeddingEvent={id:string;slug:string;couple:string;date:string;venue:string;access:"PUBLIC_LINK"|"PIN"|"PRIVATE";pin?:string;status:"Draft"|"Live";createdAt:string};
export const DEMO_EVENT:WeddingEvent={id:"demo",slug:"simran-arshdeep",couple:"Simran & Arshdeep",date:"2026-10-18",venue:"Sangrur, Punjab",access:"PIN",pin:"1810",status:"Live",createdAt:"2026-09-27"};
export const STORAGE_KEY="framehaven-events";
export function slugify(v:string){return v.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
export function loadEvents():WeddingEvent[]{if(typeof window==="undefined")return[DEMO_EVENT];try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):[DEMO_EVENT]}catch{return[DEMO_EVENT]}}
export function saveEvents(events:WeddingEvent[]){localStorage.setItem(STORAGE_KEY,JSON.stringify(events))}
