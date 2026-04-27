'use client'

import AudioTrimmer from "@/components/trimmer/audio-trimmer"
import { useState } from "react"
import { EnrichedTranscription } from '@/types'

export default function Page() {
  const [transcriptions, setTranscriptions] = useState<EnrichedTranscription | undefined>(undefined)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined)

  return (
    <AudioTrimmer />
  )
}