import type { SegmentResult } from '@/types';
import { AnimatePresence, motion } from 'motion/react';
import {
  stageColor,
  statusLabel,
  hashCyrb53,
} from '@/components/video-generator/_fragments/render';

export default function SegmentList({ results }: { results: SegmentResult[] }) {
  return (
    <div className="relative flex flex-col min-h-50 justify-end mb-2">
      <div className="absolute w-full top-0 h-14 bg-linear-to-b from-surface to-transparent"></div>
      <div className="flex flex-col gap-2 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {results.map(
            (r, i) =>
              r.status.stage !== 'pending' && (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    opacity: { duration: 0.2 },
                  }}
                  style={{
                    background: 'var(--bg-elevated)',
                    borderColor:
                      r.status.stage === 'generating'
                        ? 'var(--primary-glow)'
                        : 'var(--border)',
                    boxShadow:
                      r.status.stage === 'generating'
                        ? '0 0 20px var(--primary-dim)'
                        : 'none',
                  }}
                  className="grid grid-cols-[32px_1fr_12px] items-center gap-4 p-4 rounded-xl border transition-all duration-300"
                >
                  <span className="font-mono text-[11px] text-alter-muted tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <p className="text-[13px] text-alter-secondary leading-relaxed mb-1 truncate">
                      Segment ID: {hashCyrb53(r.segment.text)}
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
                      boxShadow:
                        r.status.stage === 'generating'
                          ? `0 0 10px ${stageColor(r.status.stage)}`
                          : 'none',
                    }}
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
