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

  function handleDownload() {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = "composed_video.mp4";
    a.click();
  }

  if (playerState.error) {
    return (
      <div className={`mx-auto w-full max-w-4xl ${className}`}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Video Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {playerState.error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-4xl ${className}`}>
      <div className="relative w-full">
        <div className="relative w-full">
          {playerState.isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">
                  Loading video...
                </p>
              </div>
            </div>
          )}

          {/* XGPlayer container */}
          <div
            ref={containerRef}
            id={src}
            className="absolute inset-0 h-full w-full overflow-hidden rounded-lg"
            style={{
              backgroundColor: '#000',
              aspectRatio: '16/9',
            }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposedVideoPlayer;
