import { event } from "@/lib/demo";
export type Lead={id:string;eventSlug:string;source:"WhatsApp";createdAt:string};
export type GuestUpload={id:string;eventSlug:string;name:string;createdAt:string};
export type AlbumSubmission={eventSlug:string;photoIds:number[];submittedAt:string};
const LEADS="framehaven-leads",UPLOADS="framehaven-guest-uploads",ALBUM="framehaven-album-submissions",FAVS="framehaven-favorites";
function read<T>(key:string,fallback:T):T{if(typeof window==="undefined")return fallback;try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch{return fallback}}
function write<T>(key:string,value:T){localStorage.setItem(key,JSON.stringify(value))}
export function trackWhatsApp(slug:string){const leads=read<Lead[]>(LEADS,[]);write(LEADS,[{id:Date.now().toString(),eventSlug:slug,source:"WhatsApp",createdAt:new Date().toISOString()},...leads])}
export function getLeads(){return read<Lead[]>(LEADS,[])}
export function addGuestUploads(slug:string,files:File[]){const uploads=read<GuestUpload[]>(UPLOADS,[]);const next=files.map((f,i)=>({id:Date.now()+"-"+i,eventSlug:slug,name:f.name,createdAt:new Date().toISOString()}));write(UPLOADS,[...next,...uploads]);return next.length}
export function getGuestUploads(){return read<GuestUpload[]>(UPLOADS,[])}
export function saveFavorites(slug:string,ids:string[]){const all=read<Record<string,string[]>>(FAVS,{});all[slug]=ids;write(FAVS,all)}
export function getFavorites(slug:string){const ids=read<Record<string,Array<string|number>>>(FAVS,{})[slug]||[];return ids.map(String)}
export function submitAlbum(slug:string,photoIds:number[]){const all=read<Record<string,AlbumSubmission>>(ALBUM,{});all[slug]={eventSlug:slug,photoIds,submittedAt:new Date().toISOString()};write(ALBUM,all)}
export function getAlbum(slug:string){return read<Record<string,AlbumSubmission>>(ALBUM,{})[slug]}
export const demoPhotos=event.photos;
