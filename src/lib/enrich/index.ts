import type { TranscriptionResponse } from '@/types';
import { providerClient, providers } from '@/lib/providers';

export const enrichSegments = async (
  transcriptions: TranscriptionResponse,
  apiKey: string,
  provider: keyof typeof providers,
) => {
  if (!apiKey || !provider) {
    throw new Error('Missing API Key or Provider');
  }

  const validSegments = transcriptions.segments?.filter((s) => s.text?.trim());
  if (!validSegments || validSegments.length < 2) {
    throw new Error('Response does not meet minimum segment requirement.');
  }

  const client = providerClient(provider, apiKey);
  const systemPrompt = `You are a creative director helping generate video prompts for a visual storyboard.
Given a list of lyric/speech segments and the overall narrative, return ONLY a JSON array.
Each element must have exactly two string keys: "prompt" and "context".
- "prompt": a vivid video generation prompt describing the visual scene for that segment.
- "context": a comma-separated string of 5-8 style/mood/scene-consistency words that apply
  across ALL segments to keep the visual world cohesive.
Return ONLY the raw JSON array. No markdown, no explanation.`;

  const userPrompt = `Overall narrative: "${transcriptions.text.trim()}"

Segments:
${validSegments.map((s, i) => `${i + 1}. "${s.text.trim()}"`).join('\n')}

Return a JSON array of ${validSegments.length} objects, one per segment,
each with "prompt" and "context" keys.`;

  const response = await client.chat.completions.create({
    model: providers[provider].completion_model,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = response.choices[0].message.content ?? '{}';
  let parsed;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI did not return a JSON array.');
  }

  // Map enrichment back onto segments — skipping empty-text ones
  let enrichedIdx = 0;
  const enrichedSegments = validSegments.map((segment) => {
    if (!segment.text?.trim()) return { ...segment };

    const enrichment = parsed[enrichedIdx];
    enrichedIdx++;

    // Only attach properties if they are valid non-empty strings
    const prompt =
      typeof enrichment?.prompt === 'string' && enrichment.prompt.trim()
        ? enrichment.prompt.trim()
        : null;

    const context =
      typeof enrichment?.context === 'string' && enrichment.context.trim()
        ? enrichment.context.trim()
        : null;

    return {
      ...segment,
      ...(prompt !== null && { prompt }),
      ...(context !== null && { context }),
    };
  });

  return { ...transcriptions, segments: enrichedSegments };
};
