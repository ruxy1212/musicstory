"use client";

import VideoGallery from "@/components/discover";
import Header from "@/components/common/header";

export default function Page() {
  return (
    <div className="bg-background text-alter-primary min-h-screen font-sans selection:bg-primary-glow">
      <Header location="Discover" />
      
      <main className="w-full relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 pt-16">
          <VideoGallery />
        </div>
      </main>
    </div>
  );
}
