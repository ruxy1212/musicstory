import { enrichSegments } from '@/lib/enrich'
import { TranscriptionResponse } from '@/types'

export const runtime = 'nodejs' // safer for SDK

export async function POST(req: Request) {
  try {
    const transcription: TranscriptionResponse = await req.json()
    const apiKey = req.headers.get('x-api-key')
    const provider = req.headers.get('x-provider')

    if (!transcription || !transcription.text || !transcription.segments) {
      return Response.json({ error: 'Invalid transcription structure' }, { status: 400 })
    }

    if (!apiKey || !provider) {
      return Response.json({ error: 'Missing API Key or Provider in headers' }, { status: 401 })
    }

    const result = await enrichSegments(transcription, apiKey, provider as any)

    return Response.json(result)
  } catch (error: any) {
    console.log(error);
    return Response.json(
      { error: error.message || 'Transcription enrichment failed' },
      { status: 500 }
    )
  }
}