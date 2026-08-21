import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROM Build Bench",
  description:
    "A community database of Android ROM build times across different server specs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Apply the saved theme before paint to avoid a flash of the wrong
          // colors. "system" stores nothing and defers to prefers-color-scheme.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var c=document.documentElement.classList;c.remove('light','dark');if(t==='light'){c.add('light')}else if(t==='dark'){c.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
