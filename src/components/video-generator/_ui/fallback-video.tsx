import { SegmentResult } from "@/types";

export default function Fallback({ results }: { results: SegmentResult[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {results.map((r, i) =>
        r.videoUrl ? (
          <div key={i}>
            <p style={{ fontSize: 11, color: "#555", margin: "0 0 4px" }}>
              Scene {String(i + 1).padStart(2, "0")}
            </p>
            <video
              src={r.videoUrl}
              controls
              controlsList="nodownload"
              style={{ width: "100%", maxWidth: 480, borderRadius: 8 }}
            />
          </div>
        ) : null
      )}
    </div>
  )
}