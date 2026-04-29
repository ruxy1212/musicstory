# MusicStory — Cinematic AI Video Generator

MusicStory transforms your audio tracks into cinematic visual journeys. By analyzing lyrics and mood, it generates a narrative-driven video sequence with professional transitions and Ken Burns-style motion.

## Key Features

- **Audio Ingestion**: Visual trimming interface powered by `wavesurfer.js`.
- **AI Enrichment**: Deep analysis of audio content to generate cinematic scene prompts.
- **Scene Generation**: High-fidelity 16:9 video segments generated using LTX Video models.
- **Remotion Engine**: Professional video composition with smooth transitions and dynamic motion.
- **BYOK Architecture**: Bring Your Own Key support for OpenAI, Gemini, Groq, OpenRouter, DeepSeek, Mistral and Hugging Face (optional for higher daily quota).
- **Real-time Rendering**: Live progress tracking via WebSocket connection to a dedicated rendering server.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Video Engine**: [Remotion](https://www.remotion.dev/)
- **UI & Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons
- **Audio**: Wavesurfer.js
- **AI Interaction**: OpenAI SDK, @gradio/client

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) installed.
- Access to an external **Remotion Rendering Server** (or run one locally).

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_RENDER_SERVER_DOMAIN=localhost:3001
   ```

### Running Locally

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating.

## 📡 Video Rendering (WebSocket)

This application coordinates video composition through an external rendering service.
- **Hook**: `useRemotionRender` establishes a WebSocket connection.
- **Protocol**: Sends a `START_RENDER` message with scene metadata and audio data.
- **Updates**: Receives real-time progress percentages and status stages (`generating`, `encoding`, `muxing`).
- **Result**: Streams the final video URL upon completion.

## 📄 License

This project is licensed under the **MIT License**.
