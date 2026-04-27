export default function ComposedVideo({ composedVideoUrl }: { composedVideoUrl: string | null }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Final composition
      </p>
      <video
        src={composedVideoUrl || ""}
        controls
        controlsList="nodownload"
        autoPlay
        loop
        playsInline
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 10,
          background: "#000",
          display: "block",
        }}
      />
    </div>
  )
}