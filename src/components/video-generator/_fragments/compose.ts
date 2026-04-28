import type { SegmentResult } from "@/types";
import { Dispatch, SetStateAction, useRef } from "react";

export interface ComposeVideoProps {
  audioBlob: Blob | null;
  results: SegmentResult[];
  setComposedVideoUrl: Dispatch<SetStateAction<string | null>>;
  setPhase: Dispatch<SetStateAction<"idle" | "generating" | "composing" | "done">>;
}

export async function composeVideo({ audioBlob, results, setComposedVideoUrl, setPhase }: ComposeVideoProps) {
  let audioUrl: string | null = null;

  if (audioBlob) {
    audioUrl = URL.createObjectURL(audioBlob);
  }

  try {
    const res = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        results: results,
        audioUrl: audioUrl,
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: "video/mp4" });
    setComposedVideoUrl(URL.createObjectURL(blob));
    setPhase("done");
  } catch (err) {
    console.error("Render failed:", err);
    setPhase("done"); // fallback to individual clips
  }
}