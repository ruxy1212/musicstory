import OpenAI from "openai";

export const providers = {
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    transcription_model: "gemini-2.5-flash-lite",
    completion_model: "gemini-2.5-flash",
    method: "chat" as const,
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    transcription_model: "whisper-1",
    completion_model: "gpt-4.1-mini",
    method: "transcription" as const,
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    transcription_model: "openai/whisper-1",
    completion_model: "deepseek/deepseek-v4-flash",
    method: "transcription" as const,
  },
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    transcription_model: "whisper-large-v3-turbo",
    completion_model: "llama-4-maverick",
    method: "transcription" as const,
  },
  mistral: {
    baseURL: "https://api.mistral.ai/v1",
    transcription_model: "voxtral-mini-latest",
    completion_model: "mistral-large-2512",
    method: "transcription" as const,
  },
};

export const providerClient = (provider: keyof typeof providers, apiKey?: string) => {
  const config = providers[provider];
  const client = new OpenAI({
      apiKey: apiKey,
      baseURL: config.baseURL,
    });

  return client;
}