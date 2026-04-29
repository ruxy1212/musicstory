import { SegmentResult } from "@/types";

export default function Fallback({ results }: { results: SegmentResult[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-up">
      {results.map((r, i) =>
        r.videoUrl ? (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all hover:border-[var(--border-hi)] hover:bg-[var(--bg-overlay)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-3)]">
                Scene {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="aspect-video relative rounded-lg overflow-hidden border border-[var(--border)] bg-black shadow-inner">
              <video
                src={r.videoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}