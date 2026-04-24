# AI Music Video Generator — Implementation Plan (v2)

> **Revised:** April 2026 | **Stack:** Next.js 16.2 · Tailwind CSS v4.1 · React 19.2 · TypeScript 5.x

---

## Overview

A web application that generates a short AI-driven music video from a user-uploaded audio clip. The architecture is optimised for minimal cost-per-video while maintaining a product experience compelling enough to convert free users into paying subscribers.

---

## Key Decisions vs. v1

| Topic | v1 (original) | v2 (this plan) |
|---|---|---|
| Storage | Cloudinary | Cloudflare R2 |
| Image gen (free) | SDXL-Turbo via Replicate | SDXL-Turbo via Replicate (unchanged) |
| Image gen (paid) | DALL-E 3 | FLUX.1-schnell via fal.ai |
| Animation | Runway / Luma (Premium) | Ken Burns FFmpeg only (MVP) |
| Transcription | Whisper via Replicate | Groq Whisper API |
| Job queue | Inngest / Trigger.dev | BullMQ on Upstash Redis |
| FFmpeg runtime | Serverless lambda | Persistent Fly.io worker |
| Tiers | Free / Basic / Premium (3) | Free / Pro (2) |
| Subscription | Stripe | Stripe (unchanged) |

---

## Architecture

### Framework: Next.js 16.2 (App Router)

- **Frontend:** React 19.2 + Tailwind CSS v4.1 (CSS-first config, `@import "tailwindcss"`) + Framer Motion v12.
- **Backend:** Route Handlers (`app/api/`) for ingestion and webhooks. Server Actions for auth state and subscriptions.
- **Bundler:** Turbopack (stable default in 16.x) with file-system caching enabled.
- **React Compiler:** Enabled in `next.config.ts` for automatic memoisation.

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFilesystemCache: true,
  },
};

export default nextConfig;
```

### Storage: Cloudflare R2

All intermediate assets and the final muxed video are stored in R2. There are zero egress fees when delivered via a Cloudflare Workers URL or a signed `r2.dev` URL. Assets are tagged with a TTL metadata field; a daily R2 lifecycle rule hard-deletes intermediate files (audio chunks, raw images) after 24 hours and final videos after 7 days unless the user has a Pro subscription.

```
bucket/
  jobs/{jobId}/
    audio.mp3          ← original upload, deleted at 24h
    scene-{n}.png      ← generated frames, deleted at 24h
    scene-{n}.mp4      ← ffmpeg per-scene clips, deleted at 24h
    final.mp4          ← delivered video, retained 7d (Pro: 30d)
```

### Job Queue: BullMQ on Upstash Redis

BullMQ provides retry logic, per-step concurrency limits, and job lifecycle events without a separate SaaS bill. Upstash Redis free tier handles up to 10,000 commands/day — sufficient for early-stage traffic. Migrate to Trigger.dev when you need multi-region job routing or long-form audit logs.

```
Queue: video-pipeline
  Job steps (each retryable independently):
    1. validate
    2. transcribe
    3. analyse-scenes
    4. generate-images   (parallel, one worker per scene)
    5. ffmpeg-composite
    6. deliver
