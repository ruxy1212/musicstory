'use client'

import { Play, Pause, Wand2 } from 'lucide-react'

interface TransportControlsProps {
  isPlaying: boolean
  currentTime: number
  regionStart: number
  regionEnd: number
  onPlay: () => void
  onPause: () => void
  onProcess: () => void
  isReady: boolean
  isProcessing: boolean
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.floor((s % 1) * 100)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}

function fmtDur(s: number) {
  return `${s.toFixed(1)}s`
}

export default function TransportControls({
  isPlaying, currentTime, regionStart, regionEnd,
  onPlay, onPause, onProcess, isReady, isProcessing,
}: TransportControlsProps) {
  const duration = regionEnd - regionStart
  const elapsed = Math.max(0, Math.min(currentTime - regionStart, duration))
  const pct = duration > 0 ? (elapsed / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-3 animate-fade-up">

      {/* Timer strip */}
      <div className="rounded-xl border border-[var(--border-hi)] bg-elevated overflow-hidden">

        {/* Four time values */}
        <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { label: 'Position', value: fmt(currentTime), color: 'text-[var(--text-1)]' },
            { label: 'Region In', value: fmt(regionStart), color: 'text-primary' },
            { label: 'Region Out', value: fmt(regionEnd), color: 'text-primary' },
            { label: 'Duration', value: fmtDur(duration), color: 'text-accent' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-1 px-4 py-2 md:px-5 md:py-3">
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">
                {label}
              </span>
              <span className={`font-mono text-base font-medium leading-none tracking-tight ${color} md:text-lg`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Clip progress bar */}
        <div className="relative h-[2px] bg-border">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-75"
            style={{ width: `${pct}%` }}
          />
          {/* Cursor dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_var(--accent-glow)] transition-all duration-75"
            style={{ left: `${pct}%`, opacity: isPlaying ? 1 : 0 }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">

        {/* Play / Pause */}
        <button
          disabled={!isReady}
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={[
            'group flex items-center gap-2.5 px-4 h-9 rounded-xl md:px-6 md:h-11',
            'border font-["Syne"] text-sm font-semibold tracking-wide',
            'transition-all duration-200 outline-none',
            'disabled:opacity-30 disabled:pointer-events-none',
            isPlaying
              ? 'bg-primary-dim border-primary text-white shadow-[0_0_16px_var(--primary-glow)]'
              : 'bg-elevated border-[var(--border-hi)] text-[var(--text-2)]',
            !isPlaying && isReady
              ? 'hover:border-primary hover:text-white hover:shadow-[0_0_16px_var(--primary-glow)] hover:-translate-y-px'
              : '',
          ].join(' ')}
        >
          {isPlaying
            ? <Pause size={16} className="fill-current" />
            : <Play size={16} className="fill-current" />
          }
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Process */}
        <button
          disabled={!isReady || isProcessing}
          onClick={onProcess}
          aria-label="Process clip"
          className={[
            'cursor-pointer group flex items-center justify-center gap-2.5 flex-1 h-9 rounded-xl md:h-11',
            'font-["Syne"] text-sm font-semibold tracking-wide text-white',
            'bg-gradient-to-r from-primary to-[#7c3aed]',
            'shadow-[0_4px_16px_var(--primary-glow)]',
            'transition-all duration-200 outline-none',
            'hover:shadow-[0_6px_24px_var(--primary-glow)] hover:-translate-y-px hover:brightness-110',
            'active:translate-y-0 active:brightness-95',
            'disabled:opacity-30 disabled:pointer-events-none',
          ].join(' ')}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-smooth" />
              Processing…
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Process <span className="hidden md:inline">Clip</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}