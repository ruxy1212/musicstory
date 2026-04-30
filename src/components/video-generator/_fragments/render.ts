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
      pending: "var(--text-muted)",
      generating: "var(--primary)",
      complete: "var(--success)",
      error: "var(--error)",
    }[stage] ?? "var(--text-muted)"
  );
}

export const hashCyrb53 = (str: string, seed = 0): string => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
};