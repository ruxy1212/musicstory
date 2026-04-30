'use client'

import { useRef, useState, useCallback, Dispatch, SetStateAction } from 'react'
import UploadZone from '@/components/trimmer/upload-zone'
import Waveform, { WaveformHandle } from '@/components/trimmer/waveform'
import TransportControls from '@/components/trimmer/transport-controls'
import { ChevronRight, X } from 'lucide-react'
import { trimAudio } from '@/utils/trim/trim-audio'
import { EnrichedTranscription } from '@/types'
import Logo from '@/components/common/logo'
import { toast } from 'sonner'
import { useKeys } from '@/components/config/keys-context'

interface AudioTrimmerProps {
  setTitle: Dispatch<SetStateAction<string>>
  onGenerate: (blob: Blob, transcription: EnrichedTranscription) => void
}

export default function AudioTrimmer({ onGenerate, setTitle }: AudioTrimmerProps) {
  const waveformRef = useRef<WaveformHandle>(null)
  const { textAudioKey, audioProvider } = useKeys()

  const [file, setFile] = useState<File | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [region, setRegion] = useState({ start: 0, end: 30 })

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setIsReady(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setRegion({ start: 0, end: 30 })
  }, [])

  const handlePlay = useCallback(() => waveformRef.current?.play(), [])
  const handlePause = useCallback(() => waveformRef.current?.pause(), [])

  const handleProcess = useCallback(async () => {
    if (!file) return

    if (!textAudioKey || !audioProvider) {
      toast.error("API Key missing", {
        description: "Please configure your Text & Audio API key in settings."
      })
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Processing audio...")

    try {
      setTitle(file.name.replace(/\.[^/.]+$/, ""))
      const wavBlob = await trimAudio(file, region.start, region.end)
      const form = new FormData()
      form.append('file', wavBlob, 'trimmed_audio.wav')
      form.append('start', region.start.toString())
      form.append('end', region.end.toString())

      toast.loading("Transcribing audio...", { id: toastId })
      const transcription = await fetch('/api/transcribe', {
        method: 'POST',
        body: form,
        headers: {
          'x-api-key': textAudioKey,
          'x-provider': audioProvider
        }
      })
      
      const transcriptionJson = await transcription.json()
      if (transcriptionJson.error) {
        throw new Error(transcriptionJson.error)
      }

      if (!transcriptionJson || !transcriptionJson.text || !transcriptionJson.segments) {
        throw new Error("Invalid transcription received")
      }

      toast.loading("Enriching scenes with AI...", { id: toastId })
      const enrichedTranscription = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': textAudioKey,
          'x-provider': audioProvider
        },
        body: JSON.stringify(transcriptionJson)
      })
      
      const enrichedTranscriptionJson = await enrichedTranscription.json()
      if (enrichedTranscriptionJson.error) {
        throw new Error(enrichedTranscriptionJson.error)
      }

      toast.success("Ready to generate video!", { id: toastId })
      onGenerate(wavBlob, enrichedTranscriptionJson)
    } catch (error: any) {
      console.error("Error trimming/uploading audio:", error)
      toast.error("Process failed", {
        id: toastId,
        description: error.message || "An unexpected error occurred."
      })
    } finally {
      setTimeout(() => setIsProcessing(false), 1500)
    }
  }, [file, region, textAudioKey, audioProvider, onGenerate, setTitle])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] md:p-6 lg:p-8">

      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-[var(--primary-glow)] blur-[120px] opacity-30 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--accent-glow)] blur-[100px] opacity-20 pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Card */}
      <div className="scanlines relative mt-16 mb-20 z-10 w-full max-w-2xl rounded-2xl border border-[var(--border-hi)] bg-[var(--bg-surface)] shadow-[0_24px_64px_rgba(0,0,0,0.6)] md:mb-0">

        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 p-5 border-b border-[var(--border)] md:flex-row md:px-7">
          <div className="flex items-center gap-3.5">
            {/* Logo mark */}
            <Logo />
            <div>
              <h1 className="font-['Syne'] text-[17px] font-bold text-[var(--text-1)] leading-tight tracking-tight">
                Audio Trimmer
              </h1>
              <p className="text-[11px] text-[var(--text-3)] tracking-wide mt-px">
                12 to 30 seconds · drag <span className="hidden md:inline">region</span> to set trim <span className="hidden md:inline">points</span>
              </p>
            </div>
          </div>

          {/* File pill */}
          {file && (
            <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full border border-[var(--border-hi)] bg-[var(--bg-elevated)] max-w-[200px]">
              <span className={[
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                isReady
                  ? 'bg-[var(--success)] shadow-[0_0_6px_theme(colors.green.500)]'
                  : 'bg-yellow-500 animate-pulse-dot',
              ].join(' ')} />
              <span className="font-mono text-[10px] text-[var(--text-2)] truncate">
                {file.name}
              </span>
              <button
                onClick={() => { setFile(null); setIsReady(false) }}
                aria-label="Remove file"
                className="cursor-pointer flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[var(--text-3)] hover:text-[var(--error)] hover:bg-[var(--bg-overlay)] transition-colors duration-150"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 md:px-7">
          {!file ? (
            <UploadZone onFile={handleFile} />
          ) : (
            <>
              {/* Hint */}
              <div className="flex items-center gap-1.5">
                <ChevronRight size={11} className="text-[var(--primary)]" />
                <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-3)]">
                  Select region to trim
                </span>
              </div>

              {/* Waveform */}
              <Waveform
                ref={waveformRef}
                file={file}
                onReady={(dur) => { setIsReady(true) }}
                onRegionChange={(s, e) => setRegion({ start: s, end: e })}
                onPlayStateChange={setIsPlaying}
                onTimeUpdate={setCurrentTime}
              />

              {/* Transport */}
              {isReady && (
                <TransportControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  regionStart={region.start}
                  regionEnd={region.end}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onProcess={handleProcess}
                  isReady={isReady}
                  isProcessing={isProcessing}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}