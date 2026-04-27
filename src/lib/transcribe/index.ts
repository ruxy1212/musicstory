import { TranscriptionResponse, TranscriptionSegment } from "@/types";
import OpenAI, { toFile } from "openai";
import { providerClient, providers } from "@/lib/providers";

// Providers that return verbose_json with segments
const transcriptionViaAPI = async (
  client: OpenAI,
  audio: File | Blob,
  provider: keyof typeof providers
): Promise<TranscriptionResponse> => {
  const file = audio instanceof File
    ? audio
    : await toFile(audio, "audio.wav", { type: "audio/wav" });

  const transcription = await client.audio.transcriptions.create({
    file,
    model: providers[provider].transcription_model,
    response_format: "verbose_json",
  });

  // verbose_json returns segments with start/end timestamps
  const segments: TranscriptionSegment[] = (transcription.segments ?? []).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));

  return {
    text: transcription.text,
    segments,
  };
};

// Gemini (and any provider that doesn't support /audio/transcriptions)
const transcriptionViaChat = async (
  client: OpenAI,
  audio: File | Blob,
  provider: keyof typeof providers
): Promise<TranscriptionResponse> => {
  const arrayBuffer = await audio.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  const response = await client.chat.completions.create({
    model: providers[provider].transcription_model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Transcribe this audio exactly. 
Return ONLY a JSON object in this format, no markdown, no explanation:
{
  "text": "<full transcription>",
  "segments": [
    { "start": 0.0, "end": 3.0, "text": "<line>" }
  ]
}
Each segment should cover roughly 3 seconds of audio.`,
          },
          {
            type: "input_audio",
            input_audio: {
              data: base64Audio,
              format: "wav",
            },
          },
        ],
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as TranscriptionResponse;
    return parsed;
  } catch {
    // Fallback: model didn't return valid JSON, return plain text
    return { text: raw, segments: [] };
  }
};

export const audioTranscribeAI = async (
  audio: File | Blob,
  provider: keyof typeof providers,
  apiKey?: string
): Promise<TranscriptionResponse> => {
  const config = providers[provider];
  const client = providerClient(provider, apiKey);

  if (config.method === "chat") {
    return transcriptionViaChat(client, audio, provider);
  }

  return transcriptionViaAPI(client, audio, provider);
};