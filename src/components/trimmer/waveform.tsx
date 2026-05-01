'use client';

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, {
  type Region,
} from 'wavesurfer.js/dist/plugins/regions.esm.js';

export interface WaveformHandle {
  play: () => void;
  pause: () => void;
}

interface WaveformProps {
  file: File;
  onReady: (duration: number) => void;
  onRegionChange: (start: number, end: number) => void;
  onPlayStateChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
}

const Waveform = forwardRef<WaveformHandle, WaveformProps>(
  ({ file, onReady, onRegionChange, onPlayStateChange, onTimeUpdate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WaveSurfer | null>(null);
    const regionRef = useRef<Region | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (wsRef.current && regionRef.current) {
          wsRef.current.setTime(regionRef.current.start);
          wsRef.current.play();
        }
      },
      pause: () => wsRef.current?.pause(),
    }));

    useEffect(() => {
      if (!file || !containerRef.current) return;

      setIsLoading(true);
      setProgress(0);

      const wsRegions = RegionsPlugin.create();

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: ['#5b6ef5', '#a78bfa', '#00e5c3'],
        progressColor: ['#00e5c3', '#5b6ef5'],
        cursorColor: '#00e5c3',
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 3,
        height: 88,
        normalize: true,
        plugins: [wsRegions],
      });

      wsRef.current = ws;

      ws.on('loading', (pct: number) => {
        setProgress(pct);
      });

      ws.on('ready', () => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          const duration = ws.getDuration();
          onReady(duration);

          const initialEnd = Math.max(
            12,
            Math.min(30, duration < 30 ? duration : 30),
          );
          const region = wsRegions.addRegion({
            start: 0,
            end: initialEnd,
            drag: true,
            resize: true,
            color: 'rgba(34, 211, 238, 0.38)',
          });

          region.on('update-end', () => {
            let newStart = region.start;
            let newEnd = region.end;
            const currentDuration = newEnd - newStart;

            if (currentDuration > 30) {
              newEnd = newStart + 30;
            } else if (currentDuration < 12 && duration >= 12) {
              newEnd = newStart + 12;
              if (newEnd > duration) {
                newEnd = duration;
                newStart = Math.max(0, newEnd - 12);
              }
            }

            if (newStart !== region.start || newEnd !== region.end) {
              region.setOptions({ start: newStart, end: newEnd });
            }
            onRegionChange(newStart, newEnd);
          });

          onRegionChange(0, initialEnd);
          regionRef.current = region;
        }, 750);
      });

      ws.on('timeupdate', (time: number) => {
        onTimeUpdate(time);
        if (
          regionRef.current &&
          ws.isPlaying() &&
          time >= regionRef.current.end
        ) {
          ws.pause();
          ws.setTime(regionRef.current.start);
          onPlayStateChange(false);
        }
      });

      ws.on('play', () => onPlayStateChange(true));
      ws.on('pause', () => onPlayStateChange(false));
      ws.on('finish', () => onPlayStateChange(false));

      ws.loadBlob(file);

      return () => {
        ws.destroy();
        wsRef.current = null;
        regionRef.current = null;
      };
    }, [file]);

    return (
      <div className="relative rounded-xl overflow-hidden bg-elevated border border-(--border-hi)">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 bg-elevated">
            {/* Animated bars */}
            <div className="bar-stagger flex items-end gap-[3px] h-12 w-full max-w-[200px]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-bar-breathe flex-1 rounded-sm bg-linear-to-t from-primary to-accent"
                />
              ))}
            </div>

            {/* Progress */}
            <div className="w-full max-w-[200px] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-(--text-3)">
                  Decoding
                </span>
                <span className="font-mono text-[10px] text-accent">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-px bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-accent transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Waveform canvas */}
        <div
          ref={containerRef}
          className="py-2 transition-opacity duration-500"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>
    );
  },
);

Waveform.displayName = 'Waveform';
export default Waveform;
