import { Composition, getInputProps } from "remotion";
import { Scene } from "./scene/Scene";
import { SceneSpecSchema, type SceneSpec, FPS, WIDTH, HEIGHT } from "./scene/types";

const emptySpec: SceneSpec = {
  id: "placeholder",
  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  durationFrames: 60,
  tracks: [],
};

const parseSpec = (input: unknown): SceneSpec => {
  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return emptySpec;
  }
  return SceneSpecSchema.parse(input);
};

export const RemotionRoot: React.FC = () => {
  const input = getInputProps() as { spec?: unknown };
  const spec = parseSpec(input.spec);

  return (
    <Composition
      id="Overlay"
      component={Scene}
      durationInFrames={spec.durationFrames}
      fps={spec.fps}
      width={spec.width}
      height={spec.height}
      defaultProps={{ spec }}
    />
  );
};
