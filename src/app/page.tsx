'use client'

import AudioTrimmer from "@/components/trimmer/audio-trimmer"
import { useEffect, useRef, useState } from "react"
import { EnrichedTranscription, VideoGeneratorHandle } from '@/types'
import VideoGenerator from "@/components/video-generator"

export default function Page() {
  const videoRef = useRef<VideoGeneratorHandle>(null);
  const [title, setTitle] = useState('no-title');
  const [videoData, setVideoData] = useState<{
    blob: Blob,
    transcriptions: EnrichedTranscription
  } | null>(null);

  const generateVideo = (audioBlob: Blob, transcriptions: EnrichedTranscription) => {
    if (!audioBlob || !transcriptions) return
    setVideoData({ blob: audioBlob, transcriptions });
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    if (videoData && videoRef.current) {
      videoRef.current.runGeneration();
    }
  }, [videoData]);

  return (
    <>
      {!videoData && <AudioTrimmer onGenerate={generateVideo} setTitle={setTitle} />}
      {videoData && (
        <VideoGenerator
          ref={videoRef}
          title={title}
          enrichedTranscriptions={videoData.transcriptions}
          audioBlob={videoData.blob}
          token={(process.env.NEXT_PUBLIC_HF_KEY || '') as `hf_${string}`}
        />
      )}
    </>
  )
}