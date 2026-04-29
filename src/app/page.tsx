"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Bell, 
  Sparkles, 
  Film, 
  Share2, 
  Home, 
  Compass, 
  PlusCircle, 
  User,
  ArrowRight
} from "lucide-react";
import Logo from "@/components/common/logo";

export default function LandingPage() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen font-sans selection:bg-[var(--primary-glow)]">
      {/* Main Canvas */}
      <main className="w-full max-w-[var(--container-max)] mx-auto flex flex-col items-center gap-[var(--stack-lg)] p-[var(--stack-md)] md:p-[var(--stack-xl)]">
        
        {/* Shared Component: TopAppBar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0B1F]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-[var(--stack-md)]">
            <Logo />
            <span className="text-2xl font-display italic bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              MusicStory
            </span>
          </div>
          <div className="flex items-center gap-[var(--stack-lg)]">
            <nav className="hidden md:flex gap-[var(--stack-md)] font-medium">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">Home</Link>
              <Link href="#" className="text-white/60 hover:text-cyan-300 transition-colors">Discover</Link>
              <Link href="/create" className="text-white/60 hover:text-cyan-300 transition-colors">Studio</Link>
            </nav>
            <div className="flex items-center gap-[var(--stack-sm)]">
              <Bell className="w-5 h-5 text-white/60 hover:text-cyan-300 cursor-pointer transition-colors" />
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <Image 
                  alt="User profile" 
                  width={40} 
                  height={40} 
                  src="/preview.png"
                />
              </div>
            </div>
          </div>
        </header>

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
            
            <h1 className="font-display text-4xl md:text-6xl text-[var(--text-primary)] tracking-tight">
              <span className="italic text-gradient">Every Song has a</span>
              <br />
              <span className="text-gradient">Visual Journey.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-primary)] max-w-2xl leading-relaxed opacity-90">
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
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0B1F] overflow-hidden">
                    <Image 
                      alt="User" 
                      width={32} 
                      height={32} 
                      src={`/preview.png`}
                    />
                  </div>
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">
                +12k Creators generating visuals today
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
            <h3 className="text-xl font-bold text-[var(--text-primary)]">AI Synthesis</h3>
            <p className="text-sm text-[var(--text-secondary)]">Deep neural analysis of lyrics and rhythm to generate accurate thematic storyboards.</p>
          </div>
          
          <div className="glass-card rounded-2xl p-[var(--stack-md)] flex flex-col gap-[var(--stack-sm)] hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Cinematic Renders</h3>
            <p className="text-sm text-[var(--text-secondary)]">High-fidelity 4K output with professional color grading based on the mood of your track.</p>
          </div>

          <div className="glass-card rounded-2xl p-[var(--stack-md)] flex flex-col gap-[var(--stack-sm)] hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Instant Export</h3>
            <p className="text-sm text-[var(--text-secondary)]">Formatted specifically for social platforms like TikTok, Instagram, and YouTube Shorts.</p>
          </div>
        </section>

        {/* Mobile Bottom NavBar */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#0D0B1F]/90 backdrop-blur-3xl rounded-t-[32px] border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] md:hidden">
          <div className="flex flex-col items-center justify-center bg-indigo-600/20 text-cyan-400 rounded-2xl p-2 shadow-[0_0_10px_rgba(0,245,255,0.3)] scale-90 transition-all duration-300">
            <Home className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Home</span>
          </div>
          <div className="flex flex-col items-center justify-center text-white/40 p-2 hover:bg-white/5 rounded-2xl transition-all">
            <Compass className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Discover</span>
          </div>
          <Link href="/create" className="flex flex-col items-center justify-center text-white/40 p-2 hover:bg-white/5 rounded-2xl transition-all">
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Create</span>
          </Link>
          <div className="flex flex-col items-center justify-center text-white/40 p-2 hover:bg-white/5 rounded-2xl transition-all">
            <Film className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Studio</span>
          </div>
          <div className="flex flex-col items-center justify-center text-white/40 p-2 hover:bg-white/5 rounded-2xl transition-all">
            <User className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Profile</span>
          </div>
        </nav>

      </main>
    </div>
  );
}