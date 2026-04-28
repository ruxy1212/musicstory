import { RenderProgress } from "@/types";

interface ComposedVideoProps {
  isRendering: boolean
  progress: number
  status: RenderProgress | null
  error: string | null
  composedVideoUrl: string | null
}

export default function ComposedVideo({ composedVideoUrl, isRendering, progress, status, error }: ComposedVideoProps) {

  function handleDownload() {
    if (!composedVideoUrl) return;
    const a = document.createElement("a");
    a.href = composedVideoUrl;
    a.download = "composed_video.mp4";
    a.click();
  }

  return (
    <div>
      {isRendering ? (
        <>
          {status && (
            <div>
              <p>Status: {status.stage}</p>
              {status.stage === 'rendering' && <progress value={progress} max={100} />}
              <p>{progress}%</p>
            </div>
          )}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </>
      ) : (
        <>
          {composedVideoUrl && <video src={composedVideoUrl} controls />}
          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#e8e8e0",
                border: "0.5px solid #ffffff33",
                borderRadius: 6,
                fontFamily: "inherit",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Download MP4
            </button>
          </div>
        </>
      )}
    </div>
  )
}