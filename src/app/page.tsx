'use client'

import AudioTrimmer from "@/components/trimmer/audio-trimmer"
import { useEffect, useRef, useState } from "react"
import { EnrichedTranscription, VideoGeneratorHandle } from '@/types'
import VideoGenerator from "@/components/video-generator"

export default function Page() {
  const videoRef = useRef<VideoGeneratorHandle>(null);
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
    const callIt = async () =>{ 
      if (!videoData?.blob) return;
      const audioDataUrl = await blobToDataUrl(videoData.blob);
      console.log({audio: audioDataUrl})
    }
    if (videoData && videoRef.current) {
      callIt()
      
      // videoRef.current.runGeneration();
    }
  }, [videoData]);

  return (
    <>
      <AudioTrimmer onGenerate={generateVideo} />
      {videoData && (
        <VideoGenerator
          ref={videoRef}
          enrichedTranscriptions={videoData.transcriptions}
          audioBlob={videoData.blob}
          token={(process.env.NEXT_PUBLIC_HF_KEY || '') as `hf_${string}`}
        />
      )}
    </>
  )
}