"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { SegmentResult, VideoGeneratorProps, VideoGeneratorHandle } from "@/types";
import { initialStatus } from "@/utils/video/helpers";
import { generateSegment } from "./_fragments/segment";
import { composeVideo } from "./_fragments/compose";
import { stageColor, statusLabel } from "./_fragments/render";
import Fallback from "./_ui/fallback-video";
import ComposedVideo from "./_ui/composed-video";

// ─── Main component ───────────────────────────────────────────────────────────
const VideoGenerator = forwardRef<VideoGeneratorHandle, VideoGeneratorProps>(
  ({ enrichedTranscriptions, audioBlob, token }, ref) => {
    useImperativeHandle(ref, () => ({
      runGeneration,
    }));

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

    // ── Generate all segments sequentially ───────────────────────────────────
    async function runGeneration() {
      setPhase("generating");

      for (let i = 0; i < segments.length; i++) {
        await generateSegment({
          seg: segments[i],
          index: i,
          token: token as `hf_${string}`,
          setResults
        });
      }

      setPhase("composing");
      await composeVideo({
        audioBlob,
        results,
        setComposedVideoUrl,
        setPhase,
      });
    }

    // ── Download handler ──────────────────────────────────────────────────────

    function handleDownload() {
      if (!composedVideoUrl) return;
      const a = document.createElement("a");
      a.href = composedVideoUrl;
      a.download = "composed_video.mp4";
      a.click();
    }

    const completedCount = results.filter((r) => r.status.stage === "complete").length;
    const failedCount = results.filter((r) => r.failed).length;
    const total = segments.length;

    // ─────────────────────────────────────────────────────────────────────────
    return (
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          background: "#0c0c0c",
          color: "#e8e8e0",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
            Video Composer
          </h1>
          <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
            {total} scene{total !== 1 ? "s" : ""} · {audioBlob ? "Audio attached" : "No audio"}
          </p>
        </div>

        {/* Segment list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "2rem" }}>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "#161616",
                borderRadius: 8,
                border: `0.5px solid ${r.status.stage === "generating" ? "#f0a50044" : "#ffffff0d"}`,
                transition: "border-color 0.3s",
              }}
            >
              {/* Index */}
              <span style={{ fontSize: 11, color: "#444", fontVariantNumeric: "tabular-nums" }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Text + status */}
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>
                  {r.segment.text}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: stageColor(r.status.stage) }}>
                  {statusLabel(r)}
                </p>
              </div>

              {/* Stage indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: stageColor(r.status.stage),
                  flexShrink: 0,
                  boxShadow:
                    r.status.stage === "generating"
                      ? `0 0 6px ${stageColor(r.status.stage)}`
                      : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Progress summary */}
        {phase === "generating" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                height: 2,
                background: "#1e1e1e",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(completedCount / total) * 100}%`,
                  background: "#f0a500",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
              {completedCount} of {total} scenes complete
              {failedCount > 0 ? ` · ${failedCount} failed` : ""}
            </p>
          </div>
        )}

        {phase === "composing" && (
          <p style={{ fontSize: 13, color: "#f0a500", marginBottom: "1.5rem" }}>
            Composing final video…
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
          {phase === "done" && composedVideoUrl && (
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#e8e8e0",
                border: "0.5px solid #ffffff33",
                borderRadius: 6,
                fontFamily: "inherit",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Download MP4
            </button>
          )}
        </div>

        {/* Final video — no controls download, no download attribute on element */}
        {phase === "done" && composedVideoUrl && (
          <ComposedVideo composedVideoUrl={composedVideoUrl} />
        )}

        {/* Fallback: show individual clips when composition failed but generation is done */}
        {phase === "done" && !composedVideoUrl && (
          <Fallback results={results} />
        )}
      </div>
    );
  }
);

export default VideoGenerator;