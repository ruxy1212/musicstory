# MusicStory — Cinematic AI Video Generator

MusicStory transforms your audio tracks into cinematic visual journeys. By analyzing lyrics and mood, it generates a narrative-driven video sequence with professional transitions and Ken Burns-style motion.

## Key Features

- **Audio Ingestion**: Visual trimming interface powered by `wavesurfer.js`.
- **AI Enrichment**: Deep analysis of audio content to generate cinematic scene prompts.
- **Scene Generation**: High-fidelity 16:9 video segments generated using AI models (e.g., LTX Video).
- **Remotion Engine**: Professional video composition with smooth transitions and dynamic motion.
- **BYOK Architecture**: Bring Your Own Key support for OpenAI, Gemini, Groq, OpenRouter, DeepSeek, Mistral, and Hugging Face (optional for higher video generation daily quota).
- **Real-time Rendering**: Live progress tracking via WebSocket connection to a dedicated rendering server.

## Application Flow

1.  **Audio Setup**: Upload your track and trim the segment you want to visualize.
2.  **AI Enrichment**: The system analyzes your audio/lyrics to create a storyboard with tailored visual prompts.
3.  **Visual Generation**: Each scene is generated as a high-quality video clip using distributed AI workers.
4.  **Server Initialization**: The app automatically wakes up the **Remotion Rendering Server** and waits for the bundle to be ready.
5.  **Composition**: Scenes are sent to the rendering server via WebSocket for final assembly, including background audio and cinematic transitions.
6.  **Delivery**: Receive a high-quality MP4 file ready for sharing.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Video Engine**: [Remotion](https://www.remotion.dev/)
- **UI & Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons, Sonner
- **Audio**: Wavesurfer.js
- **AI Interaction**: OpenAI SDK, @gradio/client

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) installed.
- A running instance of the **MusicStory Render Server**.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   Create a `.env.local` file or `cp .env.example .env`:
   ```bash
   NEXT_PUBLIC_RENDER_API_TOKEN=your_secret_token
   NEXT_PUBLIC_RENDER_SERVER_URL=http://localhost:3001
   NEXT_PUBLIC_RENDER_SERVER_DOMAIN=localhost:3001
   ```

### Running Locally

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating.

## Video Rendering Server

This application requires an external rendering service to handle the heavy lifting of video composition.

- **Repository**: [musicstory-render](https://github.com/ruxy1212/musicstory-render)
- **Health Check**: The app pings `/health` to wake the server and polls for `bundleReady: true` before initiating renders.
- **Protocol**: WebSocket-based communication for real-time progress updates (`generating`, `encoding`, `muxing`).
- **Authentication**: Simple Security via `NEXT_PUBLIC_RENDER_API_TOKEN` (which can obviously be exposed in browsers).

## License

This project is licensed under the **MIT License**.

