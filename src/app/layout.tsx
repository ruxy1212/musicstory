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
  description: "Music to Video",
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
