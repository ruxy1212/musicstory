// app/api/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import os from "os";
import fs from "fs/promises";

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { results, audioUrl } = await req.json();

  try {
    // Bundle the Remotion composition
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), "remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "FullVideo",
      inputProps: { results, audioUrl },
    });

    const outPath = path.join(os.tmpdir(), `composed_${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outPath,
      inputProps: { results, audioUrl },
    });

    const buffer = await fs.readFile(outPath);
    await fs.unlink(outPath); // clean up tmp file

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "inline",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}