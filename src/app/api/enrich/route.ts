import { enrichSegments } from '@/lib/enrich'
import { TranscriptionResponse } from '@/types'

export const runtime = 'nodejs' // safer for SDK

export async function POST(req: Request) {
  try {
    const transcription: TranscriptionResponse = await req.json()

    if (!transcription || !transcription.text || !transcription.segments) {
      return Response.json({ error: 'Invalid transcription structure' }, { status: 400 })
    }

    const result = await enrichSegments(transcription, 'gemini', process.env.GEMINI_KEY)
    // const result = await enrichSegments(transcription, 'groq', process.env.GROQ_KEY)

    return Response.json(result)
  } catch (error: any) {
    console.log(error);
    return Response.json(
      { error: error.message || 'Transcription enrichment failed' },
      { status: 500 }
    )
  }
}