import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Syne, JetBrains_Mono } from 'next/font/google'
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne', // CSS variable name
  display: 'swap',
})

// Configure JetBrains Mono for numbers/code
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains', // CSS variable name
  display: 'swap',
})

export const metadata: Metadata = {
  title: "MusicStory",
  description: "Transform your audio tracks into cinematic visual journeys with AI-powered scene generation and professional video composition.",
  metadataBase: new URL("https://music-story.vercel.app"),
  openGraph: {
    title: "MusicStory | AI Music Video Generator",
    description: "Transform your audio tracks into cinematic visual journeys with AI-powered scene generation.",
    url: "https://music-story.vercel.app",
    siteName: "MusicStory",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Music tracks to cinematic visual journey",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MusicStory | Music tracks into cinematic visual journey",
    description: "Transform your audio tracks into cinematic visual journeys with AI-powered scene generation.",
    images: ["/og.jpg"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
