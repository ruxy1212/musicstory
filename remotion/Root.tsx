import { Composition } from "remotion";
import { FullComposition } from "../components/VideoGenerator";

const FPS = 30;

export function RemotionRoot() {
  return (
    <Composition
      id="FullVideo"
      component={FullComposition}
      durationInFrames={1800} // override dynamically via inputProps
      fps={FPS}
      width={704}
      height={512}
      defaultProps={{ results: [], audioUrl: null }}
    />
  );
}