import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] relative overflow-hidden md:p-6 lg:p-8">

      {/* Ambient blobs — same as AudioTrimmer */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-[var(--primary-glow)] blur-[120px] opacity-30 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--accent-glow)] blur-[100px] opacity-20 pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Card */}
      <div className="scanlines relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border-hi)] bg-[var(--bg-surface)] shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 flex flex-col items-center gap-8 text-center animate-fade-up md:p-10">

        {/* 404 glyph */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="w-28 h-28 rounded-full border border-[var(--border-hi)] flex items-center justify-center">
            {/* Inner ring */}
            <div className="w-20 h-20 rounded-full border border-[var(--error)] bg-[var(--primary-dim)] shadow-[0_0_24px_var(--primary-glow)] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--error)]">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {/* Orbiting dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-3)]">Error</span>
            <span className="h-px w-8 bg-[var(--border-hi)]" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--warning)]">404</span>
          </div>
          <h1 className="font-['Syne'] text-3xl font-bold text-[var(--text-1)] tracking-tight leading-tight">
            Page not found
          </h1>
          <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-xs mx-auto">
            The route you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-hi)] to-transparent" />

        {/* CTA */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-7 h-11 rounded-xl font-['Syne'] text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-[var(--primary)] to-[#7c3aed] shadow-[0_4px_16px_var(--primary-glow)] transition-all duration-200 hover:shadow-[0_6px_24px_var(--primary-glow)] hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:brightness-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Go home
        </Link>

      </div>
    </div>
  );
}