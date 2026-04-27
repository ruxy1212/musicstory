import { CompositionProps } from "@/types";
import { AbsoluteFill, Html5Video, Html5Audio, useVideoConfig } from "remotion";

const FALLBACK_COLOR = "#0a0a0a";

function SegmentClip({
  videoUrl,
  failed,
  text,
}: {
  videoUrl: string | null;
  durationInFrames: number;
  failed: boolean;
  text: string;
}) {
  if (!failed && videoUrl) {
    return (
      <AbsoluteFill>
        <Html5Video src={videoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }
  // Fallback for failed segments: dark slate with the lyric text
  return (
    <AbsoluteFill
      style={{
        background: FALLBACK_COLOR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <p
        style={{
          color: "#ffffff88",
          fontFamily: "Georgia, serif",
          fontSize: 28,
          textAlign: "center",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </AbsoluteFill>
  );
}

export function FullComposition({ results, audioUrl }: CompositionProps) {
  const { fps } = useVideoConfig();
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {results.map((r) => {
        const duration = Math.round((r.segment.end - r.segment.start) * fps);
        const from = currentFrame;
        currentFrame += duration;

        return (
          <AbsoluteFill key={r.index} style={{ opacity: 1 }}>
            {/* Only render when it's this clip's turn */}
            <SegmentClip
              videoUrl={r.videoUrl}
              durationInFrames={duration}
              failed={r.failed}
              text={r.segment.text}
            />
          </AbsoluteFill>
        );
      })}
      {audioUrl && (
        <Html5Audio src={audioUrl} />
      )}
    </AbsoluteFill>
  );
}