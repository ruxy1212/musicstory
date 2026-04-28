import { Client } from "@gradio/client";
import { EnrichedSegment, SegmentResult, SegmentStatus } from "@/types";
import { clampDuration } from "@/utils/video/helpers";
import { Dispatch, SetStateAction, useCallback } from "react";

interface GenerateSegmentProps {
  seg: EnrichedSegment;
  index: number;
  token: `hf_${string}`;
  setResults: Dispatch<SetStateAction<SegmentResult[]>>;
}

export async function generateSegment({seg, index, token, setResults, isRetry = false}: GenerateSegmentProps & { isRetry?: boolean }) {
  const updateResult = (index: number, patch: Partial<SegmentResult>) => {
    setResults((prev) =>
      prev.map((r) => (r.index === index ? { ...r, ...patch } : r))
    );
  };

  const updateStatus = (index: number, patch: Partial<SegmentStatus>) => {
    setResults((prev) =>
      prev.map((r) =>
        r.index === index ? { ...r, status: { ...r.status, ...patch } } : r
      )
    );
  };

  updateStatus(index, { stage: "generating", queue: true, time: new Date() });

  try {
    const app = await Client.connect("Lightricks/ltx-video-distilled", {
      token: token,
      events: ["data", "status"],
    });

    const duration = clampDuration(seg.start, seg.end);

    const job = app.submit("/text_to_video", {
      prompt: `${seg.prompt} \nContext: ${seg.context}`,
      negative_prompt:
        "worst quality, inconsistent motion, blurry, jittery, distorted, low quality, watermark, text, ugly",
      seed_ui: 42,
      randomize_seed: false,
      mode: "text-to-video",
      duration_ui: duration,
    });

    for await (const msg of job) {
      if (msg.type === "status") {
        const s = msg as any;

        if (s.stage === "error") {
          const isQuota = !isRetry && (s.message ?? "").toLowerCase().includes("quota");

          updateResult(index, {
            failed: true,
            status: {
              stage: "error",
              queue: false,
              message: s.message ?? "Unknown error",
              time: new Date(),
            },
          });
          job.cancel();
          return { quotaError: isQuota };
        } else {
          updateStatus(index, {
            stage: s.stage === "complete" ? "complete" : "generating",
            queue: s.queue ?? false,
            code: s.code,
            success: s.success,
            size: s.size,
            position: s.position,
            eta: s.eta,
            message: s.message,
            progress_data: s.progress_data,
            time: s.time ? new Date(s.time) : new Date(),
          });
        }
      }

      if (msg.type === "data") {
        const [fileData, seed] = (msg as any).data as [
          {
            video: {
              url: string;
              path: string;
              orig_name: string;
              mime_type: string;
              is_stream: boolean;
            }
          },
          number
        ];

        const videoUrl = fileData?.video?.url ?? fileData?.video?.path ?? null;

        updateResult(index, {
          videoUrl,
          seed,
          failed: !videoUrl,
          status: { stage: "complete", queue: false, success: true, time: new Date() },
        });
        job.cancel();
        break;
      }
    }
  } catch (err: any) {
    updateResult(index, {
      failed: true,
      status: {
        stage: "error",
        queue: false,
        message: err?.message ?? "Unknown error",
        time: new Date(),
      },
    });
  }

  return { quotaError: false };
}