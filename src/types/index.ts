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