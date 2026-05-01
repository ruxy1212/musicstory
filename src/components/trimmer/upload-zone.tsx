'use client';

import { useRef, useState, useCallback } from 'react';
import { Music, FileAudio } from 'lucide-react';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('audio/')) {
        setIsError(true);
        setTimeout(() => setIsError(false), 1000);
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload audio file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={[
        'group relative flex flex-col items-center justify-center gap-5 px-10 py-16',
        'rounded-2xl cursor-pointer select-none outline-none',
        'border transition-all duration-300',
        'bg-surface',
        isDragging
          ? 'border-accent shadow-[0_0_32px_var(--accent-glow)] scale-[1.01]'
          : isError
            ? 'border-error animate-shake'
            : 'border-(--border-hi) hover:border-primary hover:shadow-[0_0_24px_var(--primary-glow)] hover:-translate-y-0.5',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Icon */}
      <div
        className={[
          'flex items-center justify-center w-16 h-16 rounded-full',
          'border transition-all duration-300',
          'bg-elevated',
          isDragging
            ? 'border-accent shadow-[0_0_16px_var(--accent-glow)]'
            : 'border-(--border-hi) group-hover:border-primary group-hover:shadow-[0_0_14px_var(--primary-glow)]',
        ].join(' ')}
      >
        {isDragging ? (
          <FileAudio size={26} className="text-accent animate-bounce" />
        ) : (
          <Music
            size={26}
            className="text-(--text-2) group-hover:text-primary transition-colors duration-300"
          />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {isError ? (
          <span className="font-['Syne'] text-base font-semibold text-error">
            Audio files only — MP3, WAV, FLAC, M4A
          </span>
        ) : isDragging ? (
          <span className="font-['Syne'] text-base font-semibold tracking-widest uppercase text-accent">
            Release to load
          </span>
        ) : (
          <>
            <span className="font-['Syne'] text-base font-semibold text-(--text-1)">
              Drop audio here
            </span>
            <span className="text-sm text-(--text-2)">
              or{' '}
              <span className="text-primary underline underline-offset-2">
                click to browse
              </span>{' '}
              — MP3, WAV, FLAC, M4A
            </span>
          </>
        )}
      </div>

      {/* Corner accents */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <span
          key={pos}
          className={[
            'absolute w-4 h-4 border-primary transition-all duration-300 opacity-40 group-hover:opacity-100',
            pos === 'tl' ? 'top-3 left-3 border-t-2 border-l-2' : '',
            pos === 'tr' ? 'top-3 right-3 border-t-2 border-r-2' : '',
            pos === 'bl' ? 'bottom-3 left-3 border-b-2 border-l-2' : '',
            pos === 'br' ? 'bottom-3 right-3 border-b-2 border-r-2' : '',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
