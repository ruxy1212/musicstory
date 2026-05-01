import type { SegmentStatus } from '@/types';

export function clampDuration(start: number, end: number): number {
  const raw = end - start;
  return Math.min(3, Math.max(1.8, Math.round(raw)));
}

export function initialStatus(): SegmentStatus {
  return { stage: 'pending', queue: false };
}
