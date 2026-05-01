import { Client, type Status, type Payload } from '@gradio/client';
import type { EnrichedSegment, SegmentResult, SegmentStatus } from '@/types';
import { clampDuration } from '@/utils/video/helpers';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface GenerateSegmentProps {
  seg: EnrichedSegment;
  index: number;
  token: `hf_${string}`;
  setResults: Dispatch<SetStateAction<SegmentResult[]>>;
}

export async function generateSegment({
  seg,
  index,
  token,
  setResults,
  isRetry = false,
}: GenerateSegmentProps & { isRetry?: boolean }) {
  const updateResult = (index: number, patch: Partial<SegmentResult>) => {
    setResults((prev) =>
      prev.map((r) => (r.index === index ? { ...r, ...patch } : r)),
    );
  };

  const updateStatus = (index: number, patch: Partial<SegmentStatus>) => {
    setResults((prev) =>
      prev.map((r) =>
        r.index === index ? { ...r, status: { ...r.status, ...patch } } : r,
      ),
    );
  };

  updateStatus(index, { stage: 'generating', queue: true, time: new Date() });

  try {
    const app = await Client.connect('Lightricks/ltx-video-distilled', {
      token: token,
      events: ['data', 'status'],
    });

    const duration = clampDuration(seg.start, seg.end);

    const job = app.submit('/text_to_video', {
      prompt: `${seg.prompt} \nContext: ${seg.context}`,
      negative_prompt:
        'worst quality, inconsistent motion, blurry, jittery, distorted, low quality, watermark, text, ugly',
      seed_ui: 42,
      randomize_seed: false,
      mode: 'text-to-video',
      duration_ui: duration,
    });

    for await (const msg of job) {
      if (msg.type === 'status') {
        const s = msg as Status;
        const statusMessage = typeof s.message === 'string' ? s.message : '';

        if (s.stage === 'error') {
          const isQuota =
            !isRetry &&
            typeof s.message === 'string' &&
            ((s.message as string) ?? '').toLowerCase().includes('quota');

          updateResult(index, {
            failed: true,
            status: {
              stage: 'error',
              queue: false,
              message: statusMessage || 'Unknown error',
              time: new Date(),
            },
          });
          toast.error(`Scene ${index + 1} failed`, {
            description: statusMessage ?? 'Unknown generation error',
          });
          job.cancel();
          return { quotaError: isQuota };
        } else {
          updateStatus(index, {
            stage: s.stage === 'complete' ? 'complete' : 'generating',
            queue: s.queue ?? false,
            code: s.code,
            success: s.success,
            size: s.size,
            position: s.position,
            eta: s.eta,
            message: statusMessage,
            progress_data: s.progress_data,
            time: s.time ? new Date(s.time) : new Date(),
          });
        }
      }

      if (msg.type === 'data') {
        const d = msg as Payload;
        const [fileData, seed] = d.data as [
          {
            video: {
              url: string;
              path: string;
              orig_name: string;
              mime_type: string;
              is_stream: boolean;
            };
          },
          number,
        ];

        const videoUrl = fileData?.video?.url ?? fileData?.video?.path ?? null;

        updateResult(index, {
          videoUrl,
          seed,
          failed: !videoUrl,
          status: {
            stage: 'complete',
            queue: false,
            success: true,
            time: new Date(),
          },
        });
        job.cancel();
        break;
      }
    }
  } catch (err: unknown) {
    updateResult(index, {
      failed: true,
      status: {
        stage: 'error',
        queue: false,
        message: err instanceof Error ? err.message : 'Unknown error',
        time: new Date(),
      },
    });
    toast.error(`Scene ${index + 1} crashed`, {
      description:
        err instanceof Error ? err.message : 'Network or connection error',
    });
  }

  return { quotaError: false };
}
