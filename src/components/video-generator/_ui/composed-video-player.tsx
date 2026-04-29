import React, { useEffect, useRef, useState } from 'react';
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';

interface ComposedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

interface PlayerState {
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

const ComposedVideoPlayer: React.FC<ComposedVideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onError,
}) => {
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isLoading: true,
    error: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
  });

  useEffect(() => {
    if (!containerRef.current || !src) return;

    const initializePlayer = async (): Promise<void> => {
      try {
        setPlayerState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const playerInstance = new Player({
          id: src,
          url: src,
          poster: poster,
          width: width,
          height: height,
          autoplay: autoplay,
          controls: controls,
          playsinline: true,
          preload: 'metadata' as const,
          pip: true,
          screenShot: true,
          rotate: true,
          lang: 'en' as const,
          volume: 0.8,
          fluid: true,
          fitVideoSize: 'fixWidth' as const,
          touchAction: true,
          keyShortcut: true,
          controlsList: [
            'play',
            'progress',
            'time',
            'volume',
            'settings',
            'pip',
            'fullscreen',
          ],
        });

        // Event listeners with type safety
        playerInstance.on('ready', () => {
          setPlayerState((prev) => ({
            ...prev,
            isLoading: false,
            duration: playerInstance.duration || 0,
          }));
        });

        playerInstance.on('play', () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));
          onPlay?.();
        });

        playerInstance.on('pause', () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          onPause?.();
        });

        playerInstance.on('ended', () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          onEnded?.();
        });

        playerInstance.on('timeupdate', () => {
          setPlayerState((prev) => ({
            ...prev,
            currentTime: playerInstance.currentTime || 0,
          }));
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerInstance.on('error', (error: any) => {
          const errorMessage =
            error?.message ||
            'An error occurred while loading the video';
          setPlayerState((prev) => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
          }));
          onError?.(new Error(errorMessage));
        });

        playerRef.current = playerInstance;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to initialize video player';
        setPlayerState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        onError?.(new Error(errorMessage));
      }
    };

    initializePlayer();

    // Cleanup function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.warn('Error destroying player:', error);
        }
      }
    };
  }, [
    src,
    poster,
    autoplay,
    controls,
    width,
    height,
    onPlay,
    onPause,
    onEnded,
    onError,
  ]);

  if (playerState.error) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="rounded-xl border border-[var(--error)] bg-[var(--bg-elevated)] p-6 shadow-[0_0_24px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--error)] bg-opacity-10 flex items-center justify-center">
              <svg className="h-6 w-6 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-1)] font-['Syne']">Video Initialization Error</h3>
              <p className="mt-1 text-xs text-[var(--text-3)] font-mono">{playerState.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border-hi)] bg-black shadow-[0_24px_64px_rgba(0,0,0,0.4)] group">
        {playerState.isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-surface)]">
            <div className="text-center flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin-smooth" />
                <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-glow)] blur-sm animate-pulse-dot" />
              </div>
              <p className="text-[11px] text-[var(--text-3)] font-mono uppercase tracking-[0.2em] animate-pulse">
                Initializing Stream...
              </p>
            </div>
          </div>
        )}

        {/* XGPlayer container */}
        <div
          ref={containerRef}
          id={src}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default ComposedVideoPlayer;
