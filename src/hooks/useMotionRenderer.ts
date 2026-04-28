import { useState, useCallback, useRef, useEffect } from 'react';
import type { ResultClean, RenderProgress } from '@/types';

export function useRemotionRender(serverHost = 'localhost:3001') {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<RenderProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to store the socket so we can close it if the user navigates away
  const socketRef = useRef<WebSocket | null>(null);

  const startRender = useCallback((
    results: ResultClean[],
    audioUrl: string | null,
    setUrl: (url: string) => void
  ) => {
    if (!serverHost) {
      setError("Server URL is not configured");
      return;
    }

    setIsRendering(true);
    setProgress(0);
    setStatus({ stage: 'started' });
    setError(null);

    // Determine protocol (wss for production https, ws for local http)
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${serverHost}`);
    socketRef.current = socket;

    socket.onopen = () => {
      // Send the initial render command
      socket.send(JSON.stringify({
        type: "START_RENDER",
        results,
        audioUrl
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data: RenderProgress = JSON.parse(event.data);
        setStatus(data);

        if (data.progress !== undefined) {
          setProgress(data.progress);
        }

        if (data.stage === "complete" && data.videoUrl) {
          setUrl(data.videoUrl);
          setIsRendering(false);
          socket.close(); // Clean up
        }

        if (data.stage === "error") {
          setError(data.message ?? "Render failed");
          setIsRendering(false);
          socket.close();
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("[WS] Socket error:", err);
      setError("WebSocket connection failed. Check if server is awake.");
      setIsRendering(false);
    };

    socket.onclose = () => {
      console.log("[WS] Connection closed");
      setIsRendering(false);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return { isRendering, progress, status, error, startRender };
}