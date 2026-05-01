'use client';

import AudioTrimmer from '@/components/trimmer/audio-trimmer';
import { useEffect, useRef, useState } from 'react';
import type { EnrichedTranscription, VideoGeneratorHandle } from '@/types';
import VideoGenerator from '@/components/video-generator';
import { useKeys } from '@/components/config/keys-context';
import Header from '@/components/common/header';

export default function Page() {
  const { videoGenKey: hf_key } = useKeys();

  const videoRef = useRef<VideoGeneratorHandle>(null);
  const [title, setTitle] = useState('no-title');
  const [videoData, setVideoData] = useState<{
    blob: Blob;
    transcriptions: EnrichedTranscription;
  } | null>(null);

  const generateVideo = (
    audioBlob: Blob,
    transcriptions: EnrichedTranscription,
  ) => {
    if (!audioBlob || !transcriptions) return;
    setVideoData({ blob: audioBlob, transcriptions });
  };

  useEffect(() => {
    if (videoData && videoRef.current) {
      videoRef.current.runGeneration();
    }
  }, [videoData]);

  return (
    <>
      <Header location="Create" />
      {!videoData && (
        <AudioTrimmer onGenerate={generateVideo} setTitle={setTitle} />
      )}
      {videoData && (
        <VideoGenerator
          ref={videoRef}
          title={title}
          enrichedTranscriptions={videoData.transcriptions}
          audioBlob={videoData.blob}
          token={(hf_key || '') as `hf_${string}`}
        />
      )}
    </>
  );
}
