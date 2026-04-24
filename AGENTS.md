# AGENTS.md — AI Music Video Generator

> This file is the authoritative guide for AI coding agents building this application.
> Read it fully before writing any code. Follow the phases in order. Do not skip ahead.

---

## Project Identity

**What it does:** Accepts a user-uploaded audio file, runs it through a multi-step AI pipeline, and returns a downloadable music video (static images + Ken Burns animation + original audio).

**Repository layout (target state):**

```
/
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                 # Clerk auth pages
│   ├── (dashboard)/
│   │   ├── page.tsx            # Upload + history UI
│   │   └── jobs/[id]/page.tsx  # Job status + video player
│   └── api/
│       ├── jobs/
│       │   ├── route.ts        # POST: create job
│       │   └── [id]/
│       │       └── status/route.ts  # GET: poll status
│       └── webhooks/
│           └── stripe/route.ts
├── worker/                     # Fly.io long-running process
│   ├── index.ts                # BullMQ worker entrypoint
│   ├── steps/
│   │   ├── validate.ts
│   │   ├── transcribe.ts
│   │   ├── analyse-scenes.ts
│   │   ├── generate-images.ts
│   │   └── ffmpeg-composite.ts
│   └── lib/
│       ├── r2.ts
│       ├── groq.ts
│       ├── fal.ts
│       └── ffmpeg.ts
├── lib/                        # Shared types + utilities
│   ├── db/
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── index.ts
│   ├── queue/
│   │   └── client.ts           # BullMQ queue client
│   └── types.ts
├── fly.toml                    # Fly.io worker config
├── next.config.ts
└── AGENTS.md                   # This file
```

---

## Stack (exact versions)

| Dependency | Version | Notes |
|---|---|---|
| next | 16.2.x | App Router, Turbopack, React Compiler |
| react + react-dom | 19.2.x | |
| typescript | 5.x | strict mode |
| tailwindcss | 4.1.x | CSS-first config, no tailwind.config.js |
| @tailwindcss/postcss | 4.x | Required for Next.js integration |
| framer-motion | 12.x | |
| drizzle-orm | latest | |
| @neondatabase/serverless | latest | Postgres driver |
| bullmq | 5.x | |
| @upstash/redis | latest | Redis client for rate limiting + BullMQ |
| @clerk/nextjs | latest | Auth |
| stripe | latest | |
| @aws-sdk/client-s3 | 3.x | R2 uses S3-compatible API |
| groq-sdk | latest | Whisper transcription |
| @fal-ai/client | latest | FLUX image generation |
| replicate | latest | SDXL-Turbo for free tier |
| @anthropic-ai/sdk | latest | Claude Haiku for scene analysis |
| fluent-ffmpeg | latest | FFmpeg wrapper (worker only) |
| aubio | latest (native binding) | Beat detection (worker only) |

**Do not use:** `multer`, `formidable`, `webpack` (Turbopack is the bundler), `tailwind.config.js` (use CSS `@theme` instead), `pages/` directory (use `app/`).

---

## Environment Variables

The agent must never hardcode secrets. All secrets come from `.env.local` (local) or the deployment environment (production). Required variables:

```bash
# Database
DATABASE_URL=                  # Neon Postgres connection string

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Queue / Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=                 # https://<bucket>.r2.dev or custom domain

# AI Services
GROQ_API_KEY=
ANTHROPIC_API_KEY=
FAL_KEY=
REPLICATE_API_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# Worker (Fly.io internal)
WORKER_SECRET=                 # Shared secret between Next.js and worker
```

---

## Phase 1 — Project Scaffold

**Goal:** Running Next.js 16 app with auth, database, and a working upload page that does nothing yet.

### 1.1 — Initialise the project

```bash
npx create-next-app@latest . \
  --typescript \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Install exact stack
npm install next@latest react@latest react-dom@latest
npm install tailwindcss@latest @tailwindcss/postcss@latest
npm install @clerk/nextjs drizzle-orm @neondatabase/serverless
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install bullmq @upstash/redis
npm install stripe framer-motion
npm install -D drizzle-kit @types/node typescript
```

### 1.2 — Configure Tailwind v4

Replace any generated Tailwind config files. Do not create `tailwind.config.js`.

In `postcss.config.mjs`:
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

In `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-brand: oklch(0.55 0.22 264);
  --color-brand-foreground: oklch(0.98 0.01 264);
}
```

There is no `@tailwind base/components/utilities` in v4. The single `@import` replaces all three.

### 1.3 — Configure Next.js

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFilesystemCache: true,
  },
  serverExternalPackages: ["fluent-ffmpeg", "aubio"],
};

