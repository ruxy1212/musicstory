import { useEffect, useState } from "react";
import Logo from "@/components/common/logo";
import { Home, Compass, PlusCircle, Settings } from "lucide-react";
import ConfigModal from "@/components/config/config-modal";
import Link from "next/link";

export default function Header({ location }: { location?: string }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (isConfigOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''

    return () => { document.body.style.overflow = ''; };
  }, [isConfigOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0B1F]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-2xl font-bold font-display italic bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            MusicStory
          </span>
        </div>
        <div className="flex items-center gap-[var(--stack-lg)]">
          <nav className="hidden md:flex gap-[var(--stack-md)] font-medium">
            {[
             {link: '/', label: 'Home', Icon: Home },
             {link: '#', label: 'Discover', Icon: Compass },
             {link: '/create', label: 'Create', Icon: PlusCircle }
            ].map((item, i) => (
            <Link 
              key={i}
              href={item.link} 
              className={`
                flex items-center gap-1 px-3 py-1 rounded-lg border-2 transition-all duration-200
                ${item.label === location 
                  ? 'text-cyan-400 border-cyan-400' 
                  : 'text-white/60 border-transparent'} 
                hover:text-cyan-300 hover:border-cyan-300
              `}
            >
              {item.Icon && <item.Icon size={18} />}
              <span className="font-medium">{item.label}</span>
            </Link>
            ))}
          </nav>
          <div className="flex items-center gap-[var(--stack-sm)]">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="cursor-pointer w-10 h-10 flex justify-center items-center rounded-full overflow-hidden border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Settings className="w-6 h-6 text-white/60 hover:text-cyan-300 transition-colors" />
            </button>
          </div>
        </div>
      </header>
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
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="flex flex-col items-center justify-center text-white/40 p-2 hover:bg-white/5 rounded-2xl transition-all"
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Config</span>
        </button>
      </nav>
      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </>
  )
}