"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Film,
  Share2,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/common/header";

export default function LandingPage() {
  return (
    <div className="bg-background text-alter-primary min-h-screen font-sans selection:bg-primary-glow">
      {/* Main Canvas */}
      <main className="w-full max-w-[var(--container-max)] mx-auto flex flex-col items-center gap-[var(--stack-lg)] p-[var(--stack-md)] md:p-[var(--stack-xl)]">
        <Header location="Home" />
        {/* Social Media Impact Card (Hero) */}
        <section className="relative w-full min-h-[600px] rounded-[40px] overflow-hidden flex items-center justify-center p-[var(--stack-lg)] md:p-[var(--stack-xl)] shadow-2xl mt-16 animate-fade-up">
          {/* Background Content Layer */}
          <div className="absolute inset-0 z-0">
            <Image
              alt="Atmospheric music scene"
              fill
              className="object-cover opacity-60 mix-blend-luminosity scale-105"
              src="/favicon.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1F] via-[#0D0B1F]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B1F] via-transparent to-[#0D0B1F]"></div>
          </div>

          {/* Glass Content Card */}
          <div className="relative z-10 glass-card w-full max-w-4xl p-[var(--stack-lg)] md:p-[var(--stack-xl)] rounded-[32px] flex flex-col items-center text-center space-y-[var(--stack-md)] scanlines">
            {/* Logo/Icon Section */}
            <div className="-mt-10 -mb-10">
              <Image src="/logo.png" alt="MusicStory Logo" height={180} width={180} />
            </div>

            <h1 className="font-display text-3xl md:text-6xl text-alter-primary tracking-tight">
              <span className="italic text-gradient">Every Song has a</span>
              <br />
              <span className="text-gradient">Visual Journey.</span>
            </h1>

            <p className="text-lg md:text-xl text-alter-primary max-w-2xl leading-relaxed opacity-90">
              Transform your music into cinematic stories. MusicStory illustrates the narrative behind your favorite tracks, creating unique videos that bring songs to life.
            </p>

            {/* CTA Action */}
            <div className="pt-[var(--stack-md)] flex flex-col sm:flex-row gap-[var(--stack-md)]">
              <Link href="/create" className="group relative px-12 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold transition-all duration-300 active:scale-95 neon-glow overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Try Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-[var(--stack-lg)] pt-[var(--stack-lg)] border-t border-white/5 w-full justify-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-alter-secondary">
                <span>12,000,008</span> visuals created
              </span>
            </div>
          </div>
        </section>

        {/* Secondary Feature Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-[var(--stack-lg)] w-full mb-20 md:mb-0">
          <div className="glass-card rounded-2xl p-[var(--stack-md)] flex flex-col gap-[var(--stack-sm)] hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-alter-primary">AI Synthesis</h3>
            <p className="text-sm text-alter-secondary">Deep neural analysis of lyrics and rhythm to generate accurate thematic storyboards.</p>
          </div>

          <div className="glass-card rounded-2xl p-[var(--stack-md)] flex flex-col gap-[var(--stack-sm)] hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-alter-primary">Cinematic Renders</h3>
            <p className="text-sm text-alter-secondary">High-fidelity 4K output with professional color grading based on the mood of your track.</p>
          </div>

          <div className="relative glass-card rounded-2xl p-[var(--stack-md)] flex flex-col gap-[var(--stack-sm)] hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-alter-primary">Instant Export</h3>
            <span className="absolute bg-indigo-600/20 right-4 top-4 px-1.5 py-1 rounded-2xl text-xs">Coming Soon</span>
            <p className="text-sm text-alter-secondary">Formatted specifically for social platforms like TikTok, Instagram, and YouTube Shorts.</p>
          </div>
        </section>
      </main>
    </div>
  );
}