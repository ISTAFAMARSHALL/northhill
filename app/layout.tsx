import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "North Hill Systems — Premium IPTV Streaming",
  description: "15,000+ live channels, 42,000 movies, 7,800 shows. Starting at $20/month. No contracts.",

  // ── Favicon & app icons ───────────────────────────────
  icons: {
    icon:             "/favicon.ico",
    shortcut:         "/favicon.ico",
    apple:            "/apple-touch-icon.png",
  },

  // ── Apple mobile web app ──────────────────────────────
  appleWebApp: {
    title:       "NorthHill",
    statusBarStyle: "black-translucent",
  },

  // ── Open Graph (iMessage, WhatsApp, Facebook) ─────────
  openGraph: {
    title:       "North Hill Systems — Premium IPTV Streaming",
    description: "15,000+ live channels, 42,000 movies, 7,800 shows. Starting at $20/month.",
    url:         "https://northhillsystems.com",
    siteName:    "North Hill Systems",
    images: [
      {
        url:    "https://northhillsystems.com/og-image.png",
        width:  1200,
        height: 630,
        alt:    "North Hill Systems — Premium IPTV Streaming",
      },
    ],
    type: "website",
  },

  // ── Twitter / X card ─────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       "North Hill Systems — Premium IPTV Streaming",
    description: "15,000+ live channels, 42,000 movies, 7,800 shows. Starting at $20/month.",
    images:      ["https://northhillsystems.com/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
