import { audioTranscribeAI } from '@/lib/transcribe'
import { mergeSegments } from '@/utils/trim/merge-segments'

export const runtime = 'nodejs' // safer for SDK

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const apiKey = req.headers.get('x-api-key')
    const provider = req.headers.get('x-provider')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'Invalid file' }, { status: 400 })
    }

    if (!apiKey || !provider) {
      return Response.json({ error: 'Missing API Key or Provider in headers' }, { status: 401 })
    }

    const result = await audioTranscribeAI(file, apiKey, provider as any)

    const cleanedResponse = mergeSegments(result, 3.8);
    return Response.json(cleanedResponse)
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}