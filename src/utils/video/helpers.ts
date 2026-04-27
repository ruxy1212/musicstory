import { SegmentStatus } from "@/types";

export function clampDuration(start: number, end: number): number {
  const raw = end - start;
  return Math.min(5, Math.max(3, Math.round(raw)));
}

export function initialStatus(): SegmentStatus {
  return { stage: "pending", queue: false };
}