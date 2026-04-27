'use client'

import AudioTrimmer from "@/components/trimmer/audio-trimmer"
import { useRef, useState } from "react"
import { EnrichedTranscription, VideoGeneratorHandle } from '@/types'
import VideoGenerator from "@/components/video-generator"

export default function Page() {
  const videoRef = useRef<VideoGeneratorHandle>(null);

  const [transcriptions, setTranscriptions] = useState<EnrichedTranscription | undefined>(undefined)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined)

  const generateVideo = () => {
    if (!audioBlob || !transcriptions) return
    videoRef.current?.runGeneration()
  }

  return (
    <>
      <AudioTrimmer setTranscriptions={setTranscriptions} setAudioBlob={setAudioBlob} generateVideo={generateVideo} />
      {audioBlob && transcriptions && transcriptions.segments && (
        <VideoGenerator
          ref={videoRef}
          enrichedTranscriptions={transcriptions}
          audioBlob={audioBlob}
          token={(process.env.NEXT_PUBLIC_HF_KEY || '') as `hf_${string}`}
        />
      )}
    </>
  )
}