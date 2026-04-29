"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { SegmentResult, VideoGeneratorProps, VideoGeneratorHandle } from "@/types";
import { initialStatus } from "@/utils/video/helpers";
import { generateSegment } from "./_fragments/segment";
import { composeVideo } from "./_fragments/compose";
import { stageColor, statusLabel } from "./_fragments/render";
import Fallback from "./_ui/fallback-video";
import ComposedVideoPlayer from "./_ui/composed-video-player";
import { useRemotionRender } from "@/hooks/useMotionRenderer";
import Logo from "@/components/common/logo";
import { toast } from "sonner";
import { useEffect } from "react";

// ─── Main component ───────────────────────────────────────────────────────────
const VideoGenerator = forwardRef<VideoGeneratorHandle, VideoGeneratorProps>(
  ({ title, enrichedTranscriptions, audioBlob, token }, ref) => {
    useImperativeHandle(ref, () => ({
      runGeneration,
    }));

    const {
      isRendering,
      progress,
      status,
      error,
      startRender,
    } = useRemotionRender();

    const segments = enrichedTranscriptions?.segments ?? [];

    const [results, setResults] = useState<SegmentResult[]>(() =>
      segments.map((seg, i) => ({
        index: i,
        segment: seg,
        videoUrl: null,
        seed: null,
        status: initialStatus(),
        failed: false,
      }))
    );

    const [phase, setPhase] = useState<"idle" | "generating" | "composing" | "done">("idle");
    const [composedVideoUrl, setComposedVideoUrl] = useState<string | null>(null);

    // Watch for composition errors
    useEffect(() => {
      if (error) {
        toast.error("Composition Failed", {
          description: error
        });
      }
    }, [error]);

    // Generate all segments sequentially
    async function runGeneration() {
      setPhase("generating");

      let firstQuotaIndex: number | null = null;
      for (let i = 0; i < segments.length; i++) {
        const { quotaError } = await generateSegment({
          seg: segments[i],
          index: i,
          token: "" as `hf_${string}`, // use IP quota
          setResults,
        });

        if (quotaError) {
          firstQuotaIndex = i;
          toast.warning("Quota reached", {
            description: "Switching to your HuggingFace token to continue..."
          });
          break;
        }
      }

      if (firstQuotaIndex !== null) {
        for (let i = firstQuotaIndex; i < segments.length; i++) {
          await generateSegment({
            seg: segments[i],
            index: i,
            token: token as `hf_${string}`, // use real token on retry
            setResults,
            isRetry: true,
          });
        }
      }

      setPhase("composing");
      await composeVideo({
        audioBlob,
        results,
        setComposedVideoUrl,
        startRender,
        setPhase,
      });
    }

    const completedCount = results.filter((r) => r.status.stage === "complete").length;
    const failedCount = results.filter((r) => r.failed).length;
    const total = segments.length;

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-base)]">
        {/* Ambient blobs */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-[var(--primary-glow)] blur-[120px] opacity-30 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="fixed bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--accent-glow)] blur-[100px] opacity-20 pointer-events-none translate-x-1/3 translate-y-1/3" />

        {/* Card */}
        <div className="scanlines relative z-10 w-full max-w-5xl rounded-2xl border border-[var(--border-hi)] bg-[var(--bg-surface)] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex flex-col items-center justify-between gap-4 px-7 py-5 border-b border-[var(--border)] md:flex-row">
            <div className="flex items-center gap-3.5">
              {/* Logo mark */}
              <Logo />
              <div>
                <h1 className="font-['Syne'] text-[17px] font-bold text-[var(--text-1)] leading-tight tracking-tight">
                  Video Composer
                </h1>
                <p className="text-[11px] text-[var(--text-3)] tracking-wide mt-px">
                  {total} scene{total !== 1 ? "s" : ""} · {audioBlob ? "Audio attached" : "No audio"}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full border border-[var(--border-hi)] bg-[var(--bg-elevated)]">
              <span className={[
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                phase === 'done' ? 'bg-[var(--success)] shadow-[0_0_6px_var(--success)]' : 'bg-[var(--primary)] animate-pulse-dot',
              ].join(' ')} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-2)] px-1">
                {phase}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-7">
            {phase === "generating" && (
              <div className="animate-fade-up">
                {/* Segment list */}
                <div className="flex flex-col gap-2 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[32px_1fr_12px] items-center gap-4 p-4 rounded-xl border transition-all duration-300"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: r.status.stage === "generating" ? "var(--primary-glow)" : "var(--border)",
                        boxShadow: r.status.stage === "generating" ? "0 0 20px var(--primary-dim)" : "none"
                      }}
                    >
                      <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-1">
                          {r.segment.text}
                        </p>
                        <p 
                          className="font-mono text-[10px] uppercase tracking-wider"
                          style={{ color: stageColor(r.status.stage) }}
                        >
                          {statusLabel(r)}
                        </p>
                      </div>

                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: stageColor(r.status.stage),
                          boxShadow: r.status.stage === "generating" ? `0 0 10px ${stageColor(r.status.stage)}` : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Progress summary */}
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h4 className="text-[var(--text-1)] font-['Syne'] font-bold text-sm">Processing Pipeline</h4>
                      <p className="text-[11px] text-[var(--text-3)] font-mono mt-1">
                        {completedCount} of {total} scenes complete {failedCount > 0 && `(${failedCount} failed)`}
                      </p>
                    </div>
                    <span className="text-[var(--primary)] font-mono text-lg font-bold">
                      {Math.round((completedCount / total) * 100)}%
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className="h-full bg-[var(--primary)] transition-all duration-700 ease-out"
                      style={{ width: `${(completedCount / total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {(phase === "composing" || (phase === "done" && !composedVideoUrl && isRendering)) && (
              <div className="flex flex-col items-center justify-center py-12 gap-8 animate-fade-up">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin-smooth"
                    style={{ borderRightColor: 'transparent' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[var(--primary)] font-mono text-xl font-bold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-['Syne'] font-bold text-[var(--text-1)] tracking-tight">
                    Composing Cinematic Masterpiece
                  </h3>
                  <p className="text-sm text-[var(--text-3)] font-mono uppercase tracking-[0.2em]">
                    Phase: {status?.stage ?? 'Preparing...'}
                  </p>
                </div>

                <div className="w-full max-w-md space-y-2">
                   <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div 
                      className="h-full bg-[var(--primary)] transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {error && (
                    <div className="p-4 rounded-lg bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 text-[var(--error)] text-xs font-mono text-center">
                      Error: {error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === "done" && composedVideoUrl && (
              <div className="flex flex-col gap-8 animate-fade-up">
                <ComposedVideoPlayer
                  src={composedVideoUrl}
                  title={title}
                  autoplay={false}
                  controls={true}
                  className="rounded-2xl shadow-2xl"
                />
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = composedVideoUrl;
                      a.download = `${title || 'video'}.mp4`;
                      a.click();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--primary)] text-white font-['Syne'] font-bold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-[0_8px_24px_var(--primary-glow)] flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Video
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--border-hi)] bg-[var(--bg-elevated)] text-[var(--text-1)] font-['Syne'] font-bold text-sm hover:bg-[var(--bg-overlay)] transition-all flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Create New
                  </button>
                </div>
              </div>
            )}

            {phase === "done" && !composedVideoUrl && !isRendering && (
              <div className="flex flex-col gap-8 animate-fade-up">
                <div className="p-6 rounded-2xl bg-[var(--error)] bg-opacity-5 border border-[var(--error)] border-opacity-20 flex items-center gap-4">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--error)] flex items-center justify-center text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                   </div>
                   <div>
                     <h3 className="text-[var(--text-1)] font-bold font-['Syne']">Composition Failed</h3>
                     <p className="text-[var(--text-3)] text-xs font-mono">Individual scenes were generated successfully, but stitching them together failed. You can still view the scenes below.</p>
                   </div>
                </div>

                <Fallback results={results} />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={runGeneration}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--primary)] text-white font-['Syne'] font-bold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-[0_8px_24px_var(--primary-glow)] flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Regenerate Video
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[var(--border-hi)] bg-[var(--bg-elevated)] text-[var(--text-1)] font-['Syne'] font-bold text-sm hover:bg-[var(--bg-overlay)] transition-all flex items-center justify-center gap-2"
                  >
                    Create New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default VideoGenerator;