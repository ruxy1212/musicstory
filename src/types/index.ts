export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  prompt?: string;
  context?: string;
}

export interface TranscriptionResponse {
  text: string;
  segments?: TranscriptionSegment[];
}

export interface EnrichedSegment {
  start: number;
  end: number;
  text: string;
  prompt: string;
  context: string;
}

export interface EnrichedTranscription {
  text: string;
  segments: EnrichedSegment[];
}

export interface SegmentStatus {
  stage: "pending" | "generating" | "complete" | "error";
  queue: boolean;
  code?: string;
  success?: boolean;
  size?: number;
  position?: number;
  eta?: number;
  message?: string;
  progress_data?: Array<{
    progress: number | null;
    index: number | null;
    length: number | null;
    unit: string | null;
    desc: string | null;
  }>;
  time?: Date;
}

export interface SegmentResult {
  index: number;
  segment: EnrichedSegment;
  videoUrl: string | null;
  seed: number | null;
  status: SegmentStatus;
  failed: boolean;
}

export interface ResultClean {
  index: number;
  segment: EnrichedSegment;
  videoUrl: string | null;
  seed: number | null;
  failed: boolean;
  duration: number;
}

export interface VideoGeneratorProps {
  title: string;
  enrichedTranscriptions: { text: string; segments: EnrichedSegment[] };
  audioBlob: Blob | null;
  token: `hf_${string}`;
}

export interface CompositionProps {
  results: SegmentResult[];
  audioUrl: string | null;
}

export interface VideoGeneratorHandle {
  runGeneration: () => void;
}

export interface RenderProgress {
  stage: 'bundling' | 'composing' | 'rendering' | 'uploading' | 'complete' | 'error' | 'started';
  progress?: number;
  message?: string;
  videoUrl?: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  userId: string;
  createdAt: string;
  title?: string;
}
