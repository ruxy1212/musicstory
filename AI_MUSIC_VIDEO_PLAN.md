# MusicStory — Implementation Plan (Revised)

> **Revised:** April 2026 | **Stack:** Next.js 16.2 · Tailwind CSS v4 · React 19.2 · TypeScript 5.x · Remotion

---

## Overview

MusicStory is a web application that transforms audio tracks into cinematic visual stories. Unlike previous iterations that relied on heavy server-side processing and fixed cost models, this version uses a **Bring Your Own Key (BYOK)** architecture and a client-side orchestration model combined with a dedicated Remotion rendering service.

---

## Technical Architecture

### 1. Frontend: Next.js 16 (App Router)
- **Framework**: Next.js 16.2 with React 19 and React Compiler.
- **Styling**: Tailwind CSS v4 (CSS-first approach).
- **Audio Processing**: `wavesurfer.js` for client-side visualization and trimming.
- **Key Management**: `KeyProvider` context for secure, browser-local storage of API keys.

### 2. AI Pipeline (Orchestrated by Client)
- **Transcription**: Multiple providers (Gemini, Groq, OpenAI) via OpenAI-compatible SDK.
- **Scene Enrichment**: LLM-based analysis of lyrics and rhythm to generate descriptive visual prompts for 4-6 scenes.
- **Video Generation**: Individual scene segments (16:9) generated using the **LTX Video** model on Hugging Face via `@gradio/client`.
- **Quota Management**: Automatic switching between shared IP quotas and user-provided Hugging Face tokens.

### 3. Composition: Remotion + External Rendering Server
- **Video Engine**: Remotion for high-fidelity composition, Ken Burns effects, and transitions.
- **Rendering**: Heavy-duty rendering is offloaded to an external Node.js service via **WebSockets**.
- **Progress Tracking**: Real-time progress updates streamed from the rendering server back to the React UI.

---

## Implementation Phases

### Phase 1: Foundation (Complete)
- [x] Next.js 16 Scaffold with Tailwind v4.
- [x] BYOK Modal and Key Management.
- [x] Audio Upload and Trimming with Wavesurfer.
- [x] AI Transcription and Scene Prompt Enrichment.

### Phase 2: Generation & Composition (In Progress)
- [x] Hugging Face LTX Video segment generation.
- [x] WebSocket client for Remotion rendering.
- [/] Polished UI for "Generating" and "Composing" phases.
- [ ] Final video playback and download.

### Phase 3: Virality & Sharing
- [ ] Share button with Twitter/X intent.
- [ ] Public video landing pages (`/v/[jobId]`).
- [ ] Thumbnail generation for social cards.

---

## Cost & Scalability

- **Operator Cost**: Near zero. All AI inference and rendering costs are either covered by the user's keys or lightweight free-tier quotas.
- **Rendering**: The external rendering server can be scaled independently of the frontend.
- **Storage**: Temporary storage on the rendering server for composition, with final results delivered as downloadable blobs or temporary URLs.

---

## Key Files & Responsibilities

- `src/components/trimmer/`: Handles the first interaction (upload/trim).
- `src/lib/transcribe/` & `src/lib/enrich/`: Interface with AI providers for content analysis.
- `src/components/video-generator/`: Orchestrates the segment generation and composition calls.
- `src/hooks/useMotionRenderer.ts`: Manages the WebSocket connection to the rendering service.
- `src/types/index.ts`: The source of truth for the project's data structures.
o post-MVP. Ken Burns converts surprisingly well for v1.