```

### FFmpeg Runtime: Fly.io Worker

A single `fly.io` machine (shared-cpu-1x, 256 MB, ~$3/month) running a long-lived Node.js process handles all FFmpeg operations. It pulls jobs from BullMQ, processes them locally to `/tmp`, and streams the result to R2. No cold starts. No Lambda binary-size limits.

---

## Cost Model

All estimates assume a 15-second free video with 4 scenes.

| Step | Service | Cost |
|---|---|---|
| Audio upload (5 MB) | R2 PUT | ~$0.000005 |
| Transcription (15s) | Groq Whisper | ~$0.001 |
| Scene analysis (LLM) | Claude Haiku (prompt-cached) | ~$0.001 |
| Image gen × 4 (Free) | SDXL-Turbo @ Replicate | ~$0.016 |
| Image gen × 4 (Pro) | FLUX.1-schnell @ fal.ai | ~$0.012 |
| FFmpeg composite | Fly.io (amortised) | ~$0.005 |
| R2 storage + egress | Cloudflare R2 | ~$0.001 |
| **Free total** | | **~$0.024** |
| **Pro total (30s, 6 scenes)** | | **~$0.05–0.08** |

Pro tier at $12/month with a 10 video/month allowance yields ~$11.20–11.50 gross margin per subscriber.

---

## Subscription Tiers (MVP)

### Free

- 15-second maximum audio.
- SDXL-Turbo 512×512 images.
- Ken Burns (pan-and-scan) animation via FFmpeg.
- 480p · 24 fps output.
- Watermark in bottom-right corner.
- 1 video per day per account.
- Signed R2 URL, expires in 24 hours.

### Pro ($12/month)

- 30-second maximum audio.
- FLUX.1-schnell 1024×1024 images.
- Beat-synced Ken Burns (tempo detection via `aubio`).
- 1080p · 30 fps output.
- No watermark.
- 10 videos per month.
- Signed R2 URL, expires in 30 days.
- Priority queue position.

> **Future tiers (post-MVP):** A "Cinema" tier adding SVD/Runway motion and 60-second clips should only be introduced after Pro validates willingness-to-pay. The per-video cost with AI motion models is $3–5; pricing and margin math must be reworked before launch.

---

## The AI Pipeline

### Step 0 — Upload & Validation (API Route)

- Accept `multipart/form-data`. Parse with the Web Streams API (no `multer`).
- Backend validates: file is MP3/WAV/M4A, duration ≤ tier limit, rate limit not exceeded (checked against Upstash Redis).
- Upload raw audio to R2 at `jobs/{jobId}/audio.mp3`.
- Enqueue a BullMQ job and return `{ jobId }` to the client.
- Client polls `/api/jobs/[jobId]/status` with exponential backoff.

### Step 1 — Transcription (Groq Whisper)

> Skipped for free-tier users on 15-second clips. Use `aubio` beat detection to cut scene boundaries instead, saving ~$0.002 per video.

For Pro users: call Groq's `whisper-large-v3-turbo` endpoint. Average latency is 1–2 seconds for a 30-second clip. Response returns word-level timestamps.

```ts
const { text, segments } = await groq.audio.transcriptions.create({
  file: audioStream,
  model: "whisper-large-v3-turbo",
  response_format: "verbose_json",
  timestamp_granularities: ["word"],
});
```

### Step 2 — Scene Analysis (Claude Haiku with Prompt Caching)

Feed the transcript (or beat timestamps for free tier) to `claude-haiku-4` with a cached system prompt. Request a JSON array of scenes. Use `max_tokens: 512` — the output is small.

```ts
const scenes: Scene[] = [
  {
    start_time: 0,
    end_time: 3.8,
    duration: 3.8,
    visual_prompt: "Close-up of rain on a window, neon reflections, cinematic",
    mood: "melancholy",
  },
  // ...
];
```

The system prompt is ~800 tokens and is identical for every request — cache it using the `cache_control: { type: "ephemeral" }` beta header. First call costs ~$0.002; subsequent calls in the same 5-minute window cost ~$0.0002.

### Step 3 — Image Generation (Tier-Dependent)

All image requests are fanned out in parallel — one BullMQ job per scene, capped at 3 concurrent workers to avoid rate limits.

**Free:** Replicate `stability-ai/sdxl-turbo` with `num_inference_steps: 4`. Returns a 512×512 PNG in ~1.5 seconds.

**Pro:** fal.ai `fal-ai/flux/schnell` at 1024×1024. Returns in ~2 seconds. Cost is $0.003 per image.

### Step 4 — FFmpeg Composite (Fly.io Worker)

The Fly.io worker pulls completed scene jobs and runs a two-pass FFmpeg pipeline:

**Pass 1 — per-scene clip:** Apply a Ken Burns filter (slow pan + slight zoom) timed exactly to `scene.duration`. For Pro, apply tempo-synced keyframe positions using beat timestamps.

```bash
ffmpeg -loop 1 -i scene-0.png \
  -vf "scale=8000:-1,zoompan=z='min(zoom+0.0015,1.5)':d=96:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080" \
  -t 3.8 -r 30 -c:v libx264 -pix_fmt yuv420p scene-0.mp4
```

**Pass 2 — mux:** Concatenate all clips, mux with original audio.

```bash
ffmpeg -f concat -safe 0 -i concat.txt \
  -i audio.mp3 \
  -map 0:v -map 1:a \
  -c:v copy -c:a aac -shortest \
  final.mp4
```

Upload `final.mp4` to R2, mark job as complete, emit a status event.

### Step 5 — Delivery

Generate a signed R2 URL (24h for free, 30d for Pro). Store the URL in the job record in the database. The polling endpoint returns this URL on job completion. The client renders a video player inline.

---

## Data Model (PostgreSQL via Neon)

```sql
-- Users managed by Clerk/Auth.js
users (id, email, stripe_customer_id, tier, videos_this_month, created_at)

-- One row per generation request
jobs (
  id          uuid primary key,
  user_id     uuid references users,
  status      text,  -- queued | processing | done | failed
  tier        text,  -- free | pro
  r2_key      text,  -- final video path
  signed_url  text,  -- pre-signed delivery URL
  expires_at  timestamptz,
  cost_cents  int,   -- actual API cost for audit
  created_at  timestamptz,
  updated_at  timestamptz
)

-- One row per scene within a job
scenes (
  id            uuid primary key,
  job_id        uuid references jobs,
  index         int,
  start_time    float,
  end_time      float,
  visual_prompt text,
  r2_image_key  text,
  r2_clip_key   text
)
```

---

## Virality Loop

The single highest-ROI feature for free-to-paid conversion is a **share button** on the result screen. Clicking it generates a Twitter/X-ready card image (a thumbnail from the video + the app branding), opens a pre-composed tweet, and tracks the referral with a UTM parameter. Every shared video is an acquisition event.

**Build the share flow before you build any Pro-only features.**

---

## Verification Plan

### Automated

- **FFmpeg wrapper unit tests:** Assert that output clip duration matches `scene.duration` to within 50ms.
- **BullMQ retry test:** Mock a Replicate 500 error on step 3 and assert the job retries twice and eventually completes (or moves to the dead-letter queue after 3 failures).
- **Rate limit test:** Fire 5 requests from the same IP within 60 seconds and assert the 5th returns `429`.

### Manual

- Upload a 15-second clip, verify the full pipeline completes in under 90 seconds.
- Inspect the delivered video: scene cuts should align with lyric/beat boundaries to within ±0.5 seconds.
- Verify watermark appears on free-tier output and is absent on Pro output.
- Verify R2 signed URL returns `403` after its expiry window.

---

## Open Questions (Resolved)

1. **Storage tier:** Use Cloudflare R2 with zero egress fees. No Cloudinary.
2. **Maximum length:** 15 seconds (Free), 30 seconds (Pro) for the MVP. 60-second support deferred.
3. **Job queue provider:** BullMQ on Upstash Redis. Trigger.dev when needed at scale.
4. **AI motion models:** Deferred to post-MVP. Ken Burns converts surprisingly well for v1.