import { enrichSegments } from '@/lib/enrich';
import type { TranscriptionResponse } from '@/types';
import type { providers } from '@/lib/providers';

export const runtime = 'nodejs'; // safer for SDK

export async function POST(req: Request) {
  try {
    const transcription: TranscriptionResponse = await req.json();
    const apiKey = req.headers.get('x-api-key');
    const provider = req.headers.get('x-provider');

    if (!transcription || !transcription.text || !transcription.segments) {
      return Response.json(
        { error: 'Invalid transcription structure' },
        { status: 400 },
      );
    }

    if (!apiKey || !provider) {
      return Response.json(
        { error: 'Missing API Key or Provider in headers' },
        { status: 401 },
      );
    }

    const result = await enrichSegments(
      transcription,
      apiKey,
      provider as keyof typeof providers,
    );

    return Response.json(result);
  } catch (error: unknown) {
    return Response.json(
      {
        error:
          (error instanceof Error ? error.message : 'Something went wrong') ||
          'Transcription enrichment failed',
      },
      { status: 500 },
    );
  }
}
