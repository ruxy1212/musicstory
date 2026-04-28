import type { ResultClean, SegmentResult } from "@/types";
import { Dispatch, SetStateAction } from "react";

export interface ComposeVideoProps {
  audioBlob: Blob | null;
  results: SegmentResult[];
  setComposedVideoUrl: Dispatch<SetStateAction<string | null>>;
  setPhase: Dispatch<SetStateAction<"idle" | "generating" | "composing" | "done">>;
  startRender: (results: ResultClean[], audioUrl: string | null, setUrl: (url: string) => void) => void;
}

// Point to your Render.com server URL.
// In development, set NEXT_PUBLIC_RENDER_SERVER_DOMAIN=localhost:3001
const serverHost = process.env.NEXT_PUBLIC_RENDER_SERVER_DOMAIN?.replace(/^https?:\/\//, '');

export async function composeVideo({
  audioBlob,
  results,
  setComposedVideoUrl,
  setPhase,
  startRender,
}: ComposeVideoProps) {
  let audioDataUrl: string | null = null;

  if (audioBlob) {
    audioDataUrl = await blobToDataUrl(audioBlob);
  }

  const sanitizedResults = results.map((r) => ({
    ...r,
    videoUrl:
      r.videoUrl && r.videoUrl.startsWith("http") ? r.videoUrl : null,
  }));

  try {
    const resultClean = results.map((res, idx) => ({
      index: idx,
      segment: res.segment,
      videoUrl: res.videoUrl || null,
      seed: res.seed || Math.floor(Math.random() * 10000),
      failed: res.failed,
      duration: res.segment.end - res.segment.start,
    }));

    startRender(resultClean, audioDataUrl, setComposedVideoUrl);
    setPhase("done");
  } catch (err) {
    console.error("Render failed:", err);
    setPhase("done"); // graceful fallback — app can show individual clips
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}