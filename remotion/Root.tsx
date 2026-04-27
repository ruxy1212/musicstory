import { Composition } from "remotion";
import { FullComposition } from "@/components/video-generator/full-composition";

const FPS = 30;

export function RemotionRoot() {
  return (
    <Composition
      id="FullVideo"
      component={FullComposition as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={1800} // override dynamically via inputProps
      fps={FPS}
      width={704}
      height={512}
      defaultProps={{ results: [], audioUrl: null }}
    />
  );
}