export default nextConfig;
```

### 1.4 — Set up Drizzle + Neon

Create `lib/db/schema.ts` with the schema defined in the Implementation Plan. Run `drizzle-kit push` to create tables. Do not use Prisma.

### 1.5 — Set up Clerk

Wrap the app in `<ClerkProvider>` in `app/layout.tsx`. Add `middleware.ts` at the root to protect the dashboard route. Follow the Clerk Next.js 16 quickstart documentation — the App Router Clerk integration uses `auth()` as an async function in Next.js 16.

### 1.6 — Acceptance criteria (Phase 1 complete)

- `npm run dev` starts without errors.
- Navigating to `/` shows a landing page.
- Unauthenticated users are redirected to `/sign-in`.
- Authenticated users see a dashboard with an upload form (non-functional is fine).
- Database tables exist in Neon.

---

## Phase 2 — Upload + Job Creation

**Goal:** User uploads an audio file. A job record is created. The client polls for status.

### 2.1 — Upload API Route (`app/api/jobs/route.ts`)

- Method: `POST`
- Auth: require Clerk session via `auth()`. Return `401` if unauthenticated.
- Parse: use `Request.formData()` (native Web API — no multer).
- Validate:
  - File must be `audio/mpeg`, `audio/wav`, or `audio/mp4`.
  - Duration check: parse the file header server-side using `music-metadata` npm package to get duration. Return `400` if over tier limit.
  - Rate limit: check Upstash Redis for `ratelimit:{userId}` key. Free tier: 1/day. Pro: 10/month.
- Upload to R2: use `@aws-sdk/client-s3` with `PutObjectCommand`. R2 endpoint is `https://<accountId>.r2.cloudflarestorage.com`.
- Insert a `jobs` row with `status: 'queued'`.
- Enqueue a BullMQ job (`video-pipeline` queue) with the `jobId`.
- Return `{ jobId }` with `201`.

### 2.2 — Status API Route (`app/api/jobs/[id]/status/route.ts`)

- Method: `GET`
- Auth: require ownership — the job's `user_id` must match the authenticated user.
- Return: `{ status, signedUrl?, error? }`.
- On `status === 'done'`, include the signed R2 URL from the jobs table.

### 2.3 — Client polling

In the dashboard, after upload, poll `/api/jobs/{jobId}/status` every 3 seconds with exponential backoff (cap at 10 seconds). Use a React `useEffect` with a `setInterval`. Clear the interval when `status === 'done'` or `status === 'failed'`.

Display a progress stepper (Validate → Transcribe → Analyse → Generate Images → Render → Done) using the `status` field. Do not use a spinner that gives no information.

### 2.4 — Acceptance criteria (Phase 2 complete)

- Upload a valid MP3. The API returns a `jobId`.
- The job row exists in the database with `status: 'queued'`.
- The audio file exists in R2.
- The status endpoint returns `{ status: 'queued' }`.
- Uploading a file over the duration limit returns `400`.
- Uploading without auth returns `401`.

---

## Phase 3 — Worker Pipeline

**Goal:** The BullMQ worker processes jobs end-to-end. Real videos are produced.

The worker is a **separate Node.js process** in the `worker/` directory. It is not part of the Next.js application. It runs on Fly.io. It connects to the same Upstash Redis instance and the same Neon Postgres instance.

### 3.1 — Worker entrypoint (`worker/index.ts`)

```ts
import { Worker } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
  maxRetriesPerRequest: null,
});

const worker = new Worker("video-pipeline", async (job) => {
  const { jobId } = job.data;
  await runPipeline(jobId);
}, {
  connection,
  concurrency: 3,
});
```

Each step in `runPipeline` updates the job's `status` field in Postgres so the polling endpoint reflects real progress.

### 3.2 — Step: validate

Re-validate the audio file from R2 (duration, format). Update job status to `processing`. If validation fails, mark job `failed` with an error message.

### 3.3 — Step: transcribe (Pro only)

For Pro jobs: call Groq's Whisper API. Store segments in the `scenes` table (preliminary rows with `start_time`, `end_time` derived from word segments grouped into 4–6 scenes).

For Free jobs: use `aubio`'s beat detection on the audio file to produce 4 evenly-spaced scene cut points. No API call required.

```ts
// Free tier beat detection (no API cost)
import { Aubio } from "aubio";
const beats = await detectBeats(audioBuffer); // returns timestamp[]
const scenes = groupBeatsIntoScenes(beats, 4);
```

### 3.4 — Step: analyse-scenes

Call `claude-haiku-4` with the transcript text (Pro) or a minimal prompt (Free: "Generate 4 cinematic visual prompts for a music video. Mood: {genre}"). Use `cache_control` on the system prompt.

