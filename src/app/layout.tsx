import "./globals.css"; import type {Metadata} from "next";
export const metadata:Metadata={title:"Framehaven — Wedding Gallery",description:"Private wedding galleries for modern photography studios."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}