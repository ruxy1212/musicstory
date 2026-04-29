# AGENTS.md — MusicStory AI Video Generator

> This file is the authoritative guide for AI coding agents building this application.
> Read it fully before writing any code. Follow the current architectural patterns.
DO NOT RUN ANY NPM/PNPM COMMANDS, THE USER WILL MANUALLY RUN THEM AT THE END OF EACH PASS (WHERE NECESSARY)
---

## Project Identity

**What it does:** Transforms audio tracks into cinematic visual journeys. It accepts user-uploaded audio, transcribes and enriches it with AI-generated prompts, generates video segments for each scene, and composes them into a final video with Ken Burns-style motion and professional transitions.

**Key Architecture: BYOK (Bring Your Own Key)**
The application is designed to be cost-neutral for the operator. Users provide their own API keys for AI services (OpenAI, Gemini, Groq, Hugging Face, etc.), which are stored securely in their browser's `localStorage` via a `KeyProvider`.

**Repository Layout:**

```
/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── create/             # Main creation pipeline
│   │   ├── api/                # Edge/Serverless functions
│   │   └── providers.tsx       # React context providers (Keys, Theme, etc.)
│   ├── components/
│   │   ├── trimmer/            # Audio upload and trimming (Wavesurfer)
│   │   ├── video-generator/    # Video generation & orchestration
│   │   ├── config/             # BYOK Modal and Key management
│   │   └── common/             # Reusable UI components
│   ├── hooks/
│   │   └── useMotionRenderer.ts # WebSocket client for Remotion rendering
│   ├── lib/
│   │   ├── transcribe/         # AI Transcription logic
│   │   ├── enrich/             # AI Scene analysis & prompt generation
│   │   └── providers.ts        # API Client factory (OpenAI-compatible)
│   ├── utils/
│   │   ├── video/              # Video math & helpers
│   │   └── trim/               # Audio processing helpers
│   └── types/                  # Shared TypeScript interfaces
├── public/                     # Static assets
├── remotion.config.ts          # Remotion configuration
├── next.config.ts              # Next.js configuration
├── pnpm-workspace.yaml         # Project is managed with pnpm
└── AGENTS.md                   # This file
```

---

## Stack (Current)

| Dependency | Version | Notes |
|---|---|---|
| next | 16.2.x | App Router, Turbopack, React Compiler |
| react + react-dom | 19.2.x | |
| typescript | 5.x | strict mode |
| tailwindcss | 4.x | CSS-first config (no tailwind.config.js) |
| remotion | 4.x | Core video engine |
| @remotion/player | 4.x | Client-side video preview |
| wavesurfer.js | 7.x | Audio visualization and trimming |
| @gradio/client | 2.x | Connection to Hugging Face Spaces (LTX Video) |
| openai | 4.x | SDK for multiple AI providers (OpenAI, Groq, etc.) |
| sonner | 2.x | Toast notifications |
| lucide-react | latest | Icons |
| motion | latest | Animations (Framer Motion) |

---

## Core Workflows

### 1. Audio Ingestion (AudioTrimmer)
- User uploads audio.
- `wavesurfer.js` provides a visual interface for trimming.
- Constraints: Minimum 12s, Maximum 30s (for current generation limits).
- Result: An audio `Blob` and a title.

### 2. Transcription & Enrichment (lib/transcribe & lib/enrich)
- Uses the `audioTranscribeAI` utility to get text and timestamps.
- Uses `enrich` to analyze lyrics/rhythm and generate cinematic prompts for 4-6 scenes.
- Support for multiple providers (Gemini, OpenAI, Groq, Mistral) via OpenAI-compatible endpoints.

### 3. Scene Generation (VideoGenerator)
- Connects to Hugging Face (`Lightricks/ltx-video-distilled`) via `@gradio/client`.
- Generates 16:9 video segments for each scene.
- Implements IP-based quota detection; if a quota is hit, it switches to the user's provided Hugging Face token.

### 4. Composition (Remotion)
- Coordinates with an external **Remotion Rendering Server** via WebSockets (`useRemotionRender`).
- Sends scene URLs, audio data, and timing metadata to the server.
- The server (external project) runs Remotion + FFmpeg to stitch the final MP4.
- Progress is streamed back to the client in real-time.

---

## Coding Conventions for Agents

- **TypeScript Everything**: No `any`. Use the types defined in `src/types/index.ts`.
- **BYOK First**: Never hardcode API keys. Always use `useKeys()` hook to access user-provided keys.
- **Tailwind v4**: Use CSS variables and `@theme` in `globals.css`. Avoid `tailwind.config.js`.
- **Composition over Inheritance**: Keep UI fragments in `_fragments` or `_ui` subdirectories within components.
- **Error Handling**: Use `sonner` for user-facing errors. Log technical details to console only in dev.
- **Remotion**: Don't import heavy Remotion rendering packages in the main app bundle unless necessary for the player.

---

## Development & Deployment

- **Package Manager**: `pnpm`
- **Frontend**: Next.js 16 on Vercel.
- **Rendering Server**: An external Node.js service (separate repo) that handles Remotion rendering via WebSocket.
- **Storage**: Client-side (mostly). Final videos are served from the rendering server's storage or temporary URLs.

---

## Future Roadmap

- **Phase 1 (Complete)**: Basic upload, trim, and scene generation.
- **Phase 2 (In Progress)**: Full composition with Remotion and WebSocket progress tracking.
- **Phase 3 (Next)**: Share flow, virality features, and public video pages.
- **Phase 4**: Advanced styling and custom motion models.
 ["node", "dist/index.js"]
```

```bash
fly deploy
```

---

## What NOT to Build in the MVP

The following are explicitly out of scope until Pro tier has validated paying demand:

- AI video motion models (Runway, Luma, Stable Video Diffusion).
- 60-second video support.
- Custom visual style selection.
- Batch processing or API access.
- Mobile app.
- Email notifications (polling is sufficient for v1).