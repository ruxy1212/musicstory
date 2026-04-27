import { SegmentResult, SegmentStatus } from "@/types";

export function statusLabel(r: SegmentResult): string {
  const s = r.status;
  if (s.stage === "pending") return "Pending";
  if (s.stage === "error") return `Error: ${s.message ?? "failed"}`;
  if (s.stage === "complete") return r.failed ? "Failed — using fallback" : "Done";
  if (s.stage === "generating") {
    if (s.queue && s.position != null)
      return `Queue position ${s.position}${s.eta != null ? ` · ETA ${Math.round(s.eta)}s` : ""}`;
    if (s.progress_data?.length) {
      const p = s.progress_data[0];
      if (p.progress != null) return `Generating ${Math.round(p.progress * 100)}%`;
    }
    return s.message ?? "Generating…";
  }
  return "";
}

export function stageColor(stage: SegmentStatus["stage"]): string {
  return (
    {
      pending: "#555",
      generating: "#f0a500",
      complete: "#22c55e",
      error: "#ef4444",
    }[stage] ?? "#555"
  );
}