Parse the JSON response and update scene rows with `visual_prompt`.

### 3.5 — Step: generate-images

Fan out — one sub-job per scene. Run up to 3 in parallel using `Promise.allSettled`.

**Free:** Replicate SDXL-Turbo.
```ts
const output = await replicate.run("stability-ai/sdxl-turbo", {
  input: { prompt: scene.visual_prompt, num_inference_steps: 4 }
});
```

**Pro:** fal.ai FLUX.1-schnell.
```ts
const result = await fal.subscribe("fal-ai/flux/schnell", {
  input: { prompt: scene.visual_prompt, image_size: "landscape_16_9" }
});
```

Download each image and upload to R2 at `jobs/{jobId}/scene-{n}.png`.

### 3.6 — Step: ffmpeg-composite

Ensure `ffmpeg` is installed on the Fly.io machine (`apt-get install ffmpeg` in the Dockerfile).

**Per-scene Ken Burns clip:**
```bash
ffmpeg -loop 1 -i /tmp/scene-{n}.png \
  -vf "scale=8000:-1,zoompan=z='min(zoom+0.0015,1.5)':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={resolution}" \
  -t {duration} -r {fps} -c:v libx264 -pix_fmt yuv420p /tmp/scene-{n}.mp4
```

Where `{frames}` = `duration × fps`, `{resolution}` = `854x480` (Free) or `1920x1080` (Pro), `{fps}` = `24` (Free) or `30` (Pro).

**Mux:**
```bash
# Write concat.txt
ffmpeg -f concat -safe 0 -i /tmp/concat.txt \
  -i /tmp/audio.mp3 \
  -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k -shortest \
  /tmp/final.mp4
```

**Watermark (Free only):**
```bash
ffmpeg -i /tmp/final-raw.mp4 \
  -vf "drawtext=text='made with rhythmvid.com':fontsize=18:fontcolor=white@0.5:x=w-tw-20:y=h-th-20" \
  /tmp/final.mp4
```

Upload `/tmp/final.mp4` to R2 at `jobs/{jobId}/final.mp4`.

### 3.7 — Step: deliver

Generate a signed R2 URL using `@aws-sdk/s3-request-presigner`:
```ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const url = await getSignedUrl(s3Client, new GetObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: `jobs/${jobId}/final.mp4`,
}), { expiresIn: tier === "pro" ? 60 * 60 * 24 * 30 : 60 * 60 * 24 });
```

Update the jobs row: `status: 'done'`, `signed_url: url`, `expires_at`.

Clean up `/tmp` files on the Fly.io machine.

### 3.8 — Acceptance criteria (Phase 3 complete)

- Submitting a job from the UI results in a downloadable video within 90 seconds (free tier).
- Scene images visually reflect the lyric/beat content.
- Free-tier video has a watermark; Pro does not.
- FFmpeg unit tests pass: clip duration is within 50ms of target.
- Retry test passes: simulated Replicate 500 error is retried and eventually succeeds.

---

## Phase 4 — Billing

**Goal:** Stripe checkout + webhook. Pro tier unlocks higher limits in the pipeline.

### 4.1 — Stripe products

Create two products in Stripe dashboard:
- **Pro Monthly:** $12/month, recurring. Store the price ID in `STRIPE_PRO_PRICE_ID`.

### 4.2 — Checkout flow

Add a "Upgrade to Pro" button in the dashboard. Clicking it calls a Server Action that creates a Stripe Checkout Session (`mode: 'subscription'`) and redirects the user.

```ts
// app/actions/billing.ts
"use server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId },
  });
  redirect(session.url!);
}
```

### 4.3 — Stripe webhook (`app/api/webhooks/stripe/route.ts`)

Handle these events:
- `checkout.session.completed` → update `users.tier = 'pro'`, store `stripe_customer_id`.
- `customer.subscription.deleted` → update `users.tier = 'free'`, reset monthly video count.

Always verify the Stripe signature before processing. Use `stripe.webhooks.constructEvent`.

### 4.4 — Acceptance criteria (Phase 4 complete)

- Completing Stripe checkout sets `tier = 'pro'` in the database.
- Pro users can upload 30-second clips (free users are blocked at 15 seconds).
- Pro users get FLUX.1-schnell images and 1080p output.
- Cancelling a subscription downgrades the user to free.

---

## Phase 5 — Share Flow (Virality)

**Goal:** Every completed video has a share button that drives organic acquisition.

### 5.1 — Share card

On the job result page, render a `<canvas>` that composites a thumbnail frame from the video and the app wordmark. Use the Canvas API, not a server-side image library.

