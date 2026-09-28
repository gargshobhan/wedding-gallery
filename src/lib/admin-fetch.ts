import{getBrowserSupabase}from"@/lib/supabase/browser";
export async function adminFetch(input:RequestInfo|URL,init:RequestInit={}){const s=getBrowserSupabase();const{data:{session}}=await s.auth.getSession();if(!session)throw new Error("ADMIN_AUTH_REQUIRED");const h=new Headers(init.headers);h.set("Authorization",`Bearer ${session.access_token}`);return fetch(input,{...init,headers:h})}
