import type { SegmentResult } from "@/types";
import { Dispatch, SetStateAction } from "react";

export interface ComposeVideoProps {
  audioBlob: Blob | null;
  results: SegmentResult[];
  setComposedVideoUrl: Dispatch<SetStateAction<string | null>>;
  setPhase: Dispatch<SetStateAction<"idle" | "generating" | "composing" | "done">>;
}

// Point to your Render.com server URL.
// In development, set NEXT_PUBLIC_RENDER_SERVER_URL=http://localhost:3001
const RENDER_SERVER_URL =
  process.env.NEXT_PUBLIC_RENDER_SERVER_URL ?? "https://your-app.onrender.com";
const serverHost = process.env.NEXT_PUBLIC_RENDER_SERVER_DOMAIN?.replace(/^https?:\/\//, '');


export async function composeVideo({
  audioBlob,
  results,
  setComposedVideoUrl,
  setPhase,
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
    const res = await fetch(`${RENDER_SERVER_URL}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        results: sanitizedResults,
        audioUrl: audioDataUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Render server error: ${errText}`);
    }

    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: "video/mp4" });
    setComposedVideoUrl(URL.createObjectURL(blob));
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