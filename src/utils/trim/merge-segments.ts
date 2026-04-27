import { TranscriptionResponse } from "@/types";

export const mergeSegments = (response: TranscriptionResponse, minDuration: number = 4.0) => {
  const data = response.segments?.filter(s => s.text?.trim());
  if (!data || data.length < 2) {
    throw new Error("Response does not meet minimum segment requirement.");
  }

  const merged = [];
  let i = 0;

  while (i < data.length) {
    let current = { ...data[i] };
    i++;

    // While current is too short, keep grabbing the next one
    while ((current.end - current.start) < minDuration && i < data.length) {
      const next = data[i];
      current.text += ", " + next.text;
      current.end = next.end;
      i++;
    }

    merged.push(current);
  }

  return {
    ...response,
    segments: merged
  };
}