### 5.2 — Twitter/X intent

```ts
const text = encodeURIComponent("Just made this music video with AI ✨ @rhythmvid");
const url = encodeURIComponent(`https://rhythmvid.com/v/${jobId}`);
window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
```

### 5.3 — Public job page (`app/v/[jobId]/page.tsx`)

A public-facing page that embeds the video player and a call-to-action to sign up. Does not require auth to view. The signed URL must be valid (check `expires_at`). If expired, show a "Video expired" message with a CTA.

Track views using a simple `increment` on a `job_views` column.

### 5.4 — Acceptance criteria (Phase 5 complete)

- Clicking "Share to X" opens a pre-composed tweet with the job URL.
- Navigating to `/v/{jobId}` without being logged in shows the video and a signup CTA.
- The UTM parameter `?ref=share` is present in the signup URL on the public page.

---

## Phase 6 — Hardening

**Goal:** The app is production-ready. No crashes, no silent failures, no runaway API costs.

### 6.1 — Cost circuit breaker

In the worker, before calling any paid AI API, check that the job's accumulated `cost_cents` has not exceeded the tier ceiling:
- Free: $0.10 (hard stop — refund if exceeded).
- Pro: $0.50 (alert + continue).

If the ceiling is exceeded, mark the job failed with `reason: 'cost_limit_exceeded'` and notify the user.

### 6.2 — Dead-letter queue

Configure BullMQ to move jobs to a `video-pipeline-failed` queue after 3 attempts. Add a simple admin UI (protected by Clerk `orgRole`) that lists dead-letter jobs and allows manual retry or refund.

### 6.3 — R2 lifecycle rules

Configure the R2 bucket with lifecycle rules via the Cloudflare dashboard:
- Delete `jobs/*/audio.mp3`, `jobs/*/scene-*.png`, `jobs/*/scene-*.mp4` after 1 day.
- Delete `jobs/*/final.mp4` after 7 days (Free) or 30 days (Pro).

The Pro/Free distinction is handled by the worker writing different metadata tags to the R2 object; the lifecycle rule filters by tag.

### 6.4 — Observability

Use `@vercel/analytics` for page-level metrics. Use `pino` for structured logging in the worker. Ship worker logs to Fly.io's built-in log aggregation. Add Sentry (`@sentry/nextjs`) for error tracking in both the Next.js app and the worker.

### 6.5 — Acceptance criteria (Phase 6 complete)

- A mock $0.15 accumulated cost on a free job causes the job to fail gracefully.
- Failed jobs appear in the admin dead-letter view.
- R2 console shows no intermediate files older than 25 hours.
- Sentry captures and groups errors from both the Next.js app and the worker.

---

## Coding Conventions for Agents

- All files use TypeScript with `strict: true`. No `any`. Use `unknown` + type guards.
- Server Actions are in `app/actions/*.ts` with `"use server"` directive at the top of the file.
- Route Handlers return `Response` objects. Use `NextResponse` only when you need cookies or redirects.
- In Next.js 16, `params` in `page.tsx` and `layout.tsx` are `Promise<{...}>` — always `await` them.
- Database queries use Drizzle ORM. No raw SQL except in migrations.
- Do not use `console.log` in production paths. Use `pino` in the worker; use `console.error` sparingly in API routes.
- Environment variables are accessed via `process.env.VAR_NAME!` — always assert non-null. If a variable is required and missing, throw at startup, not at runtime.
- Never import worker-only packages (`fluent-ffmpeg`, `aubio`) into the Next.js app bundle. They are `serverExternalPackages` and only execute in the worker process.
- All monetary values are stored in cents (integers). Never use floats for money.
- Use `Promise.allSettled` (not `Promise.all`) when fanning out scene image generation, so a single scene failure does not abort the whole job.

---

## Deployment

### Next.js app → Vercel

```bash
vercel deploy --prod
```

Set all environment variables in the Vercel dashboard. The `worker/` directory is excluded from the Vercel build via `.vercelignore`.

### Worker → Fly.io

```toml
# fly.toml
app = "rhythmvid-worker"
primary_region = "iad"

[build]
  dockerfile = "worker/Dockerfile"

[[services]]
  internal_port = 3001
  protocol = "tcp"

[env]
  NODE_ENV = "production"
```

```dockerfile
# worker/Dockerfile
FROM node:22-slim
RUN apt-get update && apt-get install -y ffmpeg aubio-tools && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY worker/package.json worker/package-lock.json ./
RUN npm ci --omit=dev
COPY worker/ .
RUN npm run build
CMD ["node", "dist/index.js"]
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